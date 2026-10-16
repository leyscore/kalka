import { isEqual, pickBy } from 'es-toolkit'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import {
  cssWrite,
  fieldsOwning,
  layerCSS,
  styleAfterFieldChanges
} from '@kalka/scene-graph/css-model'

/**
 * Who writes layers. During the CSS model's migration (PLAN.md, section 12) each writer moves
 * from setting fields to writing the layer's CSS, one at a time, behind this switch.
 */
export type CSSWriter = 'panel' | 'mcp' | 'import' | 'drag' | 'plugin' | 'fig'

/** The writers already moved to CSS. */
export const DEFAULT_CSS_WRITES: readonly CSSWriter[] = ['panel', 'mcp', 'import', 'drag']

/** The writers an editor moves to CSS: those its options name, or `DEFAULT_CSS_WRITES`. */
export function cssWritesFor(options?: { cssWrites?: readonly CSSWriter[] }): Set<CSSWriter> {
  return new Set(options?.cssWrites ?? DEFAULT_CSS_WRITES)
}

/**
 * Field changes as a write of the layer's CSS. A layer's CSS is the mapping applied to its fields
 * plus its `style`, so setting fields writes their CSS; what is left is the CSS kept as written
 * for their families, which gives way to them in the same change, so undo restores it.
 */
export function changesAsCSS(node: SceneNode, changes: Partial<SceneNode>): Partial<SceneNode> {
  if ('style' in changes) return changes
  const style = styleAfterFieldChanges(node, Object.keys(changes))
  return style ? { ...changes, style } : changes
}

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
