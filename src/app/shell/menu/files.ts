import { useFileDialog } from '@vueuse/core'
import { uniq } from 'es-toolkit/array'

import { BUILTIN_IO_FORMATS, IORegistry } from '@kalka/core/io'
import { menuMessages } from '@kalka/vue'

import { setKalkaOpenFileHandler } from '@/app/browser-bridge'
import {
  resolveBrowserFileURL,
  MAX_REMOTE_DOCUMENT_BYTES,
  readBoundedBody
} from '@/app/document/io/browser'
import { chooseKalkaFolder, readKalkaFolderAsFile } from '@/app/document/io/kalka-folder'
import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { rememberRecentFile } from '@/app/recent-files'
import { toast } from '@/app/shell/ui'
import { getTabsSnapshot, openFileInNewTab, switchTab } from '@/app/tabs'
import { findTabByFileIdentity } from '@/app/tabs/open/identity'
import { isTauri } from '@/app/tauri/env'
import { IS_BROWSER } from '@/constants'

const io = new IORegistry(BUILTIN_IO_FORMATS)
const DOM_DOCUMENT_EXTENSIONS = ['html', 'htm', 'xhtml'] as const
const READABLE_DOCUMENT_EXTENSIONS = uniq([
  ...io.listReadableFormats().flatMap((format) => format.extensions),
  ...DOM_DOCUMENT_EXTENSIONS
])
const DESIGN_FILE_ACCEPT = READABLE_DOCUMENT_EXTENSIONS.map((extension) => `.${extension}`).join(
  ','
)

const fileDialog = useFileDialog({
  accept: DESIGN_FILE_ACCEPT,
  multiple: true,
  reset: true
})

fileDialog.onChange((files) => {
  if (!files) return
  void openDesignFileBatch(
    files,
    (file) => file.name,
    (file) => openDesignFile(file)
  )
})

/**
 * Opens a picked or dropped document in a new tab, rejecting formats Kalka cannot read.
 * A file system handle, when the browser provides one, lets the tab save back to the file.
 */
export function openDesignFile(file: File, handle?: FileSystemFileHandle): Promise<void> {
  assertSupportedDesignFile(file.name)
  return openFileInNewTab(file, handle)
}

if (IS_BROWSER && 'window' in globalThis) {
  setKalkaOpenFileHandler(async (path: string) => {
    await openBrowserFileFromURL(resolveBrowserFileURL(path))
  })
}

/** Fetches a document over HTTP and opens it in a new tab. Browser builds only. */
export async function openBrowserFileFromURL(url: URL, init?: RequestInit): Promise<void> {
  // The cap needs a controller of its own, so a caller's signal is combined with it
  // rather than replaced: dropping it would leave the caller unable to cancel.
  const controller = new AbortController()
  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal
  const response = await fetch(url, { ...init, signal })
  if (!response.ok)
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
  const bytes = await readBoundedBody(response, MAX_REMOTE_DOCUMENT_BYTES, {
    onExceeded: () => controller.abort()
  })
  if (bytes.byteLength === 0) {
    throw new Error('Failed to fetch file: the response carried no body')
  }
  const name = url.pathname.split('/').pop() ?? 'file.fig'
  assertSupportedDesignFile(name)
  const file = new File([bytes], name, { type: 'application/octet-stream' })
  await openFileInNewTab(file, undefined, url.href)
}

function isSupportedDesignFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  return (
    io.findReader(fileName) !== null ||
    DOM_DOCUMENT_EXTENSIONS.some((extension) => lowerName.endsWith(`.${extension}`))
  )
}

function assertSupportedDesignFile(fileName: string): void {
  if (!isSupportedDesignFile(fileName)) {
    throw new Error(`Unsupported document format: ${fileName}`)
  }
}

