import { parseGuidOrNull } from '@kalka/fig/node-change'
import { stringToGuid } from '@kalka/kiwi/fig/guid'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import type { GUID } from '@kalka/scene-graph/primitives'

/** The layer that keeps each GUID as its `source.id`, by GUID. */
export function layerSourceOwners(graph: SceneGraph): Map<string, string> {
  const owners = new Map<string, string>()
  for (const node of graph.nodes.values()) if (node.source.id) owners.set(node.source.id, node.id)
  return owners
}

/**
 * The GUID a layer without a `source.id` is saved under: its graph ID, which has Figma's
 * `sessionID:localID` shape and never changes, so later saves keep it. A layer opened from a
 * file has its record's GUID as its ID, so it keeps that record even when something, such as a
 * room's copy of it, cleared its `source.id`. Another layer that keeps the GUID as its
 * `source.id`, and GUIDs already written, win over it.
 */
export function ownGuid(
  id: string,
  sourceOwners: ReadonlyMap<string, string>,
  assignedGuidValues: ReadonlySet<string>
): GUID | null {
  if (!/^\d+:\d+$/.test(id)) return null
  const guid = stringToGuid(id)
  const key = `${guid.sessionID}:${guid.localID}`
  const owner = sourceOwners.get(key)
  return (owner !== undefined && owner !== id) || assignedGuidValues.has(key) ? null : guid
}

/**
 * Whether a layer was opened from a file. A style keeps an ID of its own in `source.id`, which
 * only names a saved record when it spells a GUID; one made by token import or paste does not.
 */
function savedFromFile(node: SceneNode): boolean {
  if (!node.source.id) return false
  return node.sharedStyleType === null || parseGuidOrNull(node.source.id) !== null
}

export function assignOwnLayerGuids(
  graph: SceneGraph,
  sourceOwners: ReadonlyMap<string, string>,
  nodeIdToGuid: Map<string, GUID>,
  assignedGuidValues: Set<string>
): void {
  for (const node of graph.nodes.values()) {
    if (savedFromFile(node) || node.id === graph.rootId || nodeIdToGuid.has(node.id)) continue
    const guid = ownGuid(node.id, sourceOwners, assignedGuidValues)
    if (!guid) continue
    nodeIdToGuid.set(node.id, guid)
    assignedGuidValues.add(`${guid.sessionID}:${guid.localID}`)
  }
}

/**
 * The GUID a layer's record is written under: the one assigned for this write, or the record it
 * was opened from. Null for a layer the write has no record for.
 */
export function writtenLayerGuid(
  node: SceneNode,
  nodeIdToGuid: ReadonlyMap<string, GUID>
): GUID | null {
  return nodeIdToGuid.get(node.id) ?? (node.source.id ? parseGuidOrNull(node.source.id) : null)
}
