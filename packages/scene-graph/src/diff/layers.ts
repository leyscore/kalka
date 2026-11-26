import { isEqualWith } from 'es-toolkit/predicate'

import type { NodeType, SceneGraph, SceneNode } from '../'
import { CORNER_FIELDS, STROKE_FIELDS } from '../fields/appearance'
import { SIZE_FIELDS, TRANSFORM_FIELDS } from '../fields/geometry'
import { AUTO_LAYOUT_FIELDS, SIZE_CONSTRAINT_FIELDS } from '../fields/layout'
import { TEXT_STYLE_FIELDS } from '../fields/text'

/**
 * What changed between two states of one document, layer by layer, as Figma's Compare changes
 * shows it: the layers added, removed, or changed, with the properties that differ. Layers match
 * by ID, which versions, branches and Git revisions of a file share. A layer added or removed
 * with its parent is counted in that parent's change instead of listed on its own.
 */

export type LayerChangeKind = 'added' | 'removed' | 'changed'

/** Families of properties a change names, in the order a list shows them. */
export const LAYER_PROPERTY_GROUPS = [
  'name',
  'order',
  'position',
  'size',
  'fill',
  'stroke',
  'effects',
  'opacity',
  'corners',
  'text',
  'layout',
  'visibility',
  'css',
  'other'
] as const

export type LayerPropertyGroup = (typeof LAYER_PROPERTY_GROUPS)[number]

/**
 * What a layer is to a review, which lists components and styles apart from other layers, as
 * Figma's branch review does: a component or a component set, a style's definition, or a layer.
 */
export type LayerAsset = 'component' | 'style' | null

export interface LayerChange {
  id: string
  kind: LayerChangeKind
  name: string
  type: NodeType
  asset: LayerAsset
  /** The page it is on: in the later state, or in the earlier one for a removed layer. */
  pageId: string | null
  /** The fields that differ on a changed layer; empty for one added or removed. */
  fields: (keyof SceneNode)[]
  groups: LayerPropertyGroup[]
  /** Whether a changed layer moved to another parent or another place among its siblings. */
  moved: boolean
  /** Layers inside an added or removed one, added or removed with it. */
  descendants: number
}

/**
 * Fields not compared as properties: the tree placement, compared as a move, and the record of
 * which fields were edited, which follows the fields themselves.
 */
const UNCOMPARED_FIELDS: ReadonlySet<string> = new Set(['id', 'parentId', 'childIds', 'source'])

const FIELD_GROUPS = new Map<string, LayerPropertyGroup>()
const group = (name: LayerPropertyGroup, fields: readonly string[]) => {
  for (const field of fields) FIELD_GROUPS.set(field, name)
}
group('name', ['name'])
group('position', TRANSFORM_FIELDS)
group('size', [...SIZE_FIELDS, ...SIZE_CONSTRAINT_FIELDS])
group('fill', ['fills'])
group('stroke', ['strokes', ...STROKE_FIELDS])
group('effects', ['effects'])
group('opacity', ['opacity', 'blendMode'])
group('corners', CORNER_FIELDS)
group('text', ['text', 'styleRuns', ...TEXT_STYLE_FIELDS])
group('layout', [...AUTO_LAYOUT_FIELDS, 'layoutPositioning', 'layoutGrow', 'layoutAlignSelf'])
group('visibility', ['visible', 'locked'])
group('css', ['style'])

/** The family a field belongs to. */
export function layerFieldGroup(field: string): LayerPropertyGroup {
  return FIELD_GROUPS.get(field) ?? 'other'
}

/**
 * A changed layer's change kept to some of its families, as a review takes some properties of a
 * layer and leaves the others; null when none of its families is kept.
 */
export function narrowLayerChange(
  change: LayerChange,
  groups: ReadonlySet<LayerPropertyGroup>
): LayerChange | null {
  if (change.kind !== 'changed') return change
  if (!change.groups.some((group) => groups.has(group))) return null
  // A field of a family the change does not list, as CSS beside named properties, goes with it.
  const kept = change.fields.filter((field) => {
    const group = layerFieldGroup(field)
    return !change.groups.includes(group) || groups.has(group)
  })
  const moved = change.moved && groups.has('order')
  return { ...change, fields: kept, moved, groups: layerPropertyGroups(kept, moved) }
}

/** What a layer is to a review: a component, a style's definition, or another layer. */
export function layerAsset(node: SceneNode): LayerAsset {
  if (node.sharedStyleType) return 'style'
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') return 'component'
  return null
}

