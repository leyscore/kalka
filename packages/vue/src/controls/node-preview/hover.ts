import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import { useNodePreview } from '#vue/controls/node-preview/use'

/**
 * Shows a value on the canvas while it is hovered in a list, and takes it away when the pointer
 * leaves, the list closes or a choice is made. It goes through the node preview, so the document,
 * its undo history, autosave and collaboration never see the hovered value.
 */
export function useHoverPreview(editor: Editor, label: string) {
  const preview = useNodePreview(editor)
  return (
    ids: readonly string[],
    changes: Partial<SceneNode> | ((id: string) => Partial<SceneNode>) | null
  ) => {
    if (changes === null) preview.cancel()
    else preview.update(ids, changes, label)
  }
}
