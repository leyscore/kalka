import { omit } from 'es-toolkit'

import type { SceneGraph, SceneNode } from '../'
import { diffLayers, type LayerChange } from './layers'

/**
 * Bringing one state's layer changes into another, as a branch merge or an update from main
 * does in Figma: each change is taken or left on its own. A change is taken as the layer is in
 * the incoming state, as a whole; one that cannot be placed, such as a layer added inside a
 * frame the target removed, is skipped and reported.
 */

export interface LayerMerge {
  /** What the incoming state changed since the base. */
  changes: LayerChange[]
  /** IDs of changed layers the target also changed since the base: taking one replaces that. */
  conflicts: Set<string>
}

/**
 * The changes `incoming` made since `base`, and which of them meet changes `target` made since
 * then. Without a base, as from a server older than branch bases, the target is the base and
 * every difference is the incoming one's.
 */
export function layerMerge(
  base: SceneGraph | null,
  target: SceneGraph,
  incoming: SceneGraph
): LayerMerge {
  const changes = diffLayers(base ?? target, incoming)
  if (!base) return { changes, conflicts: new Set() }
  const own = new Set(diffLayers(base, target).map((change) => change.id))
  return {
    changes,
    conflicts: new Set(changes.filter((change) => own.has(change.id)).map((change) => change.id))
  }
}

/** The target's parent for a layer whose parent in `from` is `parentId`; roots differ. */
function targetParent(target: SceneGraph, from: SceneGraph, parentId: string | null) {
  if (!parentId) return undefined
  return target.getNode(parentId === from.rootId ? target.rootId : parentId)
}

/**
 * Where a layer goes among the target parent's other children: after the nearest earlier
 * sibling it has in `from` that the target parent also holds, or first.
 */
function targetIndex(from: SceneGraph, node: SceneNode, others: readonly string[]): number {
  const siblings = from.getNode(node.parentId ?? '')?.childIds ?? []
  for (let index = siblings.indexOf(node.id) - 1; index >= 0; index--) {
    const placed = others.indexOf(siblings[index] ?? '')
    if (placed !== -1) return placed + 1
  }
  return 0
}

function copySubtree(target: SceneGraph, from: SceneGraph, id: string, parentId: string): void {
  const node = from.getNode(id)
  if (!node) return
  const props = omit(structuredClone(node), ['id', 'parentId', 'childIds'])
  target.createNodeWithId(id, node.type, parentId, { ...props, childIds: [] })
  for (const childId of node.childIds) copySubtree(target, from, childId, id)
}

function place(target: SceneGraph, from: SceneGraph, node: SceneNode, parent: SceneNode): void {
  const others = parent.childIds.filter((childId) => childId !== node.id)
  const index = targetIndex(from, node, others)
  if (target.getNode(node.id)?.parentId === parent.id && parent.childIds[index] === node.id) return
  target.insertChildAt(node.id, parent.id, index)
}

function applyOne(target: SceneGraph, from: SceneGraph, change: LayerChange): boolean {
  if (change.kind === 'removed') {
    if (!target.getNode(change.id)) return true
    target.deleteNode(change.id)
    return true
  }
  const node = from.getNode(change.id)
  if (!node) return false
  const parent = targetParent(target, from, node.parentId)
  if (change.kind === 'added') {
    if (!parent || target.getNode(change.id)) return false
    copySubtree(target, from, change.id, parent.id)
    place(target, from, node, parent)
    return true
  }
  if (!target.getNode(change.id)) return false
  if (change.fields.length > 0) {
    const values: Partial<SceneNode> = {}
    const absent: (keyof SceneNode)[] = []
    for (const field of change.fields) {
      if (field in node) Object.assign(values, { [field]: structuredClone(node[field]) })
      else absent.push(field)
    }
    values.source = structuredClone(node.source)
    target.restoreNodeProperties(change.id, values, absent)
  }
  if (change.moved) {
    if (!parent) return false
    place(target, from, node, parent)
  }
  return true
}

/**
 * Applies the chosen changes of `from` to `target` as one edit, with the images they use.
 * Returns the IDs of the changes that could not be placed.
 */
export function applyLayerChanges(
  target: SceneGraph,
  from: SceneGraph,
  changes: readonly LayerChange[]
): string[] {
  for (const [hash, data] of from.images)
    if (!target.images.has(hash)) target.images.set(hash, data)
  const skipped: string[] = []
  // Removals last, so a layer moved out of a removed frame is placed before the frame goes.
  const ordered = [
    ...changes.filter((change) => change.kind !== 'removed'),
    ...changes.filter((change) => change.kind === 'removed')
  ]
  target.withBufferedEvents(() => {
    for (const change of ordered) if (!applyOne(target, from, change)) skipped.push(change.id)
  })
  return skipped
}
