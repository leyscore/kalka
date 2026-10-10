import * as v from 'valibot'

import type { SceneNode } from '@open-pencil/scene-graph'

import { decodeValue, sameAsWritten } from './values'

/** Layer fields the page's HTML holds in its structure and attributes rather than as props. */
const STRUCTURAL_FIELDS = new Set<string>([
  'id',
  'type',
  'name',
  'parentId',
  'childIds',
  'visible',
  'locked',
  'internalOnly'
])

/**
 * Fields the folder does not keep: `.fig` bookkeeping for writing a `.fig` back, and text
 * outlines the renderer shapes again from fonts. Text set on a path keeps its outlines, since
 * they are what draws it.
 */
export const UNSAVED_LAYER_FIELDS: ReadonlySet<string> = new Set([
  'source',
  'textPicture',
  'derivedTextGlyphs'
])

/** Fields CSS cannot hold, by name: what a layer keeps beside the CSS that draws it. */
export type Residual = Record<string, unknown>

function savedField(key: string, node?: SceneNode): boolean {
  if (key === 'derivedTextGlyphs' && node?.textPathData) return true
  return !STRUCTURAL_FIELDS.has(key) && !UNSAVED_LAYER_FIELDS.has(key)
}

/**
 * The fields of `original` that reading its HTML back would not give: those that differ from
 * the layer as read, at the precision CSS keeps. Null when the CSS holds everything.
 */
export function layerResidual(original: SceneNode, read: SceneNode): Residual | null {
  const residual: Residual = {}
  for (const key of Object.keys(original) as Array<keyof SceneNode>) {
    if (!savedField(key, original)) continue
    if (!sameAsWritten(original[key], read[key])) residual[key] = original[key]
  }
  return Object.keys(residual).length > 0 ? residual : null
}

const ResidualSchema = v.record(v.string(), v.unknown())

/** The fields saved props set, as values; unknown and structural fields are left out. */
export function decodeResidual(json: unknown, target: object): Residual {
  const parsed = v.safeParse(ResidualSchema, json)
  if (!parsed.success) throw new Error('Saved layer props are not an object')
  const residual: Residual = {}
  for (const [key, value] of Object.entries(parsed.output)) {
    const field = key.startsWith('$$') ? key.slice(1) : key
    if ((savedField(field) || field === 'derivedTextGlyphs') && field in target)
      residual[field] = decodeValue(value)
  }
  return residual
}

/** Saved props from the text of a `data-kalka-props` attribute. */
export function parseResidualAttribute(text: string, target: object): Residual {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), ResidualSchema), text)
  if (!parsed.success) throw new Error('Saved layer props are not valid JSON')
  return decodeResidual(parsed.output, target)
}
