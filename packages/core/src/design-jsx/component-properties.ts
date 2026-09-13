import * as v from 'valibot'

import { applyComponentPropertyValue, componentPropertyDefinitions } from '@open-pencil/scene-graph'
import type {
  ComponentPropertyDefinition,
  ComponentPropertyReference,
  SceneGraph,
  SceneNode
} from '@open-pencil/scene-graph'

const definitionSchema = v.object({
  id: v.string(),
  name: v.string(),
  type: v.picklist(['VARIANT', 'TEXT', 'BOOLEAN', 'INSTANCE_SWAP']),
  defaultValue: v.string(),
  variantOptions: v.optional(v.array(v.string())),
  preferredValues: v.optional(v.array(v.string()))
}) satisfies v.GenericSchema<ComponentPropertyDefinition>
const referenceSchema = v.object({
  propertyId: v.string(),
  field: v.picklist(['VISIBLE', 'TEXT', 'INSTANCE_SWAP'])
}) satisfies v.GenericSchema<ComponentPropertyReference>

/** Accept the native graph contracts, without introducing a second property model. */
export function componentMetadata(
  props: Record<string, unknown>,
  type: SceneNode['type']
): Partial<SceneNode> {
  const result: Partial<SceneNode> = {}
  if (props.properties !== undefined && type !== 'INSTANCE') {
    if (type !== 'COMPONENT' && type !== 'COMPONENT_SET')
      throw new Error('Only components, component sets, and instances accept properties')
    const definitions = v.parse(v.array(definitionSchema), props.properties)
    if (new Set(definitions.map((definition) => definition.id)).size !== definitions.length)
      throw new Error('Duplicate component property IDs')
    result.componentPropertyDefinitions = definitions
  }
  if (props.propertyRefs !== undefined) {
    const references = v.parse(v.array(referenceSchema), props.propertyRefs)
    for (const reference of references) {
      if (reference.field === 'TEXT' && type !== 'TEXT')
        throw new Error('TEXT properties require a text node')
      if (reference.field === 'INSTANCE_SWAP' && type !== 'INSTANCE')
        throw new Error('INSTANCE_SWAP properties require an instance')
    }
    result.componentPropertyReferences = references
  }
  return result
}

export function assignComponentProperties(
  graph: SceneGraph,
  instance: SceneNode,
  input: unknown
): void {
  if (input === undefined) return
  const assignments = v.parse(v.record(v.string(), v.string()), input)
  const definitions = componentPropertyDefinitions(graph, instance)
  for (const [id, value] of Object.entries(assignments)) {
    const definition = definitions.find((item) => item.id === id)
    if (!definition) throw new Error(`Unknown component property: ${id}`)
    if (definition.type === 'VARIANT')
      throw new Error('Select a component-set variant when creating the instance')
    if (definition.type === 'BOOLEAN' && value !== 'true' && value !== 'false')
      throw new Error(`Expected true or false for component property: ${id}`)
    if (!applyComponentPropertyValue(graph, instance.id, definition, value))
      throw new Error(`Cannot assign component property: ${id}`)
  }
}
