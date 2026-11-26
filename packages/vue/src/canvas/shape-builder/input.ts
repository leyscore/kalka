import { onScopeDispose } from 'vue'

import type { Editor, ShapeBuilderSession } from '@kalka/core/editor'

import { loadCanvasKit } from '#vue/canvas/surface/offscreen'
import type { DragShapeBuilder } from '#vue/shared/input/types'

interface LiveSession {
  session: ShapeBuilderSession
  /** The document version the regions were cut at; any other edit cuts them again. */
  sceneVersion: number
  selection: string
}

/** Each editor's open Shape builder: its regions hold CanvasKit paths, so it is not state. */
const sessions = new WeakMap<Editor, LiveSession>()

function selectionKey(editor: Editor): string {
  return [...editor.state.selectedIds].sort().join(' ')
}

function closeSession(editor: Editor) {
  sessions.get(editor)?.session.dispose()
  sessions.delete(editor)
  if (editor.state.shapeBuilder) {
    editor.state.shapeBuilder = null
    editor.requestRepaint()
  }
}

/** The Shape builder for the selection as it is now, or null when it has nothing to cut. */
function currentSession(editor: Editor): ShapeBuilderSession | null {
  if (editor.state.activeTool !== 'SHAPE_BUILDER') {
    closeSession(editor)
    return null
  }
  const live = sessions.get(editor)
  const key = selectionKey(editor)
  if (live && live.sceneVersion === editor.state.sceneVersion && live.selection === key) {
    return live.session
  }
  closeSession(editor)
  const session = editor.beginShapeBuilder()
  if (!session) return null
  sessions.set(editor, { session, sceneVersion: editor.state.sceneVersion, selection: key })
  editor.state.shapeBuilder = {
    outlines: session.outlines(),
    hovered: null,
    picked: [],
    removing: false
  }
  editor.requestRepaint()
  return session
}

function showFaces(editor: Editor, hovered: number | null, picked: number[], removing: boolean) {
  const overlay = editor.state.shapeBuilder
  if (!overlay) return
  if (
    overlay.hovered === hovered &&
    overlay.removing === removing &&
    overlay.picked.length === picked.length
  ) {
    return
  }
  editor.state.shapeBuilder = { ...overlay, hovered, picked: [...picked], removing }
  editor.requestRepaint()
}

/**
 * Opens and closes the Shape builder with its tool: picking Shift+M cuts the selected shapes into
 * regions (CanvasKit loads for it first), any other tool lets them go.
 */
export function bindShapeBuilder(editor: Editor) {
  const stop = editor.onEditorEvent('tool:changed', () => {
    if (editor.state.activeTool !== 'SHAPE_BUILDER') {
      closeSession(editor)
      return
    }
    void loadCanvasKit(editor).then(() => currentSession(editor))
  })
  onScopeDispose(() => {
    stop()
    closeSession(editor)
  })
}

/** Highlights the region under the pointer while the Shape builder is on. */
export function updateShapeBuilderHover(cx: number, cy: number, altKey: boolean, editor: Editor) {
  if (editor.state.activeTool !== 'SHAPE_BUILDER') return
  const session = currentSession(editor)
  if (session) showFaces(editor, session.faceAt(cx, cy), [], altKey)
}

/** A press on a region: dragging across others adds them, Option/Alt removes instead of merging. */
export function startShapeBuilderDrag(
  cx: number,
  cy: number,
  altKey: boolean,
  editor: Editor
): DragShapeBuilder | null {
  const session = currentSession(editor)
  const face = session?.faceAt(cx, cy) ?? null
  if (face === null) return null
  showFaces(editor, face, [face], altKey)
  return { type: 'shape-builder', picked: [face], remove: altKey }
}

export function moveShapeBuilderDrag(
  drag: DragShapeBuilder,
  cx: number,
  cy: number,
  editor: Editor
) {
  const face = sessions.get(editor)?.session.faceAt(cx, cy) ?? null
  if (face !== null && !drag.picked.includes(face)) drag.picked.push(face)
  showFaces(editor, face, drag.picked, drag.remove)
}

/** Merges or removes the picked regions, then cuts the shapes again. */
export function finishShapeBuilderDrag(drag: DragShapeBuilder, editor: Editor, commit: boolean) {
  const live = sessions.get(editor)
  if (commit && live?.session.apply(drag.picked, drag.remove ? 'remove' : 'merge')) {
    live.sceneVersion = editor.state.sceneVersion
    live.selection = selectionKey(editor)
    editor.state.shapeBuilder = {
      outlines: live.session.outlines(),
      hovered: null,
      picked: [],
      removing: drag.remove
    }
    editor.requestRepaint()
    return
  }
  showFaces(editor, null, [], drag.remove)
}
