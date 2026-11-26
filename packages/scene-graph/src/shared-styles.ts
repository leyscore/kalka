import { BLACK } from './constants'
import { copyEffects, copyFill, copyFills, copyLayoutGrids } from './copy'
import { SHARED_TEXT_STYLE_FIELDS } from './fields/text'
import type { SceneGraph, SceneNode, SharedStyle, SharedStyleKind, SharedStyleType } from './index'
import type { Fill, Stroke } from './types'

const STYLE_REF_KEYS = {
  fill: 'fillStyleId',
  stroke: 'strokeStyleId',
  text: 'textStyleId',
  effect: 'effectStyleId',
  grid: 'gridStyleId'
} as const satisfies Record<SharedStyleKind, keyof SceneNode>

/** The fields that link a layer to its shared styles. */
export const STYLE_LINK_FIELDS = Object.values(STYLE_REF_KEYS)

const STYLE_TYPES = {
  fill: 'FILL',
  stroke: 'FILL',
  text: 'TEXT',
  effect: 'EFFECT',
  grid: 'GRID'
} as const satisfies Record<SharedStyleKind, SharedStyleType>

const TEXT_STYLE_KEYS = new Set<keyof SceneNode>(SHARED_TEXT_STYLE_FIELDS)

export function sharedStyleRefKey(kind: SharedStyleKind): (typeof STYLE_REF_KEYS)[SharedStyleKind] {
  return STYLE_REF_KEYS[kind]
}

export function sharedStyleTypeForKind(kind: SharedStyleKind): SharedStyleType {
  return STYLE_TYPES[kind]
}

/** Where a node sits in the document, as the child index of each ancestor from the root down. */
function documentPosition(graph: SceneGraph, node: SceneNode): number[] {
  const position: number[] = []
  let current = node
  const seen = new Set<string>()
  while (current.parentId && !seen.has(current.id)) {
    seen.add(current.id)
    const parent = graph.getNode(current.parentId)
    if (!parent) break
    position.unshift(parent.childIds.indexOf(current.id))
    current = parent
  }
  return position
}

function compareDocumentPositions(left: number[], right: number[]): number {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference
  }
  return left.length - right.length
}

/**
 * The document's styles of a kind, in the order their definitions sit in the document: the order
 * Figma lists local styles in, which moving a style changes.
 */
export function getSharedStyles(graph: SceneGraph, kind: SharedStyleKind): SharedStyle[] {
  const type = sharedStyleTypeForKind(kind)
  const found: Array<{ style: SharedStyle; position: number[] }> = []
  for (const node of graph.getAllNodes()) {
    if (node.sharedStyleType !== type || !node.source.id) continue
    found.push({
      style: { id: node.source.id, nodeId: node.id, name: node.name, type },
      position: documentPosition(graph, node)
    })
  }
  return found
    .sort((left, right) => compareDocumentPositions(left.position, right.position))
    .map((entry) => entry.style)
}

/** The fields a text style gives a layer that uses it, copied from the style's definition. */
export function sharedTextStyleValues(style: SceneNode): Partial<SceneNode> {
  const values: Partial<SceneNode> = {}
  for (const field of SHARED_TEXT_STYLE_FIELDS) Object.assign(values, { [field]: style[field] })
  values.fontFeatures = style.fontFeatures.map((feature) => ({ ...feature }))
  return values
}

/**
 * The fields a style's definition holds: a colour style its paints, an effect style its effects,
 * a grid style its layout guides and a text style its type settings.
 */
export function sharedStyleFields(type: SharedStyleType): readonly (keyof SceneNode)[] {
  switch (type) {
    case 'FILL':
      return ['fills']
    case 'EFFECT':
      return ['effects']
    case 'GRID':
      return ['layoutGrids']
    case 'TEXT':
      return SHARED_TEXT_STYLE_FIELDS
  }
}

/** The style kinds a definition of this type is applied as: a colour style paints strokes too. */
export function sharedStyleKindsForType(type: SharedStyleType): SharedStyleKind[] {
  switch (type) {
    case 'FILL':
      return ['fill', 'stroke']
    case 'EFFECT':
      return ['effect']
    case 'GRID':
      return ['grid']
    case 'TEXT':
      return ['text']
  }
}

