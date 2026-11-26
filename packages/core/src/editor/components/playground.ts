import { uniqBy } from 'es-toolkit'

import {
  applyComponentPropertyValue,
  defaultVariant,
  type ComponentPropertyDefinition,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import { measurePropertyText } from '#core/editor/components/properties'
import { findVariantByValues } from '#core/editor/components/variants/model'
import { extractPageContext, findPageId } from '#core/io/subgraph'

/** Property types the playground offers a control for; swaps and slots stay as the component has them. */
const PLAYGROUND_TYPES = new Set<ComponentPropertyDefinition['type']>([
  'VARIANT',
  'BOOLEAN',
  'TEXT'
])

export type PlaygroundValues = Record<string, string>

export interface ComponentPlayground {
  /** A private copy of the document: nothing tried here reaches the file or its history. */
  graph: SceneGraph
  pageId: string
  /** The instance that shows the tried values. */
  nodeId: string
}

/** The component the playground starts from: the instance's, the set's default, or itself. */
function startComponent(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  if (node.type === 'INSTANCE') {
    const main = node.componentId ? graph.getNode(node.componentId) : undefined
    return main?.type === 'COMPONENT' ? main : undefined
  }
  if (node.type === 'COMPONENT_SET') return defaultVariant(graph, node)
  return node.type === 'COMPONENT' ? node : undefined
}

function owningSet(graph: SceneGraph, component: SceneNode): SceneNode | undefined {
  const parent = component.parentId ? graph.getNode(component.parentId) : undefined
  return parent?.type === 'COMPONENT_SET' ? parent : undefined
}

/**
 * Figma's component playground: the properties of a selected component, component set or
 * instance that the playground lets you try, with the values it starts from.
 */
export function componentPlaygroundProperties(
  graph: SceneGraph,
  nodeId: string
): { definitions: ComponentPropertyDefinition[]; values: PlaygroundValues } | null {
  const node = graph.getNode(nodeId)
  const component = node ? startComponent(graph, node) : undefined
  if (!node || !component) return null
  const owners = [owningSet(graph, component), component].filter(
    (owner): owner is SceneNode => owner !== undefined
  )
  const definitions = uniqBy(
    owners.flatMap((owner) => owner.componentPropertyDefinitions),
    (definition) => definition.id
  ).filter((definition) => PLAYGROUND_TYPES.has(definition.type))
  const values: PlaygroundValues = {}
  for (const definition of definitions) {
    values[definition.id] =
      definition.type === 'VARIANT'
        ? (component.componentPropertyValues[definition.name] ?? definition.defaultValue)
        : (node.componentPropertyAssignments[definition.id] ?? definition.defaultValue)
  }
  return { definitions, values }
}

/**
 * An instance of the component showing the tried values, on a private copy of the document, so
 * trying values never changes the file, its selection or its undo history.
 */
export function createComponentPlayground(
  source: SceneGraph,
  nodeId: string,
  values: PlaygroundValues
): ComponentPlayground | null {
  const node = source.getNode(nodeId)
  const component = node ? startComponent(source, node) : undefined
  const properties = componentPlaygroundProperties(source, nodeId)
  const pageId = component ? findPageId(source, component.id) : null
  if (!component || !properties || !pageId) return null
  const set = owningSet(source, component)
  const graph = extractPageContext(source, pageId, [set?.id ?? component.id])

  const variantValues: Record<string, string> = {}
  for (const definition of properties.definitions) {
    if (definition.type === 'VARIANT')
      variantValues[definition.name] = values[definition.id] ?? definition.defaultValue
  }
  const variant = set ? (findVariantByValues(graph, set.id, variantValues) ?? component) : component
  const instance = graph.createInstance(variant.id, pageId, { x: 0, y: 0 })
  if (!instance) return null
  for (const definition of properties.definitions) {
    const value = values[definition.id]
    if (definition.type === 'VARIANT' || value === undefined) continue
    applyComponentPropertyValue(graph, instance.id, definition, value)
    measurePropertyText({ graph }, instance.id, definition)
  }
  return { graph, pageId, nodeId: instance.id }
}
