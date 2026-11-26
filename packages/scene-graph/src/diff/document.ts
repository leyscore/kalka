import type { SceneGraph } from '../'
import { diffLayers, type LayerChange, type LayerPropertyGroup } from './layers'
import { applyLayerChanges } from './merge'
import { applyVariableChanges, diffVariables, type VariableChange } from './variables'

/**
 * A whole document compared and merged, as Figma's branch review covers it: its layers, with
 * components and styles among them, and its variables.
 */

export interface DocumentChanges {
  layers: LayerChange[]
  variables: VariableChange[]
}

/** What differs between two states of a document. */
export function diffDocument(before: SceneGraph, after: SceneGraph): DocumentChanges {
  return { layers: diffLayers(before, after), variables: diffVariables(before, after) }
}

export interface DocumentMerge {
  /** What the incoming state changed since the base. */
  changes: DocumentChanges
  /** IDs of layers and variables the target also changed since the base. */
  conflicts: Set<string>
  /** For a layer both sides changed, the property families both changed. */
  conflictGroups: Map<string, Set<LayerPropertyGroup>>
}

/**
 * The changes `incoming` made since `base`, and which meet changes `target` made since then.
 * Without a base, the target is the base and every difference is the incoming one's.
 */
export function documentMerge(
  base: SceneGraph | null,
  target: SceneGraph,
  incoming: SceneGraph
): DocumentMerge {
  const changes = diffDocument(base ?? target, incoming)
  const conflicts = new Set<string>()
  const conflictGroups = new Map<string, Set<LayerPropertyGroup>>()
  if (!base) return { changes, conflicts, conflictGroups }
  const own = diffDocument(base, target)
  const ownLayers = new Map(own.layers.map((change) => [change.id, change]))
  for (const change of changes.layers) {
    const theirs = ownLayers.get(change.id)
    if (!theirs) continue
    conflicts.add(change.id)
    conflictGroups.set(
      change.id,
      new Set(change.groups.filter((group) => theirs.groups.includes(group)))
    )
  }
  const ownVariables = new Set(own.variables.map((change) => change.id))
  for (const change of changes.variables) if (ownVariables.has(change.id)) conflicts.add(change.id)
  return { changes, conflicts, conflictGroups }
}

/**
 * Applies chosen changes of `from` to `target` as one edit: variables first, so layers bound to
 * a new variable find it. Returns the IDs of the changes that could not be placed.
 */
export function applyDocumentChanges(
  target: SceneGraph,
  from: SceneGraph,
  changes: DocumentChanges
): string[] {
  return [
    ...applyVariableChanges(target, from, changes.variables),
    ...applyLayerChanges(target, from, changes.layers)
  ]
}
