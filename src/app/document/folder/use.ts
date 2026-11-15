import { useEventListener } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'

import { KALKA_PROJECT_FILE, writeKalkaFolder } from '@kalka/core/io/formats/kalka'

import { pageHTMLCode } from '@/app/code/generated'
import { isKalkaFolderPath, joinFolderPath, listFolderFiles } from '@/app/document/io/kalka-folder'
import { changeKind, type GitChangeKind } from '@/app/document/versions/git'
import type { DocumentVersions } from '@/app/document/versions/use'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import { folderChanges, folderRows } from './tree'
import { fileKind, pageOfFile, type FolderFile } from './view'

/**
 * `disk` is the folder the document is saved in, on this computer. `document` is the folder
 * Kalka would write for it: what a browser, an unsaved document or a `.kalka` file can show.
 */
export type FolderSource = 'disk' | 'document'

const decoder = new TextDecoder()

/** Folders with too many rows to be worth opening before they are asked for. */
const COLLAPSED_AT_FIRST = ['assets']

/**
 * The files of a document's folder as a tree, with what Git says changed when the folder is on
 * this computer. The folder on disk is read again after a save and when the window returns; the
 * one written from the document is built again when asked.
 */
export function useDocumentFolder(store: EditorStore, versions: DocumentVersions | null) {
  const files = ref<string[]>([])
  const generated = shallowRef(new Map<string, Uint8Array>())
  const loaded = ref(false)
  const error = ref('')
  const collapsed = ref(new Set<string>(COLLAPSED_AT_FIRST))
  // A path is a folder only when the disk says so: a `.fig` or an `.html` beside other files is not.
  const folder = ref<string | null>(null)
  async function findFolder(): Promise<void> {
    const path = versions?.path.value ?? null
    if (!path || !isTauri() || !isKalkaFolderPath(path)) {
      folder.value = null
      return
    }
    try {
      const { stat } = await import('@tauri-apps/plugin-fs')
      const info = await stat(path)
      if (path === versions?.path.value) folder.value = info.isDirectory ? path : null
    } catch {
      folder.value = null
    }
  }
  const source = computed<FolderSource>(() => (folder.value ? 'disk' : 'document'))

  const changes = computed(() => {
    const status = versions?.status.value
    if (!status || !folder.value) return new Map<string, GitChangeKind>()
    return folderChanges(status.files, status.root, folder.value, (code) => changeKind(code).kind)
  })
  const rows = computed(() => folderRows(files.value, changes.value, collapsed.value))

  async function refresh(): Promise<void> {
    const current = folder.value
    try {
      if (current) {
        const next = await listFolderFiles(current)
        if (current !== folder.value) return
        files.value = next
      } else {
        const written = await writeKalkaFolder(store.graph)
        if (folder.value) return
        generated.value = new Map(written.map((file) => [file.path, file.content]))
        files.value = written.map((file) => file.path)
      }
      error.value = ''
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    } finally {
      loaded.value = true
    }
  }

  async function bytesOf(path: string): Promise<Uint8Array | null> {
    if (!folder.value) return generated.value.get(path) ?? null
    const { readFile } = await import('@tauri-apps/plugin-fs')
    return readFile(joinFolderPath(folder.value, path))
  }

  /** The clean HTML of the page a file holds, when the document still has that page. */
  async function cleanPage(path: string): Promise<string | undefined> {
    const project = await bytesOf(KALKA_PROJECT_FILE)
    const pageId = project ? pageOfFile(decoder.decode(project), path) : null
    const page = pageId ? store.graph.getNode(pageId) : null
    if (!page || page.childIds.length === 0) return undefined
    return (await pageHTMLCode(store.graph, page.childIds)).code
  }

  /** A file's content, read where the tree was read from. */
  async function read(path: string): Promise<FolderFile> {
    const name = path.split('/').pop() ?? path
    const kind = fileKind(name)
    const bytes = await bytesOf(path)
    if (!bytes) throw new Error(`No such file: ${path}`)
    const clean = kind === 'html' ? await cleanPage(path) : undefined
    return { path, name, kind, bytes, clean }
  }

  function toggle(path: string): void {
    const next = new Set(collapsed.value)
    if (!next.delete(path)) next.add(path)
    collapsed.value = next
  }

  watch(folder, () => void refresh())
  void findFolder().then(refresh)
  if (versions) {
    watch(versions.path, () => void findFolder())
    // A save rewrites the folder; Git's own answer arrives with the same refresh of the versions.
    watch(versions.status, () => void refresh())
    useEventListener(window, 'focus', () => {
      if (folder.value) void refresh()
    })
  }

  return { source, folder, rows, collapsed, loaded, error, toggle, refresh, read }
}