/** The families the fields belong to; CSS counts only when no field explains it. */
export function layerPropertyGroups(
  fields: readonly string[],
  moved = false
): LayerPropertyGroup[] {
  const found = new Set<LayerPropertyGroup>(fields.map((field) => layerFieldGroup(field)))
  if (moved) found.add('order')
  if (found.size > 1) found.delete('css')
  return LAYER_PROPERTY_GROUPS.filter((name) => found.has(name))
}

/**
 * How far two numbers may be apart and still read as the same value: a saved file writes colours
 * as CSS, eight bits a channel, so a channel read back is up to half a step away.
 */
const NUMBER_TOLERANCE = 1 / 510

const sameValue = (a: unknown, b: unknown) =>
  typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= NUMBER_TOLERANCE : undefined

/** The fields of a layer that differ between two states, tree placement aside. */
export function changedLayerFields(before: SceneNode, after: SceneNode): (keyof SceneNode)[] {
  const keys = new Set<string>([...Object.keys(before), ...Object.keys(after)])
  const changed: (keyof SceneNode)[] = []
  for (const key of keys) {
    if (UNCOMPARED_FIELDS.has(key)) continue
    const field = key as keyof SceneNode
    if (!isEqualWith(before[field], after[field], sameValue)) changed.push(field)
  }
  return changed
}

/** Whether a node is a page the document keeps for itself, such as the one holding styles. */
export function isInternalPage(graph: SceneGraph, node: SceneNode): boolean {
  return node.type === 'CANVAS' && node.parentId === graph.rootId && node.internalOnly
}

function pageOf(graph: SceneGraph, id: string): string | null {
  return graph.closest(id, (node) => node.type === 'CANVAS')?.id ?? null
}

function countDescendants(graph: SceneGraph, node: SceneNode): number {
  let count = 0
  for (const childId of node.childIds) {
    const child = graph.getNode(childId)
    if (child) count += 1 + countDescendants(graph, child)
  }
  return count
}

/** The sibling just before a layer among the siblings both states have, or null for the first. */
function previousShared(graph: SceneGraph, node: SceneNode, other: SceneGraph): string | null {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (!parent) return null
  let previous: string | null = null
  for (const id of parent.childIds) {
    if (id === node.id) return previous
    if (other.getNode(id)) previous = id
  }
  return previous
}

/** The parent a layer has, with the two roots, which differ between graphs, read as one. */
function parentKey(graph: SceneGraph, node: SceneNode): string | null {
  return node.parentId === graph.rootId ? 'root' : node.parentId
}

function wasMoved(before: SceneGraph, after: SceneGraph, a: SceneNode, b: SceneNode): boolean {
  if (parentKey(before, a) !== parentKey(after, b)) return true
  return previousShared(before, a, after) !== previousShared(after, b, before)
}

function walk(graph: SceneGraph, visit: (node: SceneNode) => boolean): void {
  const descend = (id: string) => {
    const node = graph.getNode(id)
    if (!node || !visit(node)) return
    for (const childId of node.childIds) descend(childId)
  }
  for (const page of graph.getChildren(graph.rootId)) descend(page.id)
}

/**
 * The layers that differ between `before` and `after`, in the later state's tree order, then
 * the removed ones in the earlier state's.
 */
export function diffLayers(before: SceneGraph, after: SceneGraph): LayerChange[] {
  const changes: LayerChange[] = []
  walk(after, (node) => {
    const previous = before.getNode(node.id)
    // The page that holds style definitions is no page to a review: its styles are listed.
    if (!previous && isInternalPage(after, node)) return true
    if (!previous || previous.id === before.rootId) {
      changes.push({
        id: node.id,
        kind: 'added',
        name: node.name,
        type: node.type,
        asset: layerAsset(node),
        pageId: pageOf(after, node.id),
        fields: [],
        groups: [],
        moved: false,
        descendants: countDescendants(after, node)
      })
      return false
    }
    const fields = changedLayerFields(previous, node)
    const moved = wasMoved(before, after, previous, node)
    if (fields.length > 0 || moved) {
      changes.push({
        id: node.id,
        kind: 'changed',
        name: node.name,
        type: node.type,
        asset: layerAsset(node),
        pageId: pageOf(after, node.id),
        fields,
        groups: layerPropertyGroups(fields, moved),
        moved,
        descendants: 0
      })
    }
    return true
  })
  walk(before, (node) => {
    if (after.getNode(node.id) || isInternalPage(before, node)) return true
    changes.push({
      id: node.id,
      kind: 'removed',
      name: node.name,
      type: node.type,
      asset: layerAsset(node),
      pageId: pageOf(before, node.id),
      fields: [],
      groups: [],
      moved: false,
      descendants: countDescendants(before, node)
    })
    return false
  })
  return changes
}
