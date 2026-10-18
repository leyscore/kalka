import { isEqual, uniq } from 'es-toolkit'

import type { SceneGraph } from './index'
import { INSTANCE_SYNC_FIELDS } from './instances/fields'
import { layoutSizingInParent } from './layout-sizing'
import type { Vector } from './primitives'
import type { SceneNode } from './types'

/**
 * Breakpoints: one page design shown at several widths. A top-level frame is the primary
 * artboard; each breakpoint is another top-level frame, narrower, whose layers are copies linked
 * to the primary's by `responsiveSource`. The structure is the primary's everywhere. A copy
 * follows the layer one breakpoint wider, field by field, until it is given a value of its own:
 * desktop changes reach tablet and phone, tablet changes reach phone. Exports write the primary
 * once and each breakpoint as `@media (max-width: …)` rules with what differs.
 */

/** What a breakpoint copy follows from the layer one breakpoint wider. */
export const RESPONSIVE_FIELDS: readonly (keyof SceneNode)[] = uniq<keyof SceneNode>([
  ...INSTANCE_SYNC_FIELDS,
  'x',
  'y',
  'rotation',
  'layoutGrow',
  'layoutAlignSelf',
  'layoutPositioning',
  'horizontalConstraint',
  'verticalConstraint',
  'blendMode',
  'strokeWeight',
  'strokeAlign',
  'dashPattern',
  'cornerSmoothing',
  'italic',
  'lineHeight',
  'letterSpacing',
  'textAlignHorizontal',
  'textAlignVertical',
  'textAutoResize',
  'textCase',
  'textDecoration',
  'maxLines',
  'styleRuns'
])

const RESPONSIVE_FIELD_SET: ReadonlySet<string> = new Set(RESPONSIVE_FIELDS)

/** A breakpoint artboard's own place and size, which its primary never sets. */
const ARTBOARD_OWN_FIELDS: ReadonlySet<string> = new Set(['x', 'y', 'width', 'height', 'name'])

export interface Breakpoint {
  /** The breakpoint's artboard, a top-level frame. */
  root: SceneNode
  width: number
}

/** The artboard a layer sits in; `closest` bounds the walk, so a parent cycle ends it. */
function topLevel(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  return graph.closest(node.id, (current) => {
    if (!current.parentId) return false
    const parent = graph.getNode(current.parentId)
    return !parent || parent.type === 'CANVAS'
  })
}

function isArtboard(graph: SceneGraph, node: SceneNode): boolean {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  return parent?.type === 'CANVAS'
}

/** The breakpoint artboards of a primary artboard, widest first. */
export function breakpointsOf(graph: SceneGraph, primaryId: string): Breakpoint[] {
  const primary = graph.getNode(primaryId)
  const page = primary?.parentId ? graph.getNode(primary.parentId) : undefined
  if (!primary || page?.type !== 'CANVAS') return []
  return graph
    .getChildren(page.id)
    .filter((node) => node.responsiveSource === primaryId)
    .map((root) => ({ root, width: root.width }))
    .sort((a, b) => b.width - a.width)
}

/** The primary artboard a layer belongs to, through its breakpoint if it is a copy. */
export function responsivePrimaryOf(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  const artboard = topLevel(graph, node) ?? (isArtboard(graph, node) ? node : undefined)
  if (!artboard) return undefined
  if (!artboard.responsiveSource) return artboard
  return graph.getNode(artboard.responsiveSource)
}

/** The artboards of a primary's group, widest first: the primary, then its breakpoints. */
export function responsiveArtboards(graph: SceneGraph, primaryId: string): SceneNode[] {
  const primary = graph.getNode(primaryId)
  if (!primary) return []
  return [primary, ...breakpointsOf(graph, primaryId).map((breakpoint) => breakpoint.root)]
}

/** Each primary layer's copy in one breakpoint artboard, by the primary layer's id. */
export function copiesIn(graph: SceneGraph, artboard: SceneNode): Map<string, SceneNode> {
  const copies = new Map<string, SceneNode>()
  const visit = (node: SceneNode) => {
    if (node.responsiveSource) copies.set(node.responsiveSource, node)
    for (const child of graph.getChildren(node.id)) visit(child)
  }
  visit(artboard)
  return copies
}

/** A layer's counterpart in another artboard of its group: the primary's own, or its copy. */
export function counterpartIn(
  graph: SceneGraph,
  node: SceneNode,
  artboard: SceneNode
): SceneNode | undefined {
  const sourceId = node.responsiveSource ?? node.id
  if (artboard.id === sourceId) return artboard
  if (!artboard.responsiveSource) return graph.getNode(sourceId)
  return copiesIn(graph, artboard).get(sourceId)
}

