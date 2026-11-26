import { SHARED_TEXT_STYLE_FIELDS } from './fields/text'
import type { SceneGraph, SceneNode, SharedStyle, SharedStyleKind, SharedStyleType } from './index'

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
