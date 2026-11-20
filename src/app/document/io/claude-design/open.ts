import type { Editor, EditorState } from '@kalka/core/editor'
import {
  claudeDesignFilesFromZip,
  readClaudeDesignProject,
  type ClaudeDesignFile
} from '@kalka/core/io/formats/claude-design'

import { yieldToUI } from '@/app/document/io/browser'
import { claudeDesignToSceneGraph } from '@/app/document/io/claude-design/import'
import { errorDetail, failDOMLoad } from '@/app/document/io/dom'
import { applyImportedDocument } from '@/app/document/io/imported-document'
import type { EditorPreparationController } from '@/app/editor/preparation/controller'
import type { EditorPreparationHandle } from '@/app/editor/preparation/types'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

type OpenClaudeDesignState = EditorState & {
  documentName: string
}

type OpenClaudeDesignOptions = {
  editor: Editor
  state: OpenClaudeDesignState
  setDocumentSource: (fileName: string, sourceFormat: string) => void
  fitCurrentPageToViewport: () => Promise<void>
  preparationController: EditorPreparationController
}

/** Imports a Claude Design project, from its exported `.zip` or folder, as a new document. */
export function createClaudeDesignOpenActions({
  editor,
  state,
  setDocumentSource,
  fitCurrentPageToViewport,
  preparationController
}: OpenClaudeDesignOptions) {
  async function openClaudeDesign(
    source: File | readonly ClaudeDesignFile[],
    name: string,
    preparation?: EditorPreparationHandle
  ) {
    const load =
      preparation ?? preparationController.begin({ kind: 'claude-design-import', subject: name })
    const ownsLoad = preparation === undefined
    let succeeded = false
    try {
      load.update({ phase: 'reading', detail: name })
      const files =
        source instanceof File
          ? claudeDesignFilesFromZip(new Uint8Array(await source.arrayBuffer()))
          : source
      const project = readClaudeDesignProject(files)
      await yieldToUI()
      const result = await claudeDesignToSceneGraph(project, {
        signal: load.signal,
        onProgress: ({ board, completed, total }) =>
          load.update({ phase: 'decoding', detail: board || name, completed, total, unit: 'pages' })
      })
      load.signal.throwIfAborted()
      await applyImportedDocument(editor, result.graph, load)
      state.documentName = project.title
      setDocumentSource(`${project.title}.kalka`, 'kalka')
      await fitCurrentPageToViewport()
      editor.requestRender()
      const messages = notificationMessages.get()
      if (result.missingBlobs.length > 0)
        toast.error(messages.claudeDesignMissingUploads({ count: result.missingBlobs.length }))
      else toast.info(messages.importedClaudeDesign({ count: result.boards }))
      succeeded = true
    } catch (e) {
      if (load.signal.aborted) throw e
      failDOMLoad(load, e, 'import')
      console.error('Failed to import the Claude Design project:', e)
      toast.error(notificationMessages.get().importClaudeDesignFailed({ error: errorDetail(e) }))
      throw e
    } finally {
      if (ownsLoad && succeeded) load.complete()
    }
  }

  return { openClaudeDesign }
}
