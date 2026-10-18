import { canvasLabelForeground, resolveFillColor } from '@kalka/core/canvas'
import type { Editor } from '@kalka/core/editor'
import type { Color, SceneNode } from '@kalka/scene-graph'
import type { CanvasLabelKind } from '@kalka/vue'

import { canvasBackgroundColor } from '@/app/editor/canvas/background'

export interface CanvasLabelPresentation {
  background: Color
  foreground: 'dark' | 'light'
}

const DEFAULT_LABEL_BACKGROUND: Color = { r: 0.37, g: 0.37, b: 0.37, a: 1 }

/** Figma renames a frame or component name in a white field, a section title on its own fill. */
const NAME_FIELD: CanvasLabelPresentation = {
  background: { r: 1, g: 1, b: 1, a: 1 },
  foreground: 'dark'
}

export function canvasLabelPresentation(
  editor: Editor,
  node: SceneNode | null,
  kind: CanvasLabelKind | undefined
): CanvasLabelPresentation {
  if (kind && kind !== 'section-title') return NAME_FIELD
  const fill = node?.fills[0]
  const background =
    node && fill?.visible
      ? // As the canvas presents it; behind the DOM scene, in sRGB, loaded CanvasKit or not.
        (editor.renderer?.resolveFillColor(fill, 0, node, editor.graph) ??
        resolveFillColor(fill, 0, node, editor.graph, 'srgb'))
      : DEFAULT_LABEL_BACKGROUND
  const foreground = canvasLabelForeground(
    background,
    canvasBackgroundColor(editor.state.pageColor)
  )
  return { background, foreground: foreground.r === 0 ? 'dark' : 'light' }
}
