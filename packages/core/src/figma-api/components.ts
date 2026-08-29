import type { ComponentPropertyDefinition, SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { computeAbsoluteBounds } from '@open-pencil/scene-graph/geometry'
import { deriveSlashVariantProperties } from '@open-pencil/scene-graph/variant-properties'

import { randomHex } from '#core/random'

import type { FigmaNodeProxy } from './proxy'

const COMPONENT_SET_PADDING = 40

export function exposeInstanceSwap(
  graph: SceneGraph,
  slots: ReadonlyArray<FigmaNodeProxy>,
  candidates: ReadonlyArray<FigmaNodeProxy>,
  propertyName = 'Instance'
): SceneNode {
  if (slots.length === 0) throw new Error('Provide at least one instance to expose')
  if (candidates.length === 0) throw new Error('Provide at least one candidate component')
  const name = propertyName.trim()
  if (!name) throw new Error('Property name must not be empty')
  const slotNodes = slots.map((slot) => graph.getNode(slot.id))
  if (new Set(slotNodes.map((node) => node?.id)).size !== slotNodes.length)
    throw new Error('exposeInstanceSwap requires distinct INSTANCE nodes')
  if (!slotNodes.every((node): node is SceneNode => node?.type === 'INSTANCE'))
    throw new Error('exposeInstanceSwap requires INSTANCE nodes')
  if (
    slotNodes.some((node) =>
      node.componentPropertyReferences.some((ref) => ref.field === 'INSTANCE_SWAP')
    )
  )
    throw new Error('Instance already has an INSTANCE_SWAP property')
  const candidateNodes = candidates.map((candidate) => graph.getNode(candidate.id))
  if (
    !candidateNodes.every(
      (node): node is SceneNode => node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET'
    )
  )
    throw new Error('Candidates must be COMPONENT or COMPONENT_SET nodes')
  const candidateIds = [...new Set(candidateNodes.map((node) => node.id))]
  if (candidateIds.length !== candidateNodes.length) throw new Error('Candidates must be distinct')
  const host = findPropertyHost(graph, slotNodes[0].parentId)
  if (!host) throw new Error('Instance must be nested inside a COMPONENT or COMPONENT_SET')
  if (host.componentPropertyDefinitions.some((definition) => definition.name === name))
    throw new Error(`A component property named "${name}" already exists`)
  if (!slotNodes.every((node) => findPropertyHost(graph, node.parentId)?.id === host.id))
    throw new Error('All instances must belong to the same component or component set')
  const definition: ComponentPropertyDefinition = {
    id: `prop:${randomHex(8)}`,
    name,
    type: 'INSTANCE_SWAP',
    defaultValue: slotNodes[0].componentId ?? candidateIds[0],
    preferredValues: candidateIds
  }
  graph.updateNode(host.id, {
    componentPropertyDefinitions: [...host.componentPropertyDefinitions, definition]
  })
  for (const node of slotNodes) {
    graph.updateNode(node.id, {
      componentPropertyReferences: [
        ...node.componentPropertyReferences,
        { propertyId: definition.id, field: 'INSTANCE_SWAP' }
      ]
    })
  }
  return host
}

function findPropertyHost(graph: SceneGraph, nodeId: string | null): SceneNode | null {
  let current = nodeId ? graph.getNode(nodeId) : null
  let fallback: SceneNode | null = null
  while (current) {
    if (current.type === 'COMPONENT_SET') return current
    if (current.type === 'COMPONENT' && !fallback) fallback = current
    current = current.parentId ? graph.getNode(current.parentId) : null
  }
  return fallback
}

function requireDistinctComponents(graph: SceneGraph, nodeIds: ReadonlyArray<string>): SceneNode[] {
  if (nodeIds.length === 0) throw new Error('Need at least 1 component to combine as variants')
  if (new Set(nodeIds).size !== nodeIds.length) {
    throw new Error('combineAsVariants requires distinct COMPONENT nodes')
  }

  const nodes = nodeIds.map((id) => graph.getNode(id))
  if (!nodes.every((node): node is SceneNode => node?.type === 'COMPONENT')) {
    throw new Error('combineAsVariants requires COMPONENT nodes')
  }
  return nodes
}

export function combineComponentsAsVariants(
  graph: SceneGraph,
  nodeIds: ReadonlyArray<string>,
  parentId: string,
  index?: number
): SceneNode {
  const components = requireDistinctComponents(graph, nodeIds)
  const parent = graph.getNode(parentId)
  if (!parent) throw new Error('Parent node not found')

  const bounds = computeAbsoluteBounds(components, (id) => graph.getAbsolutePosition(id))
  const parentPosition =
    parentId === graph.rootId || parent.type === 'CANVAS'
      ? { x: 0, y: 0 }
      : graph.getAbsolutePosition(parentId)
  const componentSet = graph.createNode('COMPONENT_SET', parentId, {
    name: components[0].name.split('/')[0]?.trim() || 'Component Set',
    x: bounds.x - parentPosition.x - COMPONENT_SET_PADDING,
    y: bounds.y - parentPosition.y - COMPONENT_SET_PADDING,
    width: bounds.width + COMPONENT_SET_PADDING * 2,
    height: bounds.height + COMPONENT_SET_PADDING * 2,
    fills: [
      {
        type: 'SOLID',
        color: { r: 0.96, g: 0.96, b: 0.96, a: 1 },
        opacity: 1,
        visible: true
      }
    ]
  })

  for (const component of components) graph.reparentNode(component.id, componentSet.id)
  if (index !== undefined) graph.reorderChild(componentSet.id, parentId, index)

  const derived = deriveSlashVariantProperties(components, () => `prop:${randomHex(8)}`)
  if (derived) {
    for (const [nodeId, changes] of derived.variants) graph.updateNode(nodeId, changes)
    graph.updateNode(componentSet.id, { componentPropertyDefinitions: derived.definitions })
  }

  return componentSet
}
