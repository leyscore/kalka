import type { Editor, EditorState } from '@kalka/core/editor'
import { exportFigFile } from '@kalka/core/io/formats/fig'
import { writeKalkaArchive, writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { figmaLosses } from '@kalka/fig'

import { createAutosave } from '@/app/document/autosave'
import { createDocumentChanges } from '@/app/document/io/changes'
import { folderName, isKalkaFolderPath } from '@/app/document/io/kalka-folder'
import {
  documentNameFromFigPath,
  downloadNameFromPath,
  figDownloadName
} from '@/app/document/io/names'
import { createSaveActions } from '@/app/document/io/save'
import { createDocumentSourceState } from '@/app/document/io/source-state'
import {
  fileFormatForName,
  type DocumentFileFormat,
  type DocumentPayload,
  type DocumentSourceAccess
} from '@/app/document/io/types'
import { createDocumentRecovery } from '@/app/document/recovery'
import { recoveryEnabled } from '@/app/document/recovery/preferences'
import { notificationMessages } from '@/app/i18n/notifications'
import type { StorageDocumentBinding, StorageProviderID } from '@/app/integrations/storage/types'
import { toast } from '@/app/shell/ui'
import { createCanvasId } from '@/app/storage/id'

type DocumentSourceState = EditorState & {
  documentName: string
  autosaveEnabled: boolean
}

export { createDocumentSourceState }

/** A `.fig` keeps Kalka's CSS for Kalka; Figma draws the layers without it. */
function warnFigmaLosses(graph: Editor['graph']): void {
  const losses = figmaLosses(graph)
  if (losses.length === 0) return
  const features = losses.map((loss) => loss.css).join(', ')
  toast.warning(notificationMessages.get().figmaLosses({ features }))
}

type DocumentSourceOptions = DocumentSourceAccess & {
  editor: Editor
  state: DocumentSourceState
  stopWatchingFile: () => void
  startWatchingFile: () => Promise<void>
  getRenderer: () => Editor['renderer']
  getSourceFormat: () => DocumentFileFormat
  setSourceFormat: (format: DocumentFileFormat) => void
}

export function createDocumentSourceActions({
  editor,
  state,
  stopWatchingFile,
  startWatchingFile,
  getFileHandle,
  setFileHandle,
  getFilePath,
  setFilePath,
  getDownloadName,
  setDownloadName,
  getStorageBinding,
  setStorageBinding,
  setSourceIdentity,
  getSavedVersion,
  setSavedVersion,
  setLastWriteTime,
  getRenderer,
  getSourceFormat,
  setSourceFormat
}: DocumentSourceOptions) {
  const changes = createDocumentChanges(editor)

  async function saveAndTrack(save: () => Promise<boolean>) {
    const revision = changes.capture()
    const saved = await save()
    if (saved) changes.markSaved(revision)
    return saved
  }

  /** The document as its source saves it: a `.fig`, a `.kalka`, or a Kalka folder's files. */
  async function buildDocumentFile(): Promise<DocumentPayload> {
    const format = getSourceFormat()
    if (format === 'kalka-folder')
      return { kind: 'folder', files: await writeKalkaFolder(editor.graph) }
    if (format === 'kalka') return writeKalkaArchive(editor.graph)
    const renderer = getRenderer()
    return exportFigFile(editor.graph, renderer?.ck, renderer ?? undefined, state.currentPageId)
  }

  function buildRecoveryFigFile() {
    return exportFigFile(editor.graph, undefined, undefined, state.currentPageId)
  }

  const recovery = createDocumentRecovery({
    state,
    version: changes.capture,
    isEnabled: () => recoveryEnabled.value,
    buildFigFile: buildRecoveryFigFile,
    hasWritableSource: () => !!getFileHandle() || !!getFilePath() || !!getStorageBinding()
  })

  const { saveFigFile, saveFigFileAs, writeFile } = createSaveActions({
    state,
    version: changes.capture,
    buildFigFile: buildDocumentFile,
    setSourceFormat,
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
    startWatchingFile: () => {
      void startWatchingFile()
    },
    onWriteSuccess: (version) => recovery.markProtectedVersion(version),
    onDownloadSuccess: (version) => recovery.markProtectedVersion(version),
    onSavedAs: (format) => {
      if (format === 'fig') warnFigmaLosses(editor.graph)
    }
  })

  const autosave = createAutosave({
    state,
    version: changes.capture,
    getSavedVersion,
    hasWritableSource: () => !!getFileHandle() || !!getFilePath() || !!getStorageBinding(),
    saveCurrentDocument: async (version) => {
      const revision = changes.capture()
      const data = await buildDocumentFile()
      if (await writeFile(data, version)) changes.markSaved(revision)
    }
  })

  function markDocumentSaved() {
    changes.markSaved()
    setSavedVersion(changes.capture())
  }

  function setDocumentSource(
    fileName: string,
    sourceFormat: string,
    handle?: FileSystemFileHandle,
    path?: string
  ) {
    stopWatchingFile()
    setStorageBinding(null)
    const isFig = sourceFormat === 'fig'
    const isKalka = sourceFormat === 'kalka'
    // A Kalka folder opens as the `.kalka` file it zips to, with the folder as its path.
    const isFolder = isKalka && isKalkaFolderPath(path ?? null)
    const savesInPlace = isFig || isKalka
    if (isFolder) setSourceFormat('kalka-folder')
    else setSourceFormat(isKalka ? 'kalka' : 'fig')
    setFileHandle(savesInPlace ? (handle ?? null) : null)
    setFilePath(savesInPlace ? (path ?? null) : null)
    setDownloadName(figDownloadName(fileName, sourceFormat))
    setSourceIdentity({ handle: handle ?? null, path: path ?? null })
    markDocumentSaved()
    void recovery.markProtectedVersion(changes.capture())
    // A folder has no single file to watch; it is read again when opened again.
    if (savesInPlace && !isFolder && (handle || path)) {
      void startWatchingFile()
    }
  }

  function setStorageDocumentSource(binding: StorageDocumentBinding, documentName: string) {
    stopWatchingFile()
    setSourceFormat('fig')
    setFileHandle(null)
    setFilePath(null)
    setDownloadName(`${documentName}.fig`)
    setSourceIdentity({ handle: null, path: null })
    setStorageBinding(binding)
    state.documentName = documentName
    state.autosaveEnabled = true
    markDocumentSaved()
    void recovery.markProtectedVersion(changes.capture())
  }

  function setPlannedFilePath(path: string) {
    stopWatchingFile()
    setStorageBinding(null)
    setSourceFormat(fileFormatForName(path))
    setFileHandle(null)
    setFilePath(path)
    const downloadName = downloadNameFromPath(path)
    setDownloadName(downloadName)
    state.documentName = documentNameFromFigPath(downloadName)
  }

  let retargeting = false

  /**
   * Save to a new target; when the write fails, the document keeps the source it had. A second
   * retarget while one is in flight is refused, so a failure never restores another save's target.
   */
  async function saveToNewTarget(planTarget: () => void): Promise<boolean> {
    if (retargeting) return false
    retargeting = true
    const previous = {
      filePath: getFilePath(),
      fileHandle: getFileHandle(),
      storageBinding: getStorageBinding(),
      downloadName: getDownloadName(),
      documentName: state.documentName,
      sourceFormat: getSourceFormat()
    }
    const restore = () => {
      setSourceFormat(previous.sourceFormat)
      setStorageBinding(previous.storageBinding)
      setFileHandle(previous.fileHandle)
      setFilePath(previous.filePath)
      setDownloadName(previous.downloadName)
      state.documentName = previous.documentName
      if (previous.filePath || previous.fileHandle) void startWatchingFile()
    }
    planTarget()
    try {
      const saved = await saveAndTrack(saveFigFile)
      if (!saved) restore()
      return saved
    } catch (error) {
      restore()
      throw error
    } finally {
      retargeting = false
    }
  }

  async function saveFigFileToPath(path: string): Promise<boolean> {
    const saved = await saveToNewTarget(() => setPlannedFilePath(path))
    if (saved) void startWatchingFile()
    return saved
  }

  /** Upload the document to storage as a new stored document and keep editing it there. */
  async function saveFigFileToStorage(providerId: StorageProviderID): Promise<boolean> {
    const saved = await saveToNewTarget(() => {
      stopWatchingFile()
      setFileHandle(null)
      setFilePath(null)
      setDownloadName(`${state.documentName}.fig`)
      setSourceFormat('fig')
      setStorageBinding({ providerId, documentId: createCanvasId() })
    })
    if (saved) {
      setSourceIdentity({ handle: null, path: null })
      state.autosaveEnabled = true
    }
    return saved
  }

  /** Save the document as a Kalka folder and keep editing it there. */
  async function saveKalkaFolderToPath(folder: string): Promise<boolean> {
    const saved = await saveToNewTarget(() => {
      stopWatchingFile()
      setStorageBinding(null)
      setFileHandle(null)
      setFilePath(folder)
      state.documentName = folderName(folder)
      setDownloadName(`${state.documentName}.kalka`)
      setSourceFormat('kalka-folder')
    })
    if (saved) setSourceIdentity({ handle: null, path: folder })
    return saved
  }

  function startWatchingCurrentFile() {
    void startWatchingFile()
  }

  function disposeDocumentIO() {
    changes.dispose()
    stopWatchingFile()
    autosave.disposeAutosave()
    recovery.disposeRecovery()
  }

  return {
    setDocumentSource,
    setStorageDocumentSource,
    setPlannedFilePath,
    saveFigFileToPath,
    saveKalkaFolderToPath,
    saveFigFileToStorage,
    startWatchingCurrentFile,
    disposeDocumentIO,
    saveFigFile: () => saveAndTrack(saveFigFile),
    saveFigFileAs: () => saveAndTrack(saveFigFileAs),
    hasUnsavedChanges: changes.hasUnsavedChanges,
    markDocumentSaved,
    getStorageBinding,
    getRecoveryId: () => recovery.getRecoveryId(),
    adoptRecoverySnapshot: (id: string) => {
      changes.markChanged()
      return recovery.adoptRecoverySnapshot(id)
    },
    persistRecoveryNow: () => recovery.persistNow(),
    discardRecovery: () => recovery.discardRecovery()
  }
}
