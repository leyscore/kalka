import { pick } from 'es-toolkit'

import type { NodeType, SceneNode } from '@kalka/scene-graph'

/** The look new layers take after Figma's Set default properties, kept apart for text. */
export interface DefaultLayerProperties {
  shape: Partial<SceneNode> | null
  text: Partial<SceneNode> | null
}

/** Layers a drawing tool makes that take the shape defaults. */
const SHAPE_TYPES: ReadonlySet<NodeType> = new Set([
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
  'LINE',
  'VECTOR'
])

const SHAPE_FIELDS = [
  'fills',
  'strokes',
  'strokeWeight',
  'strokeAlign',
  'effects',
  'opacity',
  'blendMode'
] as const satisfies readonly (keyof SceneNode)[]

const TEXT_FIELDS = [
  'fills',
  'effects',
  'opacity',
  'fontFamily',
  'fontWeight',
  'italic',
  'fontSize',
  'lineHeight',
  'lineHeightUnit',
  'letterSpacing',
  'letterSpacingUnit',
  'textDecoration',
  'textCase',
  'textAlignHorizontal'
] as const satisfies readonly (keyof SceneNode)[]

/**
 * What Set default properties keeps from a layer: its paints and effects for a shape, and its
 * type settings too for a text. Null for a layer the defaults do not come from, such as a frame.
 */
export function defaultPropertiesOf(
  node: SceneNode
): { kind: keyof DefaultLayerProperties; properties: Partial<SceneNode> } | null {
  if (node.type === 'TEXT')
    return { kind: 'text', properties: structuredClone(pick(node, TEXT_FIELDS)) }
  if (SHAPE_TYPES.has(node.type))
    return { kind: 'shape', properties: structuredClone(pick(node, SHAPE_FIELDS)) }
  return null
}

/** The defaults a new layer of `type` takes, a copy it may keep. */
export function defaultPropertiesFor(
  type: NodeType,
  defaults: DefaultLayerProperties | undefined
): Partial<SceneNode> {
  if (type === 'TEXT') return structuredClone(defaults?.text ?? {})
  return SHAPE_TYPES.has(type) ? structuredClone(defaults?.shape ?? {}) : {}
}
