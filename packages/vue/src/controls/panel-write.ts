import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

/**
 * A change the properties panel makes to a layer, undoable. The panel is a CSS writer: once the
 * editor moved it to CSS (`cssWrites`), its changes write the layer's CSS.
 */
export function writeFromPanel(
  editor: Pick<Editor, 'updateNodeWithUndo'>,
  id: string,
  changes: Partial<SceneNode>,
  label?: string
): void {
  editor.updateNodeWithUndo(id, changes, label, 'panel')
}
