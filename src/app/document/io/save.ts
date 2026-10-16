import type { EditorState } from '@kalka/core/editor'
import { filesMessages } from '@kalka/vue'

import { downloadBlob } from '@/app/document/io/browser'
import { documentNameFromFigPath } from '@/app/document/io/names'
import { chooseBrowserFigSaveHandle, chooseTauriFigSavePath } from '@/app/document/io/save-targets'
import {
  fileFormatForName,
  type DocumentFileFormat,
  type DocumentPayload,
  type DocumentSourceAccess
} from '@/app/document/io/types'
import { createDocumentWriter } from '@/app/document/io/write'
import { IS_TAURI } from '@/constants'

type SaveDocumentState = EditorState & { documentName: string }

type SaveActionsOptions = Omit<DocumentSourceAccess, 'getSavedVersion'> & {
  state: SaveDocumentState
  /** The document's content revision, recorded as the saved version. */
  version: () => number
  /** The document as its source format saves it. */
  buildFigFile: () => DocumentPayload | Promise<DocumentPayload>
  /** Switches what saving writes, when Save As picks a file of another format. */
  setSourceFormat?: (format: DocumentFileFormat) => void
  startWatchingFile: () => void
  onWriteSuccess?: (version: number) => void | Promise<void>
  onDownloadSuccess?: (version: number) => void | Promise<void>
}

export function createSaveActions({
  state,
  version: currentVersion,
  buildFigFile,
  getFilePath,
  setFilePath,
  getFileHandle,
  setFileHandle,
  getDownloadName,
  setDownloadName,
  getStorageBinding,
  setStorageBinding,
  setSourceIdentity,
  setSavedVersion,
  setLastWriteTime,
  startWatchingFile,
  setSourceFormat,
  onWriteSuccess,
  onDownloadSuccess
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
      if (!(data instanceof Uint8Array)) return saveFigFileAs()
      downloadBlob(new Uint8Array(data), downloadName, 'application/octet-stream')
      await onDownloadSuccess?.(version)
      return true
    }
    return saveFigFileAs()
  }

  /** The document as the chosen file's format saves it. */
  async function buildFor(name: string) {
    setSourceFormat?.(fileFormatForName(name))
    const built = await buildVersionedFigFile()
    if (!(built.data instanceof Uint8Array)) throw new Error('A file target needs one file')
    return { data: built.data, version: built.version }
  }

  async function saveFigFileAs() {
    if (IS_TAURI) {
      const path = await chooseTauriFigSavePath()
      if (!path) return false
      const { data, version } = await buildFor(path)
      setStorageBinding(null)
      setFilePath(path)
      setFileHandle(null)
      state.documentName = documentNameFromFigPath(path)
      const wrote = await writeFile(data, version)
      if (wrote) setSourceIdentity({ handle: null, path })
      startWatchingFile()
      return wrote
    }

    // The picker helper returns null when the browser has no File System Access API.
    const handle = await chooseBrowserFigSaveHandle()
    if (handle) {
      const { data, version } = await buildFor(handle.name)
      setStorageBinding(null)
      setFileHandle(handle)
      setFilePath(null)
      state.documentName = documentNameFromFigPath(handle.name)
      const wrote = await writeFile(data, version)
      if (wrote) setSourceIdentity({ handle, path: null })
      startWatchingFile()
      return wrote
    }

    const filename = prompt(filesMessages.get().saveAsPrompt, getDownloadName() ?? 'Untitled.fig')
    if (!filename) return false
    const { data, version } = await buildFor(filename)
    setStorageBinding(null)
    setDownloadName(filename)
    state.documentName = documentNameFromFigPath(filename)
    downloadBlob(new Uint8Array(data), filename, 'application/octet-stream')
    await onDownloadSuccess?.(version)
    return true
  }

  return { saveFigFile, saveFigFileAs, writeFile }
}
