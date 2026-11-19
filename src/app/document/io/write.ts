import { describeDiagnosticError, recordDocumentFailure } from '@/app/diagnostics'
import { writeKalkaFolderFiles } from '@/app/document/io/kalka-folder'
import type { DocumentPayload } from '@/app/document/io/types'
import type { StorageDocumentBinding } from '@/app/integrations/storage/types'
import { persistStorageCanvasLocally } from '@/app/storage/sync/persist'
import { isTauri } from '@/app/tauri/env'

type WriteDocumentState = { documentName: string }

type DocumentWriterOptions = {
  state: WriteDocumentState
  getFilePath: () => string | null
  getFileHandle: () => FileSystemFileHandle | null
  getStorageBinding: () => StorageDocumentBinding | null
  setSavedVersion: (version: number) => void
  setLastWriteTime: (time: number) => void
  onWriteSuccess?: (version: number) => void | Promise<void>
}

export function createDocumentWriter({
  state,
  getFilePath,
  getFileHandle,
  getStorageBinding,
  setSavedVersion,
  setLastWriteTime,
  onWriteSuccess
}: DocumentWriterOptions) {
  /** The newest version written to each place, by the path, handle or stored document. */
  const newestWrites = new Map<unknown, number>()

  function currentTarget(data: DocumentPayload): unknown {
    if (!(data instanceof Uint8Array)) return getFilePath()
    const storage = getStorageBinding()
    if (storage) return `${storage.providerId}:${storage.documentId}`
    return getFilePath() ?? getFileHandle()
  }

  async function finishWrite(version: number, target: unknown): Promise<true> {
    if (target !== null) newestWrites.set(target, Math.max(newestWrites.get(target) ?? 0, version))
    // The file watch ignores changes just after a write; a slow write ends long after it began.
    setLastWriteTime(Date.now())
    setSavedVersion(version)
    try {
      await onWriteSuccess?.(version)
    } catch (error) {
      console.warn('[Recovery] Cleanup after document write failed:', error)
    }
    return true
  }

  return async function writeFile(data: DocumentPayload, version: number): Promise<boolean> {
    // A save built before another one to the same place finished, such as an autosave
    // overlapping a manual save, must not put the older state back over the newer one.
    const target = currentTarget(data)
    const newest = newestWrites.get(target)
    if (target !== null && newest !== undefined && version < newest) return true
    setLastWriteTime(Date.now())
    try {
      const storage = getStorageBinding()
      if (!(data instanceof Uint8Array)) {
        // A Kalka folder saves file by file, on desktop, into the folder it came from.
        const folder = getFilePath()
        if (!folder || !isTauri()) return false
        await writeKalkaFolderFiles(folder, data.files)
        return await finishWrite(version, target)
      }
      if (storage) {
        await persistStorageCanvasLocally({
          providerId: storage.providerId,
          canvasId: storage.documentId,
          name: state.documentName || 'Untitled',
          figBytes: data
        })
        return await finishWrite(version, target)
      }

      const filePath = getFilePath()
      const fileHandle = getFileHandle()
      if (filePath && isTauri()) {
        const { writeFile: tauriWrite } = await import('@tauri-apps/plugin-fs')
        await tauriWrite(filePath, data)
        return await finishWrite(version, target)
      }
      if (fileHandle) {
        const writable = await fileHandle.createWritable()
        await writable.write(new Uint8Array(data))
        await writable.close()
        return await finishWrite(version, target)
      }
      return false
    } catch (error) {
      recordDocumentFailure({
        operation: 'save',
        format: 'fig',
        ...describeDiagnosticError(error),
        retryable: describeDiagnosticError(error).retryable
      })
      throw error
    }
  }
}
