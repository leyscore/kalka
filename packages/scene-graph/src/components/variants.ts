import { compact, uniq } from 'es-toolkit/array'

import type { SceneGraph } from '../index'
import type { ComponentPropertyDefinition, SceneNode } from '../types'

/** Variants in reading order on the canvas: top to bottom, then left to right, then by name. */
export function compareCanvasPosition(a: SceneNode, b: SceneNode): number {
  return a.y - b.y || a.x - b.x || a.name.localeCompare(b.name)
}

/**
 * A component set's default variant, the one an instance starts as: the variant in its
 * top-left corner, as Figma defines it.
 */
export function defaultVariant(graph: SceneGraph, set: SceneNode): SceneNode | undefined {
  return graph
    .getChildren(set.id)
    .filter((child) => child.type === 'COMPONENT')
    .sort(compareCanvasPosition)[0]
}

/**
 * The value a variant property starts at: the default variant's, as Figma reads it whatever
 * default the document records, and follows when another variant moves to the top left. The
 * recorded default stands only while the default variant has no value for the property.
 */
export function variantDefaultValue(
  graph: SceneGraph,
  set: SceneNode,
  property: { name: string; defaultValue: string }
): string {
  const value = defaultVariant(graph, set)?.componentPropertyValues[property.name]
  return value || property.defaultValue
}

/**
 * A variant property's values: the ones the document records, then any its variants use that it
 * does not, since older documents record none and a set's page may have loaded only some
 * variants.
 */
export function variantOptions(
  graph: SceneGraph,
  set: SceneNode,
  property: { name: string; variantOptions?: string[] }
): string[] {
  const used = graph
    .getChildren(set.id)
    .map((child) =>
      child.type === 'COMPONENT' ? child.componentPropertyValues[property.name] : ''
    )
  return compact(uniq([...(property.variantOptions ?? []), ...used]))
}

/** A set's definition with a variant property's values and default filled in from its variants. */
export function resolvedVariantDefinition(
  graph: SceneGraph,
  set: SceneNode,
  definition: ComponentPropertyDefinition
): ComponentPropertyDefinition {
  if (definition.type !== 'VARIANT') return definition
  const options = { ...definition, variantOptions: variantOptions(graph, set, definition) }
  return { ...options, defaultValue: variantDefaultValue(graph, set, options) }
}
