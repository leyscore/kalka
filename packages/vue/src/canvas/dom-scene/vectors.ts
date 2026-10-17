import { booleanOperationOutline } from '@kalka/core/canvas'
import type { Editor } from '@kalka/core/editor'
import { createVectorElement } from '@kalka/core/io'
import type { VectorElementRenderer } from '@kalka/dom-css/export'

/**
 * Vector layers as inline SVG for the DOM canvas. CSS and SVG have no path operations, so a
 * boolean operation's outline comes from the editor's offscreen CanvasKit; until it loads, the
 * geometry the file saved draws instead.
 */
export function domSceneVectorElement(editor: Editor): VectorElementRenderer {
  return createVectorElement({
    booleanPath: (graph, node) => {
      const renderer = editor.renderer
      return renderer ? booleanOperationOutline(renderer, node, graph) : null
    }
  })
}
