import { isEqual, pickBy } from 'es-toolkit'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import {
  cssWrite,
  familyFields,
  fieldsOwning,
  layerCSS,
  STYLE_FIELDS,
  styleAfterFieldChanges
} from '@kalka/scene-graph/css-model'

/**
 * Who writes layers. During the CSS model's migration (PLAN.md, section 12) each writer moves
 * from setting fields to writing the layer's CSS, one at a time, behind this switch.
 */
export type CSSWriter = 'panel' | 'mcp' | 'import' | 'drag' | 'plugin' | 'fig'

/** The writers already moved to CSS. */
export const DEFAULT_CSS_WRITES: readonly CSSWriter[] = ['panel']

/** The writers an editor moves to CSS: those its options name, or `DEFAULT_CSS_WRITES`. */
export function cssWritesFor(options?: { cssWrites?: readonly CSSWriter[] }): Set<CSSWriter> {
  return new Set(options?.cssWrites ?? DEFAULT_CSS_WRITES)
}

/**
 * Field changes as a write of the layer's CSS: the CSS the layer would have with them, read back
 * into fields and `style`. A field the CSS does not give back as set, a case the mapping does
 * not express, is set as given.
 */
export function changesAsCSS(
  graph: SceneGraph,
  node: SceneNode,
  changes: Partial<SceneNode>
): Partial<SceneNode> {
  const keys = Object.keys(changes)
  if (!keys.some((key) => STYLE_FIELDS.has(key)) || 'style' in changes) return changes
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  const draft: SceneNode = {
    ...node,
    ...changes,
    style: styleAfterFieldChanges(node, keys) ?? node.style
  }
  const { style, ...read } = cssWrite(node, parent, layerCSS(draft, parent))
  // Only the families the change wrote, or whose CSS was written as is, read back: reading the
  // others would only round them through CSS.
  const owned = new Set([...familyFields(keys), ...fieldsOwning(Object.keys(draft.style))])
  const fields = pickBy(read, (_value, field) => owned.has(field))
  const result: Partial<SceneNode> = { ...changes, ...fields }
  // The CSS rides along when it changed or gave fields beyond those asked for, so the graph
  // keeps it rather than letting it give way to them.
  const beyond = Object.keys(fields).some((field) => !(field in changes))
  if (style && (beyond || !isEqual(style, node.style))) result.style = style
  for (const key of keys) {
    const field = key as keyof SceneNode
    if (!isEqual(Reflect.get(result, field), changes[field]))
      Reflect.set(result, field, changes[field])
  }
  return result
}
