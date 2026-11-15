import { useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import { isKalkaFolderPath, listFolderFiles } from '@/app/document/io/kalka-folder'
import { changeKind } from '@/app/document/versions/git'
import type { DocumentVersions } from '@/app/document/versions/use'

import { folderChanges, folderRows } from './tree'

/** `archive` is a document saved as one `.kalka` file: it has no folder to show. */
export type FolderState = 'unsaved' | 'archive' | 'loading' | 'ready'

/**
 * The files of the folder a document is saved in, as a tree, with what Git says changed. Read
 * again after a save and when the window returns, as the versions are.
 */
export function useDocumentFolder(versions: DocumentVersions) {
  const files = ref<string[]>([])
  const loaded = ref(false)
  const error = ref('')
  const collapsed = ref(new Set<string>())
  const folder = computed(() =>
    isKalkaFolderPath(versions.path.value) ? versions.path.value : null
  )

  const state = computed<FolderState>(() => {
    if (!versions.path.value) return 'unsaved'
    if (!folder.value) return 'archive'
    return loaded.value ? 'ready' : 'loading'
  })
  const changes = computed(() => {
    const status = versions.status.value
    if (!status || !folder.value) return new Map()
    return folderChanges(status.files, status.root, folder.value, (code) => changeKind(code).kind)
  })
  const rows = computed(() => folderRows(files.value, changes.value, collapsed.value))

  async function refresh(): Promise<void> {
    const current = folder.value
    if (!current) {
      files.value = []
      return
    }
    try {
      const next = await listFolderFiles(current)
      if (current !== folder.value) return
      files.value = next
      error.value = ''
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      loaded.value = true
    }
  }

  function toggle(path: string): void {
    const next = new Set(collapsed.value)
    if (!next.delete(path)) next.add(path)
    collapsed.value = next
  }

  watch(folder, () => void refresh(), { immediate: true })
  // A save rewrites the folder; Git's own answer arrives with the same refresh of the versions.
  watch(versions.status, () => void refresh())
  useEventListener(window, 'focus', () => void refresh())

  return { state, folder, rows, collapsed, error, toggle, refresh }
}
