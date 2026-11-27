import { isEmptyObject, uniq } from 'es-toolkit'

import { createDefaultNode } from '../node-defaults'
import type { CSSDeclarations, SceneNode } from '../types'
import {
  BOX_PROPERTIES,
  propertiesFor,
  readLayerStyle,
  TEXT_PROPERTIES,
  writeLayerStyle
} from './table'
import type { PropertyFamily } from './types'

const FAMILIES: readonly PropertyFamily[] = uniq([...BOX_PROPERTIES, ...TEXT_PROPERTIES])

/** Every field the table writes CSS from: a change to one of them changes the layer's CSS. */
export const STYLE_FIELDS: ReadonlySet<string> = new Set(
  FAMILIES.flatMap((family) => family.fields)
)

/** Fields layout measures for a layer whose CSS leaves them open, such as a size that hugs. */
const MEASURED_FIELDS = [
  'x',
  'y',
  'width',
  'height'
] as const satisfies readonly (keyof SceneNode)[]
const MEASURED_BY: Record<(typeof MEASURED_FIELDS)[number], readonly string[]> = {
  x: ['left', 'right'],
  y: ['top', 'bottom'],
  // Insets on both sides size a layer stretched in auto layout (`readPinnedAxis`).
  width: ['width', 'aspect-ratio', 'right'],
  height: ['height', 'aspect-ratio', 'bottom']
}
/**
 * Fields CSS never sets, what the layer is and holds rather than how it looks, and constraints,
 * which only the insets of a layer absolutely positioned in auto layout give: a free layer keeps
 * its own.
 */
const KEPT_FIELDS = new Set<string>([
  'type',
  'childIds',
  'text',
  'horizontalConstraint',
  'verticalConstraint'
])

/** The CSS properties the families written from `fields` own. */
function propertiesWrittenFrom(fields: ReadonlySet<string>): Set<string> {
  return new Set(
    FAMILIES.filter((family) => family.fields.some((field) => fields.has(field))).flatMap(
      (family) => family.properties
    )
  )
}

const literal = (_field: string, value: string) => value

/** Shorthands that do not cover every property named after them. */
const SHORTHAND_LONGHANDS: Partial<Record<string, readonly string[]>> = {
  flex: ['flex-grow', 'flex-shrink', 'flex-basis']
}

/**
 * Whether a shorthand sets one of the properties: `background` sets `background-color`, so a
 * fill written as `background-color` must not be painted over by the `background` an imported
 * page wrote.
 */
function setsAnyOf(shorthand: string, properties: ReadonlySet<string>): boolean {
  const longhands = SHORTHAND_LONGHANDS[shorthand]
  if (longhands) return longhands.some((longhand) => properties.has(longhand))
  const prefix = `${shorthand}-`
  for (const property of properties) if (property.startsWith(prefix)) return true
  return false
}

/**
 * A layer's whole CSS: what the table writes from its fields and parent, literal values in
 * export order, then the declarations of its `style`, which the fields do not give.
 */
export function layerCSS(node: SceneNode, parent: SceneNode | undefined): CSSDeclarations {
  return { ...writeLayerStyle(node, { parent, css: literal }), ...node.style }
}

/**
 * The layer's `style` once fields changed: the declarations of the families written from those
 * fields give way to them; the others stay as written. Null when nothing gives way.
 */
export function styleAfterFieldChanges(
  node: SceneNode,
  fields: Iterable<string>
): CSSDeclarations | null {
  // Most layers keep no CSS of their own; a gesture runs this every frame.
  if (isEmptyObject(node.style)) return null
  const replaced = propertiesWrittenFrom(new Set(fields))
  const kept = Object.entries(node.style).filter(
    ([property]) => !replaced.has(property) && !setsAnyOf(property, replaced)
  )
  return kept.length === Object.keys(node.style).length ? null : Object.fromEntries(kept)
}

/**
 * The fields a layer's CSS gives, as changes to the layer: each mapped field read from the
 * declarations, those they leave unset back to their defaults, and the measured position and
 * size kept where the CSS leaves them to layout.
 */
export function fieldsFromStyle(
  node: SceneNode,
  parent: SceneNode | undefined,
  declarations: CSSDeclarations
): Partial<SceneNode> {
  const defaults = createDefaultNode(() => node.id, node.type)
  const draft = structuredClone(node)
  const fields = new Set(propertiesFor(node).flatMap((family) => family.fields))
  for (const field of fields) {
    if (KEPT_FIELDS.has(field) || field in MEASURED_BY) continue
    Reflect.set(draft, field, structuredClone(Reflect.get(defaults, field)))
  }
  readLayerStyle(draft, declarations, { projected: { parent } })
  for (const field of MEASURED_FIELDS)
    if (!MEASURED_BY[field].some((property) => property in declarations)) draft[field] = node[field]

  const changes: Partial<SceneNode> = {}
  for (const field of fields) {
    const value = Reflect.get(draft, field)
    if (JSON.stringify(value) !== JSON.stringify(Reflect.get(node, field)))
      Reflect.set(changes, field, value)
  }
  return changes
}

/**
 * The fields of the families that own any of `properties`: what reading those declarations can
 * change, and nothing else.
 */
export function fieldsOwning(properties: Iterable<string>): Set<string> {
  const owned = new Set(properties)
  return new Set(
    FAMILIES.filter((family) => family.properties.some((property) => owned.has(property))).flatMap(
      (family) => family.fields
    )
  )
}

/** The fields of the families written from any of `fields`. */
export function familyFields(fields: Iterable<string>): Set<string> {
  return fieldsOwning(propertiesWrittenFrom(new Set(fields)))
}

/**
 * Writing a layer's whole CSS: the fields its declarations give, and as `style` the
 * declarations the fields cannot write back as written, such as `width: 50%`, `padding: 1rem`
 * or `cursor: pointer`.
 */
export function cssWrite(
  node: SceneNode,
  parent: SceneNode | undefined,
  declarations: CSSDeclarations
): Partial<SceneNode> {
  const fields = fieldsFromStyle(node, parent, declarations)
  const written = writeLayerStyle({ ...node, ...fields }, { parent, css: literal })
  const style: CSSDeclarations = {}
  for (const [property, value] of Object.entries(declarations))
    if (written[property] !== value) style[property] = value
  return { ...fields, style }
}
