import type { GUID, NodeChange } from '@open-pencil/kiwi/fig/codec'
import { guidToString } from '@open-pencil/kiwi/fig/guid'

const TEXT_STYLE_FIELDS = [
  'fontSize',
  'fontName',
  'lineHeight',
  'letterSpacing',
  'textDecoration',
  'textCase'
] as const

type StyleRefFields = Record<string, unknown> & {
  styleIdForFill?: StyleReference
  styleIdForStrokeFill?: StyleReference
  styleIdForText?: StyleReference
  styleIdForEffect?: StyleReference
  styleIdForGrid?: StyleReference
}

type AssetRef = { key: string; version?: string }
type StyleReference = { guid?: GUID; assetRef?: AssetRef }

type StyleSource = Pick<
  NodeChange,
  | 'type'
  | 'styleType'
  | 'fillPaints'
  | 'effects'
  | 'layoutGrids'
  | 'fontSize'
  | 'fontName'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textDecoration'
  | 'textCase'
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

function applyPaintStyleRefs(
  changeMap: StyleChangeMap,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  const fillStyle = referencedStyle(changeMap, fields.styleIdForFill, assetRefs)
  if (fillStyle?.styleType === 'FILL' && fillStyle.fillPaints) {
    fields.fillPaints = fillStyle.fillPaints
  }
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
    else if (style[field] !== undefined) fields[field] = style[field]
  }
}

export function applyStyleRefsToFields(
  changeMap: ReadonlyMap<string, Partial<StyleSource>>,
  fields: StyleRefFields,
  assetRefs?: ReadonlyMap<string, string>
): void {
  applyPaintStyleRefs(changeMap, fields, assetRefs)
  applyEffectAndGridStyleRefs(changeMap, fields, assetRefs)
  applyTextStyleRef(changeMap, fields, assetRefs)
}
