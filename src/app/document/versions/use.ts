import { useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import { createBranchActions } from '@/app/document/versions/branches'
import { agentChanges } from '@/app/document/versions/bursts'
import type { EditorStore } from '@/app/editor/active-store'

import {
  commitVersion,
  connectGitRemote,
  readGitBranches,
  type GitBranches,
  pullVersions,
  pushVersions,
  readGitHistory,
  readGitIdentity,
  readGitRemote,
  readGitStatus,
  restoreVersion,
  saveGitIdentity,
  sortChanges,
  startGitRepository,
  type GitCommit,
  type GitIdentity,
  type GitStatus,
  versionBursts,
  versionMessage
} from './git'

export type DocumentVersions = ReturnType<typeof useDocumentVersions>
export type VersionsState = 'unsaved' | 'untracked' | 'tracked' | 'loading'
type Operation =
  | 'branch'
  | 'commit'
  | 'connect'
  | 'identity'
  | 'init'
  | 'merge'
  | 'pull'
  | 'push'
  | 'restore'
  | 'review'
  | 'switch'

/**
 * The versions panel's workflow for one document: whether its file is in a repository, what
 * changed, its history, and recording, fetching or publishing versions. Recording a version
 * saves the document first, so the version holds what is on screen, and publishes it when the
 * folder is connected to a remote.
 */
export function useDocumentVersions(store: EditorStore) {
  const status = ref<GitStatus | null>(null)
  const history = ref<GitCommit[]>([])
  const remote = ref<string | null>(null)
  const identity = ref<GitIdentity | null>(null)
  const loaded = ref(false)
  const running = ref<Operation | null>(null)
  const error = ref('')
  const message = ref('')
  const path = ref(store.getDocumentFilePath())
  const branches = ref<GitBranches | null>(null)

  const state = computed<VersionsState>(() => {
    if (!path.value) return 'unsaved'
    if (!loaded.value) return 'loading'
    return status.value ? 'tracked' : 'untracked'
  })
  const changes = computed(() =>
    status.value && path.value ? sortChanges(status.value.files, status.value.root, path.value) : []
  )
  const unsaved = computed(() => store.hasUnsavedChanges())
  /** Git refuses to record a version it cannot sign with a name and an e-mail. */
  const needsIdentity = computed(
    () => identity.value !== null && !(identity.value.name && identity.value.email)
  )
  const canCommit = computed(
    () =>
      running.value === null &&
      !needsIdentity.value &&
      message.value.trim().length > 0 &&
      (changes.value.length > 0 || unsaved.value)
  )

  async function refresh(): Promise<void> {
    path.value = store.getDocumentFilePath()
    const current = path.value
    if (!current) {
      loaded.value = true
      status.value = null
      history.value = []
      remote.value = null
      identity.value = null
      return
    }
    try {
      const next = await readGitStatus(current)
      if (current !== path.value) return
      status.value = next
      history.value = next ? await readGitHistory(current) : []
      remote.value = next ? await readGitRemote(current) : null
      identity.value = next ? await readGitIdentity(current) : null
      // A desktop build older than branches has no answer: the rest of the panel still works.
      branches.value = next ? await readGitBranches(current).catch(() => null) : null
      error.value = ''
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      loaded.value = true
    }
  }

  async function run(operation: Operation, action: (documentPath: string) => Promise<void>) {
    const current = path.value
    if (!current || running.value) return
    running.value = operation
    error.value = ''
    try {
      await action(current)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      running.value = null
      // Reading the repository again must not clear what the operation reported.
      const failure = error.value
      await refresh()
      if (failure) error.value = failure
    }
  }

  /** Agents that changed the document since its latest version, which the next one credits. */
  function agentsSinceLastVersion(): string[] {
    const since = (history.value[0]?.time ?? 0) * 1000
    return agentChanges(store.graph)
      .value.filter((change) => change.lastAt > since)
      .map((change) => change.agentName)
  }

  /**
   * Saves the document so git sees what is on screen. A save that fails or is cancelled stops
   * the operation: a version without the latest edits, or a restore that reloads over them,
   * would lose them.
   */
  async function saveFirst(): Promise<void> {
    if (!store.hasUnsavedChanges()) return
    if (!(await store.saveFigFile()) || store.hasUnsavedChanges())
      throw new Error('The document could not be saved, so nothing was changed.')
  }

  async function record(documentPath: string, text: string): Promise<void> {
    await saveFirst()
    await commitVersion(documentPath, versionMessage(text, agentsSinceLastVersion()))
  }

  const commit = () =>
    run('commit', async (documentPath) => {
      await record(documentPath, message.value)
      message.value = ''
      // Once the folder is connected online, a recorded version goes there too: nothing to remember.
      if (remote.value) await pushVersions(documentPath)
    })

  /**
   * Puts the document back to a version. What is there now is recorded first, so the restore
   * loses nothing and is itself a version that can be undone by restoring the one before it.
   */
  const restore = (version: GitCommit, labels: { before: string; restored: string }) =>
    run('restore', async (documentPath) => {
      await saveFirst()
      const before = await readGitStatus(documentPath)
      if (before && before.files.length > 0) await record(documentPath, labels.before)
      await restoreVersion(documentPath, version.hash)
      const after = await readGitStatus(documentPath)
      if (after && after.files.length > 0) await commitVersion(documentPath, labels.restored)
      await store.reloadFromDisk()
      if (remote.value) await pushVersions(documentPath)
    })

  const branchActions = createBranchActions({
    store,
    run,
    saveFirst,
    record,
    remote
  })

  // A save changes the file on disk: what changed is read again.
  watch(unsaved, (now, before) => {
    if (before && !now) void refresh()
  })
  // Edits made in another app, such as a commit from a terminal, show when the window returns.
  useEventListener(window, 'focus', () => void refresh())
  void refresh()

  return {
    path,
    state,
    status,
    changes,
    history,
    remote,
    identity,
    needsIdentity,
    unsaved,
    running,
    error,
    message,
    canCommit,
    refresh,
    commit,
    restore,
    branches,
    ...branchActions,
    bursts: computed(() => versionBursts(history.value)),
    start: () => run('init', startGitRepository),
    pull: () => run('pull', pullVersions),
    push: () => run('push', pushVersions),
    connect: (url: string) => run('connect', (documentPath) => connectGitRemote(documentPath, url)),
    saveIdentity: (name: string, email: string) =>
      run('identity', (documentPath) => saveGitIdentity(documentPath, name, email))
  }
}
