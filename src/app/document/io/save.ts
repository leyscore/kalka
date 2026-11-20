import type { EditorState } from '@kalka/core/editor'
import { filesMessages } from '@kalka/vue'

import { downloadBlob } from '@/app/document/io/browser'
import { chooseBrowserFigSaveHandle, chooseTauriFigSavePath } from '@/app/document/io/save-targets'
import type { DocumentPayload, DocumentSourceAccess } from '@/app/document/io/types'
import { createDocumentWriter } from '@/app/document/io/write'
import { IS_TAURI } from '@/constants'

type SaveDocumentState = EditorState & { documentName: string }

type SaveActionsOptions = Omit<DocumentSourceAccess, 'getSavedVersion'> & {
  state: SaveDocumentState
  /** The document's content revision, recorded as the saved version. */
  version: () => number
  /** The document as its source format saves it. */
  buildFigFile: () => DocumentPayload | Promise<DocumentPayload>
  onWriteSuccess?: (version: number) => void | Promise<void>
  onDownloadSuccess?: (version: number) => void | Promise<void>
  /** Saves to a place the person picks, for a document that has none yet. */
  saveAs: () => Promise<boolean>
}

export function createSaveActions({
  state,
  version: currentVersion,
  buildFigFile,
  getFilePath,
  getFileHandle,
  getDownloadName,
  getStorageBinding,
  setSourceIdentity,
  setSavedVersion,
  setLastWriteTime,
  onWriteSuccess,
  onDownloadSuccess,
  saveAs
}: SaveActionsOptions) {
  const writeFile = createDocumentWriter({
    state,
    getFilePath,
    getFileHandle,
    getStorageBinding,
    setSavedVersion,
    setLastWriteTime,
    onWriteSuccess
  })

  async function buildVersionedFigFile() {
    const version = currentVersion()
    return { data: await buildFigFile(), version }
  }

  async function saveFigFile() {
    const filePath = getFilePath()
    const fileHandle = getFileHandle()
    const storageBinding = getStorageBinding()
    const downloadName = getDownloadName()
    if (storageBinding || filePath || fileHandle) {
      const { data, version } = await buildVersionedFigFile()
      const wrote = await writeFile(data, version)
      if (wrote && !storageBinding) setSourceIdentity({ handle: fileHandle, path: filePath })
      return wrote
    }
    if (downloadName) {
      const { data, version } = await buildVersionedFigFile()
      if (!(data instanceof Uint8Array)) return saveAs()
      downloadBlob(new Uint8Array(data), downloadName, 'application/octet-stream')
      await onDownloadSuccess?.(version)
      return true
    }
    return saveAs()
  }

  return { saveFigFile, writeFile }
}

/** Where Save As writes: a path on desktop, a file handle in browsers that have them, or a download. */
export type SaveAsTarget =
  | { kind: 'path'; path: string }
  | { kind: 'handle'; handle: FileSystemFileHandle }
  | { kind: 'download'; name: string }

/** Asks where to save; null when the person cancels. */
export async function chooseSaveAsTarget(
  downloadName: string | null
): Promise<SaveAsTarget | null> {
  if (IS_TAURI) {
    const path = await chooseTauriFigSavePath()
    return path ? { kind: 'path', path } : null
  }
  // The picker helper returns null when the browser has no File System Access API.
  const handle = await chooseBrowserFigSaveHandle()
  if (handle) return { kind: 'handle', handle }
  const name = prompt(filesMessages.get().saveAsPrompt, downloadName ?? 'Untitled.fig')
  return name ? { kind: 'download', name } : null
}

/** The file name a Save As target writes. */
export function saveAsTargetName(target: SaveAsTarget): string {
  if (target.kind === 'path') return target.path
  if (target.kind === 'handle') return target.handle.name
  return target.name
}
