import type { SceneGraph } from '@open-pencil/scene-graph'

import type { RenderOverlays } from '#core/canvas/renderer/types'
import { playIslandRoots } from '#core/editor/play/islands'
import type { EditorState } from '#core/editor/types'

/**
 * What the editor draws over the design for a view state. Every overlay backend reads this,
 * the Skia overlay canvas and the SVG overlay of the DOM scene alike.
 */
export function overlaysFromEditorState(
  state: EditorState,
  graph: SceneGraph,
  textEditor: unknown
): RenderOverlays {
  // A previewing canvas shows the design as it runs: no selection, hover, or edit chrome.
  const previewing = state.play !== null
  return {
    playing: previewing,
    playIslands: previewing ? new Set(playIslandRoots(graph, state.currentPageId)) : undefined,
    hoveredNodeId: previewing ? null : state.hoveredNodeId,
    showPixelGrid: !previewing && state.showPixelGrid !== false,
    transforming: state.transforming,
    measurementMode: state.measurementMode,
    enteredContainerId: state.enteredContainerId,
    editingTextId: state.editingTextId,
    textEditor: textEditor as RenderOverlays['textEditor'],
    marquee: state.marquee,
    snapGuides: state.snapGuides,
    guides: state.guides,
    rotationPreview: state.rotationPreview,
    dropTargetId: state.dropTargetId,
    layoutInsertIndicator: state.layoutInsertIndicator,
    penState: state.penState
      ? ({
          ...state.penState,
          cursorX: state.penCursorX ?? undefined,
          cursorY: state.penCursorY ?? undefined
        } as RenderOverlays['penState'])
      : null,
    nodeEditState: state.nodeEditState ?? null,
    presenceCursors: state.presenceCursors,
    designIssues: state.designIssues,
    codeFocusNodeId: state.codeFocusNodeId,
    autoLayoutHover: state.autoLayoutHover
  }
}
