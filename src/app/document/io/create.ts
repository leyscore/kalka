import type { Editor, EditorState } from '@kalka/core/editor'
import { prefetchFigmaSchema } from '@kalka/core/kiwi'

import { createDocumentViewportActions, downloadBlob } from '@/app/document/io/browser'
import { createClaudeDesignOpenActions } from '@/app/document/io/claude-design/open'
import { createDOMOpenActions } from '@/app/document/io/dom'
import { createOutsideChangeHandler } from '@/app/document/io/outside-change'
import { createOpenActions, createReloadActions } from '@/app/document/io/read'
import { createDocumentSourceActions, createDocumentSourceState } from '@/app/document/io/source'
import type { ViewportSize } from '@/app/document/io/types'
import { createFileWatcher } from '@/app/document/io/watch'
import type { EditorPreparationController } from '@/app/editor/preparation/controller'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

type DocumentIOState = EditorState & {
  documentName: string
  autosaveEnabled: boolean
}

export function createDocumentIOActions(
  editor: Editor,
  state: DocumentIOState,
  viewportSize: ViewportSize,
  preparationController: EditorPreparationController
) {
  const sourceState = createDocumentSourceState()

  void prefetchFigmaSchema()

  const { reloadFromDisk } = createReloadActions({
    editor,
    state,
    getFilePath: sourceState.getFilePath,
    getFileHandle: sourceState.getFileHandle,
    getSourceFormat: sourceState.getSourceFormat,
    markDocumentSaved: () => sourceActions.markDocumentSaved(),
    preparationController
  })
  const { startWatchingFile, stopWatchingFile } = createFileWatcher({
    getFilePath: sourceState.getFilePath,
    getFileHandle: sourceState.getFileHandle,
    getLastWriteTime: sourceState.getLastWriteTime,
    reloadFromDisk: createOutsideChangeHandler({
      hasUnsavedChanges: () => sourceActions.hasUnsavedChanges(),
      reload: () => {
        void reloadFromDisk()
      },
      warn: (reload) => {
        const messages = notificationMessages.get()
        toast.warning(messages.fileChangedOutside({ name: state.documentName || 'Untitled' }), {
          label: messages.reloadFromDisk,
          run: reload
        })
      }
    })
  })
  const { setViewportSize, fitCurrentPageToViewport } = createDocumentViewportActions(
    editor,
    viewportSize
  )
  const sourceActions = createDocumentSourceActions({
    editor,
    state,
    stopWatchingFile,
    startWatchingFile,
    getRenderer: () => editor.renderer,
    ...sourceState
  })
  const { openFigFile, openKalkaFile } = createOpenActions({
    editor,
    state,
    setDocumentSource: sourceActions.setDocumentSource,
    fitCurrentPageToViewport,
    preparationController
  })
  const { openDOMFile, importDOMText } = createDOMOpenActions({
    editor,
    state,
    setDocumentSource: sourceActions.setDocumentSource,
    fitCurrentPageToViewport,
    preparationController
  })

  const { openClaudeDesign } = createClaudeDesignOpenActions({
    editor,
    state,
    setDocumentSource: sourceActions.setDocumentSource,
    fitCurrentPageToViewport,
    preparationController
  })

  return {
    downloadBlob,
    setViewportSize,
    fitCurrentPageToViewport,
    getDocumentFilePath: sourceState.getFilePath,
    getSourceIdentity: sourceState.getSourceIdentity,
    getStorageBinding: sourceState.getStorageBinding,
    /** Whether saving writes in place rather than asking for a location. */
    hasWritableSource: () =>
      !!sourceState.getFilePath() ||
      !!sourceState.getFileHandle() ||
      !!sourceState.getStorageBinding(),
    getRecoveryId: sourceActions.getRecoveryId,
    adoptRecoverySnapshot: sourceActions.adoptRecoverySnapshot,
    persistRecoveryNow: sourceActions.persistRecoveryNow,
    discardRecovery: sourceActions.discardRecovery,
    setDocumentSource: sourceActions.setDocumentSource,
    setStorageDocumentSource: sourceActions.setStorageDocumentSource,
    setPlannedFilePath: sourceActions.setPlannedFilePath,
    saveFigFileToPath: sourceActions.saveFigFileToPath,
    saveKalkaFolderToPath: sourceActions.saveKalkaFolderToPath,
    saveFigFileToStorage: sourceActions.saveFigFileToStorage,
    startWatchingCurrentFile: sourceActions.startWatchingCurrentFile,
    disposeDocumentIO: sourceActions.disposeDocumentIO,
    openFigFile,
    openKalkaFile,
    openDOMFile,
    importDOMText,
    openClaudeDesign,
    hasUnsavedChanges: sourceActions.hasUnsavedChanges,
    markDocumentSaved: () => sourceActions.markDocumentSaved(),
    saveFigFile: sourceActions.saveFigFile,
    /** Reads the document again from where it is saved, such as after a version was restored. */
    reloadFromDisk,
    saveFigFileAs: sourceActions.saveFigFileAs
  }
}
