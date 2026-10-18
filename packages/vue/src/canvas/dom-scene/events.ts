import type { Editor } from '@kalka/core/editor'
import { browserFaceFor, fontManager } from '@kalka/core/text'

import type { GhostLayer } from './ghosts'
import type { DomSceneProjector } from './projector'
import type { CanvasTokens } from './tokens'

/** Runs a change to what the scene shows, then asks for the frame that draws it. */
export function redrawAfter<Args extends unknown[]>(
  change: (...args: Args) => void,
  redraw: () => void
): (...args: Args) => void {
  return (...args) => {
    change(...args)
    redraw()
  }
}

/**
 * Marks what each graph event changed for the projector and asks for a frame to draw it. The
 * scene draws nothing between events, so every change it shows must come through here or
 * through the view's reactive state. Returns the unsubscribers.
 */
export function bindSceneEvents(
  editor: Editor,
  projector: DomSceneProjector,
  tokens: CanvasTokens,
  ghosts: GhostLayer,
  redraw: () => void
): (() => void)[] {
  const p = projector
  return [
    editor.onEditorEvent(
      'node:updated',
      redrawAfter((id, changes) => p.nodeUpdated(id, changes), redraw)
    ),
    editor.onEditorEvent(
      'node:previewUpdated',
      redrawAfter((id, changes) => p.nodeUpdated(id, changes), redraw)
    ),
    editor.onEditorEvent(
      'node:created',
      redrawAfter((node) => p.structureChanged(node.parentId), redraw)
    ),
    editor.onEditorEvent(
      'node:deleted',
      redrawAfter((_id, parentId) => p.structureChanged(parentId), redraw)
    ),
    editor.onEditorEvent(
      'node:reparented',
      redrawAfter(
        (id, oldParentId, newParentId) => p.structureChanged(oldParentId, newParentId, id),
        redraw
      )
    ),
    editor.onEditorEvent(
      'node:reordered',
      redrawAfter(
        (_id, parentId, _index, previousParentId) => p.structureChanged(parentId, previousParentId),
        redraw
      )
    ),
    editor.onEditorEvent(
      'graph:replaced',
      redrawAfter(() => {
        void tokens.sync()
        p.reset()
      }, redraw)
    ),
    // Renaming a variable or changing a mode's condition changes no layer.
    editor.onEditorEvent('history:changed', () => void tokens.sync()),
    editor.onEditorEvent('render:requested', () => redraw()),
    editor.onEditorEvent('repaint:requested', () => redraw()),
    fontManager.onBrowserFace((loaded) => {
      // Artboards name the document's Inter `Inter` and get only that one.
      const face = browserFaceFor(loaded, editor.graph.interVersion)
      if (!face) return
      p.addFont(face)
      ghosts.addFont(face)
      redraw()
    })
  ]
}
