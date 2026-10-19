import { createEditor, type Editor } from '@kalka/core/editor'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { loadFont } from '@/app/editor/fonts'
import type { EditorPreparationHandle as DocumentLoadSession } from '@/app/editor/preparation/types'

export interface ApplyImportedDocumentOptions {
  /**
   * The first page is shown next on a canvas that lays it out as it shows it, as the DOM canvas
   * does, so it needs no layout first. Only for documents that hold their geometry, as `.fig`
   * files do.
   */
  laidOutOnCanvas?: boolean
}

export async function applyImportedDocument(
  editor: Editor,
  imported: SceneGraph,
  load?: DocumentLoadSession,
  options: ApplyImportedDocumentOptions = {}
) {
  const firstPage = imported.getPages()[0] as SceneNode | undefined
  const pageId = firstPage?.id ?? imported.rootId
  const stagingEditor = createEditor({
    graph: imported,
    loadFont,
    skipInitialGraphSetup: true
  })
  try {
    load?.update({ phase: 'populating-page', detail: firstPage?.name ?? null })
    const prepared = await stagingEditor.preparePage(pageId, {
      signal: load?.signal,
      laidOutOnCanvas: options.laidOutOnCanvas,
      onProgress: (progress) => load?.update(progress)
    })
    load?.signal.throwIfAborted()
    if (!prepared) throw new Error('Imported page preparation was superseded')

    editor.replaceGraph(imported)
    editor.undo.clear()
    editor.clearSelection()
  } finally {
    stagingEditor.dispose()
  }
}