export async function openDesignFileBatch<T>(
  items: Iterable<T>,
  displayName: (item: T) => string,
  openItem: (item: T) => Promise<void>
): Promise<void> {
  for (const item of items) {
    try {
      await openItem(item)
    } catch (error) {
      const name = displayName(item)
      const detail = error instanceof Error ? error.message : String(error)
      console.error(`Failed to open ${name}:`, error)
      toast.error(notificationMessages.get().openFileFailed({ name, error: detail }))
    }
  }
}

export async function readTauriDesignFile(path: string): Promise<File> {
  assertSupportedDesignFile(path)
  const { readFile } = await import('@tauri-apps/plugin-fs')
  const bytes = await readFile(path)
  return new File([bytes], path.split('/').pop() ?? 'file.fig')
}

export async function chooseTauriOpenPaths(): Promise<string[]> {
  const { open } = await import('@tauri-apps/plugin-dialog')
  const paths = await open({
    filters: [{ name: 'Design file', extensions: READABLE_DOCUMENT_EXTENSIONS }],
    multiple: true
  })
  if (!paths) return []
  return typeof paths === 'string' ? [paths] : paths
}

export async function openFileFromPath(path: string) {
  if (!isTauri()) return
  const { stat } = await import('@tauri-apps/plugin-fs')
  // A recent document can be a Kalka folder as well as a file.
  if ((await stat(path)).isDirectory) {
    await openFolderFromPath(path)
    return
  }
  const file = await readTauriDesignFile(path)
  await openFileInNewTab(file, undefined, path)
  rememberRecentFile(path)
}

/** Opens a Kalka folder in a new tab; saving writes back into the folder. Desktop only. */
export async function openFolderFromPath(path: string) {
  if (!isTauri()) return
  const file = await readKalkaFolderAsFile(path)
  await openFileInNewTab(file, undefined, path)
  rememberRecentFile(path)
}

export async function openFolderDialog() {
  if (!isTauri()) return
  const path = await chooseKalkaFolder(menuMessages.get().openFolder.replace('…', ''))
  if (!path) return
  await openDesignFileBatch([path], (item) => item, openFolderFromPath)
}

/** Saves the active document as a Kalka folder the user picks, and keeps it there. */
export async function saveAsFolderDialog(store: EditorStore) {
  if (!isTauri()) return
  const path = await chooseKalkaFolder(menuMessages.get().saveAsFolder.replace('…', ''))
  if (!path) return
  if (await store.saveKalkaFolderToPath(path)) rememberRecentFile(path)
}

/**
 * Focuses the tab already showing `path` without touching the disk. False when no tab
 * holds it, which lets a caller fall back to opening the file. `openFileFromPath` would
 * also land on the existing tab, but only after re-reading the file, so a document that
 * moved or lost its permissions since it opened would reject instead of being focused.
 */
export async function activateTabForPath(path: string): Promise<boolean> {
  const tab = await findTabByFileIdentity(getTabsSnapshot(), { handle: null, path })
  if (!tab) return false
  // The tab can close while the identity lookup awaits, and `switchTab` then does nothing:
  // reporting success here would make the caller skip opening the file.
  return switchTab(tab.id)
}

export async function openFileDialog() {
  if (isTauri()) {
    const paths = await chooseTauriOpenPaths()
    await openDesignFileBatch(paths, (path) => path.split(/[/\\]/).pop() ?? path, openFileFromPath)
    return
  }

  if (window.showOpenFilePicker) {
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Design file',
            accept: {
              'application/octet-stream': ['.fig'],
              'application/zip': ['.kalka'],
              'application/json': ['.pen'],
              'text/html': ['.html', '.htm'],
              'application/xhtml+xml': ['.xhtml'],
              'text/plain': ['.pen']
            }
          }
        ]
      })
      await openDesignFileBatch(
        handles,
        (handle) => handle.name,
        async (handle) => {
          const file = await handle.getFile()
          assertSupportedDesignFile(file.name)
          await openFileInNewTab(file, handle)
        }
      )
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }

  fileDialog.open()
}

export async function importFileDialog() {
  await openFileDialog()
}
