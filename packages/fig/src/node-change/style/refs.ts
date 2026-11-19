import type { NodeChange, StyleReference } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'

const TEXT_STYLE_FIELDS = [
  'fontSize',
  'fontName',
  'lineHeight',
  'letterSpacing',
  'textDecoration',
  'textCase'
] as const

type StyleRefFields = NodeChange

type StyleSource = Pick<
  NodeChange,
  | 'type'
  | 'styleType'
  | 'fillPaints'
  | 'effects'
  | 'layoutGrids'
  | (typeof TEXT_STYLE_FIELDS)[number]
>

type StyleChangeMap = ReadonlyMap<string, Partial<StyleSource>>

function referencedStyle(
  changeMap: StyleChangeMap,
  reference: StyleReference | undefined,
  assetRefs?: ReadonlyMap<string, string>
): Partial<StyleSource> | undefined {
  if (reference?.guid) return changeMap.get(guidToString(reference.guid))
  if (!reference?.assetRef || !assetRefs) return undefined
  const { key, version } = reference.assetRef
  const id = (version ? assetRefs.get(`${key}@${version}`) : undefined) ?? assetRefs.get(key)
  return id ? changeMap.get(id) : undefined
}

function applyFillStyleRef(
  changeMap: StyleChangeMap,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  const fillStyle = referencedStyle(changeMap, fields.styleIdForFill, assetRefs)
  if (fillStyle?.styleType === 'FILL' && fillStyle.fillPaints) {
    fields.fillPaints = fillStyle.fillPaints
  }
}

function applyStrokeStyleRef(
  changeMap: StyleChangeMap,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  const strokeStyle = referencedStyle(changeMap, fields.styleIdForStrokeFill, assetRefs)
  if (strokeStyle?.styleType === 'FILL' && strokeStyle.fillPaints) {
    fields.strokePaints = strokeStyle.fillPaints
  }
}

function applyEffectAndGridStyleRefs(
  changeMap: StyleChangeMap,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  const effectStyle = referencedStyle(changeMap, fields.styleIdForEffect, assetRefs)
  if (effectStyle?.styleType === 'EFFECT' && effectStyle.effects)
    fields.effects = effectStyle.effects
  const gridStyle = referencedStyle(changeMap, fields.styleIdForGrid, assetRefs)
  if (gridStyle?.styleType === 'GRID' && gridStyle.layoutGrids) {
    fields.layoutGrids = gridStyle.layoutGrids
  }
}

function applyTextStyleRef(
  changeMap: StyleChangeMap,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  const style = referencedStyle(changeMap, fields.styleIdForText, assetRefs)
  if (style?.type !== 'TEXT' || style.styleType !== 'TEXT') return
  for (const field of TEXT_STYLE_FIELDS) {
    if (field === 'textDecoration') fields.textDecoration = style.textDecoration
    else if (style[field] !== undefined) Object.assign(fields, { [field]: style[field] })
  }
}

export function applyStyleRefsToFields(
  changeMap: ReadonlyMap<string, Partial<StyleSource>>,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  applyFillStyleRef(changeMap, fields, assetRefs)
  applyStrokeStyleRef(changeMap, fields, assetRefs)
  applyEffectAndGridStyleRefs(changeMap, fields, assetRefs)
  applyTextStyleRef(changeMap, fields, assetRefs)
}

/**
 * Gives a record the fields of the styles it names, and its text's ranges the paints of the fill
 * style each names. Ranges take only fill styles: a range's style table entry naming a text style
 * keeps its own fields, and style runs keep no stroke.
 */
export function applyStyleRefsToRecord(
  changeMap: StyleChangeMap,
  record: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  applyStyleRefsToFields(changeMap, record, assetRefs)
  for (const range of record.textData?.styleOverrideTable ?? [])
    applyFillStyleRef(changeMap, range, assetRefs)
}
