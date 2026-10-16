import { isEqual, pickBy } from 'es-toolkit'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { cssWrite, fieldsOwning, layerCSS } from '@kalka/scene-graph/css-model'

/**
 * CSS declarations written onto a layer, such as `update_styles` sends: they join the layer's
 * CSS and win over it; the families that own them read it back into fields, and what the fields
 * cannot write back as written stays as written.
 */
export function declarationChanges(
  graph: SceneGraph,
  node: SceneNode,
  declarations: Record<string, string>
): Partial<SceneNode> {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  const { style, ...read } = cssWrite(node, parent, { ...layerCSS(node, parent), ...declarations })
  const owned = fieldsOwning(Object.keys(declarations))
  const result: Partial<SceneNode> = pickBy(read, (_value, field) => owned.has(field))
  if (style && !isEqual(style, node.style)) result.style = style
  return result
}
