import { useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'

import {
  commitVersion,
  pullVersions,
  pushVersions,
  readGitHistory,
  readGitStatus,
  sortChanges,
  startGitRepository,
  type GitCommit,
  type GitStatus
} from './git'

export type VersionsState = 'unsaved' | 'untracked' | 'tracked' | 'loading'
type Operation = 'commit' | 'init' | 'pull' | 'push'

/**
 * The versions panel's workflow for one document: whether its file is in a repository, what
 * changed, its history, and recording, fetching or publishing versions. Recording a version
 * saves the document first, so the version holds what is on screen.
 */
export function useDocumentVersions(store: EditorStore) {
  const status = ref<GitStatus | null>(null)
  const history = ref<GitCommit[]>([])
  const loaded = ref(false)
  const running = ref<Operation | null>(null)
  const error = ref('')
  const message = ref('')
  const path = ref(store.getDocumentFilePath())

  const state = computed<VersionsState>(() => {
    if (!path.value) return 'unsaved'
    if (!loaded.value) return 'loading'
    return status.value ? 'tracked' : 'untracked'
  })
  const changes = computed(() =>
    status.value && path.value ? sortChanges(status.value.files, status.value.root, path.value) : []
  )
  const unsaved = computed(() => store.hasUnsavedChanges())
  const canCommit = computed(
    () =>
      running.value === null &&
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
      return
    }
    try {
      const next = await readGitStatus(current)
      if (current !== path.value) return
      status.value = next
      history.value = next ? await readGitHistory(current) : []
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
      await refresh()
    }
  }

  const commit = () =>
    run('commit', async (documentPath) => {
      if (store.hasUnsavedChanges()) await store.saveFigFile()
      await commitVersion(documentPath, message.value)
      message.value = ''
    })

  // A save changes the file on disk: what changed is read again.
  watch(unsaved, (now, before) => {
    if (before && !now) void refresh()
  })
  // Edits made in another app, such as a commit from a terminal, show when the window returns.
  useEventListener(window, 'focus', () => void refresh())
  void refresh()

  return {
    state,
    status,
    changes,
    history,
    unsaved,
    running,
    error,
    message,
    canCommit,
    refresh,
    commit,
    start: () => run('init', startGitRepository),
    pull: () => run('pull', pullVersions),
    push: () => run('push', pushVersions)
  }
}