/** The artboards of a layer's group around it: the one it is in, and the next wider/narrower. */
function neighbours(graph: SceneGraph, node: SceneNode) {
  const primary = responsivePrimaryOf(graph, node)
  if (!primary) return null
  const artboards = responsiveArtboards(graph, primary.id)
  if (artboards.length < 2) return null
  const own = topLevel(graph, node) ?? node
  const index = artboards.findIndex((artboard) => artboard.id === own.id)
  if (index === -1) return null
  return { artboards, index, own }
}

/** The layer a breakpoint copy follows: its counterpart one breakpoint wider. */
export function responsiveParent(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  const around = neighbours(graph, node)
  if (!around || around.index === 0) return undefined
  return counterpartIn(graph, node, around.artboards[around.index - 1])
}

/** The copy that follows a layer: its counterpart one breakpoint narrower. */
export function responsiveChild(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  const around = neighbours(graph, node)
  if (!around) return undefined
  const next = around.artboards.at(around.index + 1)
  return next ? counterpartIn(graph, node, next) : undefined
}

/**
 * Whether layout sets a field rather than the designer: a position inside auto layout, a size
 * that fills or hugs. Each breakpoint lays out its own copy, so these never pass between them.
 */
export function isLayoutResult(
  graph: SceneGraph,
  node: SceneNode,
  field: keyof SceneNode
): boolean {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (field === 'x' || field === 'y') {
    return (
      parent !== undefined &&
      parent.type !== 'CANVAS' &&
      parent.layoutMode !== 'NONE' &&
      node.layoutPositioning !== 'ABSOLUTE'
    )
  }
  if (field === 'width') return layoutSizingInParent(parent, node, 'HORIZONTAL') !== 'FIXED'
  if (field === 'height') return layoutSizingInParent(parent, node, 'VERTICAL') !== 'FIXED'
  return false
}

function followsField(graph: SceneGraph, node: SceneNode, field: string): boolean {
  if (!RESPONSIVE_FIELD_SET.has(field)) return false
  if (node.responsiveSource && isArtboard(graph, node) && ARTBOARD_OWN_FIELDS.has(field))
    return false
  return !isLayoutResult(graph, node, field as keyof SceneNode)
}

/** The fields where a breakpoint copy has a value of its own instead of following. */
export function responsiveOverrides(graph: SceneGraph, node: SceneNode): (keyof SceneNode)[] {
  const parent = responsiveParent(graph, node)
  if (!parent) return []
  return RESPONSIVE_FIELDS.filter(
    (field) => followsField(graph, node, field) && !isEqual(node[field], parent[field])
  )
}

/** Gives a copy back the values it follows, all or only `fields`. */
export function resetResponsiveOverrides(
  graph: SceneGraph,
  nodeId: string,
  fields?: readonly (keyof SceneNode)[]
): void {
  const node = graph.getNode(nodeId)
  const parent = node && responsiveParent(graph, node)
  if (!node || !parent) return
  const changes: Partial<SceneNode> = {}
  for (const field of fields ?? responsiveOverrides(graph, node))
    Object.assign(changes, { [field]: structuredClone(parent[field]) })
  if (Object.keys(changes).length > 0) graph.updateNode(nodeId, changes)
}

/**
 * Passes a change on to the copy one breakpoint narrower, for each field that copy still
 * followed; its own change then reaches the next one. `previous` is what the fields were before.
 */
export function propagateResponsiveChange(
  graph: SceneGraph,
  nodeId: string,
  changes: Partial<SceneNode>,
  previous: Partial<SceneNode>
): void {
  const node = graph.getNode(nodeId)
  if (!node) return
  const child = responsiveChild(graph, node)
  if (!child) return
  const next: Partial<SceneNode> = {}
  for (const field of Object.keys(changes) as (keyof SceneNode)[]) {
    if (!(field in previous) || !followsField(graph, child, field)) continue
    if (!isEqual(child[field], previous[field])) continue
    Object.assign(next, { [field]: structuredClone(changes[field]) })
  }
  if (Object.keys(next).length > 0) graph.updateNode(child.id, next)
}

function linkCopies(graph: SceneGraph, copy: SceneNode, source: SceneNode): void {
  graph.updateNode(copy.id, { responsiveSource: source.id })
  copy.childIds.forEach((childId, index) => {
    const child = graph.getNode(childId)
    const sourceChild = graph.getNode(source.childIds[index] ?? '')
    if (child && sourceChild) linkCopies(graph, child, sourceChild)
  })
}

/** Lays a breakpoint artboard to the right of its group, past the last one. */
function placement(graph: SceneGraph, primary: SceneNode): Vector {
  const right = Math.max(
    ...responsiveArtboards(graph, primary.id).map((artboard) => artboard.x + artboard.width)
  )
  return { x: right + 120, y: primary.y }
}

