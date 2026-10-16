import { uniq } from 'es-toolkit'

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
  x: ['left'],
  y: ['top'],
  width: ['width', 'aspect-ratio'],
  height: ['height', 'aspect-ratio']
}
/** Fields CSS never sets: what the layer is and holds rather than how it looks. */
const KEPT_FIELDS = new Set<string>(['type', 'childIds', 'text'])

/** The CSS properties the families written from `fields` own. */
function propertiesWrittenFrom(fields: ReadonlySet<string>): Set<string> {
  return new Set(
    FAMILIES.filter((family) => family.fields.some((field) => fields.has(field))).flatMap(
      (family) => family.properties
    )
  )
}

const literal = (_field: string, value: string) => value

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
  const replaced = propertiesWrittenFrom(new Set(fields))
  const kept = Object.entries(node.style).filter(([property]) => !replaced.has(property))
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
