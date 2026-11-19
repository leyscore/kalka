import { isEmptyObject, isEqual, mapValues } from 'es-toolkit'

import { componentPropertyDefinitions } from '../components/properties'
import type { SceneGraph } from '../index'
import { remapInstanceOverrideState } from '../instance-overrides'
import type { ComponentPropertyDefinition, SceneNode } from '../types'

function swapPropertyIds(definitions: readonly ComponentPropertyDefinition[]): string[] {
  return definitions
    .filter((definition) => definition.type === 'INSTANCE_SWAP')
    .map((definition) => definition.id)
}

function remappedReferences(
  node: SceneNode,
  mapped: (id: string) => string,
  swapProperties: ReadonlySet<string>
): Partial<SceneNode> {
  const changes: Partial<SceneNode> = {}
  if (node.componentId && mapped(node.componentId) !== node.componentId)
    changes.componentId = mapped(node.componentId)
  // Only what a mapping changes: every write is an update collaboration sends.
  const overrides = remapInstanceOverrideState(node.instanceOverrides, {
    node: mapped,
    variable: (id) => id
  })
  if (!isEqual(overrides, node.instanceOverrides)) changes.instanceOverrides = overrides
  const definitions = node.componentPropertyDefinitions.map((definition) =>
    definition.type === 'INSTANCE_SWAP' && definition.defaultValue
      ? { ...definition, defaultValue: mapped(definition.defaultValue) }
      : definition
  )
  if (!isEqual(definitions, node.componentPropertyDefinitions))
    changes.componentPropertyDefinitions = definitions
  const assignments = mapValues(node.componentPropertyAssignments, (value, id) =>
    swapProperties.has(id) ? mapped(value) : value
  )
  if (!isEqual(assignments, node.componentPropertyAssignments))
    changes.componentPropertyAssignments = assignments
  return changes
}

/**
 * Points copied layers at one another, as a paste does: an instance's main component, the layers
 * its overrides change and the components they swap in, and the components an instance-swap
 * property defaults to or is set to. `mappedIds` maps each copied layer to its copy; a reference
 * outside the copy stays as it is, and so do variable IDs, since the copies keep their source's
 * variables.
 */
export function remapCopiedReferences(
  graph: SceneGraph,
  mappedIds: ReadonlyMap<string, string>
): void {
  const mapped = (id: string) => mappedIds.get(id) ?? id
  const copies = [...mappedIds.values()].flatMap((id) => graph.getNode(id) ?? [])
  const copiedSwaps = copies.flatMap((node) => swapPropertyIds(node.componentPropertyDefinitions))
  for (const node of copies) {
    // An instance's swap property may be defined on a component the copy leaves behind.
    const swapProperties = new Set([
      ...copiedSwaps,
      ...swapPropertyIds(componentPropertyDefinitions(graph, node))
    ])
    const changes = remappedReferences(node, mapped, swapProperties)
    if (!isEmptyObject(changes)) graph.updateNode(node.id, changes)
  }
}
