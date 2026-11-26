import type { NodeType, SceneGraph } from '@kalka/scene-graph'

import type { InterfaceTheme } from '#core/constants'
import { newLayerDefaults } from '#core/editor/shapes/defaults'
import { textAutoResizeChanges } from '#core/editor/text/auto-resize'

/**
 * A new layer in `parentId` as `figma.create*` makes it: as the editor's tools make one, with
 * Figma's plugin API differences, a line with no height, a 496 px section and a hugging frame.
 * Plugin text starts empty at 12px and sizes itself to its content: no width, one line tall.
 */
export function createPluginLayer(
  graph: SceneGraph,
  type: NodeType,
  parentId: string,
  theme: InterfaceTheme
): string {
  const defaults = newLayerDefaults(type, theme)
  if (type === 'LINE') defaults.height = 0
  if (type === 'SECTION') Object.assign(defaults, { width: 496, height: 496 })
  if (type === 'FRAME' || type === 'COMPONENT') defaults.primaryAxisSizing = 'HUG'
  const node = graph.createNode(type, parentId, defaults)
  if (type === 'TEXT') {
    const text = { fontSize: 12, textAutoResize: 'WIDTH_AND_HEIGHT' as const, width: 0 }
    graph.updateNode(node.id, { ...text, ...textAutoResizeChanges(node, text) })
  }
  return node.id
}
