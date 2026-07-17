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
  styleIdForFill?: { guid?: GUID }
  styleIdForStrokeFill?: { guid?: GUID }
  styleIdForText?: { guid?: GUID }
  styleIdForEffect?: { guid?: GUID }
  styleIdForGrid?: { guid?: GUID }
}

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
  reference: { guid?: GUID } | undefined
): Partial<StyleSource> | undefined {
  return reference?.guid ? changeMap.get(guidToString(reference.guid)) : undefined
}

function applyPaintStyleRefs(changeMap: StyleChangeMap, fields: StyleRefFields): void {
  const fillStyle = referencedStyle(changeMap, fields.styleIdForFill)
  if (fillStyle?.styleType === 'FILL' && fillStyle.fillPaints) {
    fields.fillPaints = fillStyle.fillPaints
  }
  const strokeStyle = referencedStyle(changeMap, fields.styleIdForStrokeFill)
  if (strokeStyle?.styleType === 'FILL' && strokeStyle.fillPaints) {
    fields.strokePaints = strokeStyle.fillPaints
  }
}

function applyEffectAndGridStyleRefs(changeMap: StyleChangeMap, fields: StyleRefFields): void {
  const effectStyle = referencedStyle(changeMap, fields.styleIdForEffect)
  if (effectStyle?.styleType === 'EFFECT' && effectStyle.effects)
    fields.effects = effectStyle.effects
  const gridStyle = referencedStyle(changeMap, fields.styleIdForGrid)
  if (gridStyle?.styleType === 'GRID' && gridStyle.layoutGrids) {
    fields.layoutGrids = gridStyle.layoutGrids
  }
}

function applyTextStyleRef(changeMap: StyleChangeMap, fields: StyleRefFields): void {
  const style = referencedStyle(changeMap, fields.styleIdForText)
  if (style?.type !== 'TEXT' || style.styleType !== 'TEXT') return
  for (const field of TEXT_STYLE_FIELDS) {
    if (field === 'textDecoration') fields.textDecoration = style.textDecoration
    else if (style[field] !== undefined) fields[field] = style[field]
  }
}

export function applyStyleRefsToFields(
  changeMap: ReadonlyMap<string, Partial<StyleSource>>,
  fields: StyleRefFields
): void {
  applyPaintStyleRefs(changeMap, fields)
  applyEffectAndGridStyleRefs(changeMap, fields)
  applyTextStyleRef(changeMap, fields)
}