/**
 * Adds a breakpoint to a primary artboard: a copy of it at `width`, whose layers follow the
 * primary's (or the next wider breakpoint's) until they are given values of their own.
 */
export function createBreakpoint(
  graph: SceneGraph,
  primaryId: string,
  width: number,
  name: string
): SceneNode | undefined {
  const primary = graph.getNode(primaryId)
  if (!primary?.parentId || !isArtboard(graph, primary) || primary.responsiveSource)
    return undefined
  const wider = responsiveArtboards(graph, primaryId).findLast((artboard) => artboard.width > width)
  if (!wider) return undefined
  const { x, y } = placement(graph, primary)
  // A copy of the next wider artboard starts from what that width already shows.
  const clone = graph.cloneTree(wider.id, primary.parentId, { name, x, y, width })
  if (!clone) return undefined
  linkCopies(graph, clone, primary)
  graph.updateNode(clone.id, { responsiveSource: primary.id })
  return graph.getNode(clone.id)
}

/** Clones a primary layer into an artboard of its group, linked to it, at `index`. */
function mirrorInto(graph: SceneGraph, source: SceneNode, parent: SceneNode, index: number) {
  const clone = graph.cloneTree(source.id, parent.id)
  if (!clone) return
  linkCopies(graph, clone, source)
  graph.insertChildAt(clone.id, parent.id, index)
}

/**
 * A layer added inside a breakpoint becomes part of the shared structure: the primary gets a
 * copy of it, in the matching place, and the layer is linked to that copy.
 */
function promote(graph: SceneGraph, primary: SceneNode, node: SceneNode): void {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (!parent) return
  const target = parent.responsiveSource ? graph.getNode(parent.responsiveSource) : undefined
  const inPrimary =
    target && (target.id === primary.id || topLevel(graph, target)?.id === primary.id)
  if (!target || !inPrimary) return
  const clone = graph.cloneTree(node.id, target.id)
  if (!clone) return
  graph.insertChildAt(clone.id, target.id, parent.childIds.indexOf(node.id))
  // The primary's clone is the source; the layer made in the breakpoint links to it.
  graph.updateNode(clone.id, { responsiveSource: null })
  const unlink = (copy: SceneNode) => {
    graph.updateNode(copy.id, { responsiveSource: null })
    for (const child of graph.getChildren(copy.id)) unlink(child)
  }
  for (const child of graph.getChildren(clone.id)) unlink(child)
  linkCopies(graph, node, clone)
}

/**
 * Brings each breakpoint's structure in line with the primary's: layers added in a breakpoint
 * join the primary, copies whose source is gone go, missing copies are made, and children take
 * the primary's order. Changes that are already in line touch nothing, so it can run after any
 * edit, undo included.
 */
export function reconcileBreakpoints(graph: SceneGraph, primaryId: string): void {
  const primary = graph.getNode(primaryId)
  if (!primary) return
  for (const { root } of breakpointsOf(graph, primaryId)) {
    // A layer without a source, or a second copy of one (a duplicate made in the breakpoint),
    // is new to the structure.
    const orphans: SceneNode[] = []
    const seen = new Set<string>()
    const findOrphans = (node: SceneNode) => {
      for (const child of graph.getChildren(node.id)) {
        if (!child.responsiveSource || seen.has(child.responsiveSource)) orphans.push(child)
        else {
          seen.add(child.responsiveSource)
          findOrphans(child)
        }
      }
    }
    findOrphans(root)
    for (const orphan of orphans) promote(graph, primary, orphan)
  }
  for (const { root } of breakpointsOf(graph, primaryId)) {
    const copies = copiesIn(graph, root)
    for (const [sourceId, copy] of copies) {
      const source = graph.getNode(sourceId)
      const inGroup =
        source && (source.id === primaryId || topLevel(graph, source)?.id === primaryId)
      if (!inGroup && copy.id !== root.id) graph.deleteNode(copy.id)
    }
    const align = (source: SceneNode, copy: SceneNode) => {
      const current = copiesIn(graph, root)
      source.childIds.forEach((childId, index) => {
        const sourceChild = graph.getNode(childId)
        if (!sourceChild) return
        const childCopy = current.get(childId)
        if (!childCopy) {
          mirrorInto(graph, sourceChild, copy, index)
          return
        }
        if (childCopy.parentId !== copy.id || copy.childIds[index] !== childCopy.id)
          graph.insertChildAt(childCopy.id, copy.id, index)
        align(sourceChild, childCopy)
      })
    }
    align(primary, root)
  }
}

/** The primary artboards on a page that have breakpoints. */
export function responsivePrimaries(graph: SceneGraph, pageId: string): SceneNode[] {
  const children = graph.getChildren(pageId)
  const ids = new Set(children.flatMap((node) => node.responsiveSource ?? []))
  return children.filter((node) => ids.has(node.id))
}