/** A stroke's paints from a colour style, each keeping the weight and placement it had. */
function strokePaintsFromStyle(target: SceneNode, style: SceneNode): Stroke[] {
  const fallback: Stroke = target.strokes[0] ?? {
    type: 'SOLID',
    color: BLACK,
    weight: 1,
    opacity: 1,
    visible: true,
    align: 'CENTER'
  }
  return style.fills.map((fill, index) => {
    const { weight, align, cap, join, dashPattern } = target.strokes[index] ?? fallback
    const stroke: Stroke = { ...copyFill(fill), weight, align }
    if (cap) stroke.cap = cap
    if (join) stroke.join = join
    if (dashPattern) stroke.dashPattern = [...dashPattern]
    return stroke
  })
}

/** The values a style gives a layer that uses it as `kind`, copied from its definition. */
export function sharedStyleValues(
  kind: SharedStyleKind,
  target: SceneNode,
  style: SceneNode
): Partial<SceneNode> {
  switch (kind) {
    case 'fill':
      return { fills: copyFills(style.fills) }
    case 'stroke':
      return { strokes: strokePaintsFromStyle(target, style) }
    case 'effect':
      return { effects: copyEffects(style.effects) }
    case 'grid':
      return { layoutGrids: copyLayoutGrids(style.layoutGrids) }
    case 'text':
      return sharedTextStyleValues(style)
  }
}

/** A stroke as the paint a colour style keeps, without its weight and placement. */
function strokePaint({
  weight: _weight,
  align: _align,
  cap: _cap,
  join: _join,
  dashPattern: _dashPattern,
  ...paint
}: Stroke): Fill {
  return copyFill(paint)
}

/**
 * What a new style made from a layer holds: its paints for a colour style (its strokes' paints
 * when made from the stroke), its effects, its layout guides or its type settings.
 */
export function sharedStyleValuesFromLayer(
  kind: SharedStyleKind,
  source: SceneNode
): Partial<SceneNode> {
  switch (kind) {
    case 'fill':
      return { fills: copyFills(source.fills) }
    case 'stroke':
      return { fills: source.strokes.map(strokePaint) }
    case 'effect':
      return { effects: copyEffects(source.effects) }
    case 'grid':
      return { layoutGrids: copyLayoutGrids(source.layoutGrids) }
    case 'text':
      return sharedTextStyleValues(source)
  }
}

/** Whether a layer can use a style of this kind: text styles need text, grids a frame. */
export function supportsSharedStyle(node: SceneNode, kind: SharedStyleKind): boolean {
  if (kind === 'text') return node.type === 'TEXT'
  if (kind === 'grid') {
    return (
      node.type === 'FRAME' ||
      node.type === 'COMPONENT' ||
      node.type === 'COMPONENT_SET' ||
      node.type === 'INSTANCE'
    )
  }
  return node.type !== 'CANVAS'
}

/** The layers that use a style, apart from its own definition. */
export function sharedStyleConsumers(
  graph: SceneGraph,
  kind: SharedStyleKind,
  styleId: string
): SceneNode[] {
  const refKey = sharedStyleRefKey(kind)
  const consumers: SceneNode[] = []
  for (const node of graph.getAllNodes())
    if (node[refKey] === styleId && node.sharedStyleType === null) consumers.push(node)
  return consumers
}

export function styleDetachmentChanges(
  node: SceneNode,
  changes: Partial<SceneNode>
): Partial<SceneNode> {
  const next = { ...changes }
  if ('fills' in changes && !('fillStyleId' in changes) && node.fillStyleId) {
    next.fillStyleId = null
  }
  if ('strokes' in changes && !('strokeStyleId' in changes) && node.strokeStyleId) {
    next.strokeStyleId = null
  }
  if ('effects' in changes && !('effectStyleId' in changes) && node.effectStyleId) {
    next.effectStyleId = null
  }
  if ('layoutGrids' in changes && !('gridStyleId' in changes) && node.gridStyleId) {
    next.gridStyleId = null
  }
  const changesTextStyle = (Object.keys(changes) as (keyof SceneNode)[]).some((key) =>
    TEXT_STYLE_KEYS.has(key)
  )
  if (changesTextStyle && !('textStyleId' in changes) && node.textStyleId) {
    next.textStyleId = null
  }
  return next
}
