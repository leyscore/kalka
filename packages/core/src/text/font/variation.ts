import { styleToWeight } from '@kalka/scene-graph'
import type { FontVariation } from '@kalka/scene-graph'

interface TableRange {
  offset: number
  length: number
}

const WINDOWS_PLATFORM = 3
const MAC_PLATFORM = 1
const ENGLISH_US = 0x409
const NAME_HEADER_SIZE = 6
const NAME_RECORD_SIZE = 12
const FVAR_HEADER_SIZE = 16
const AXIS_RECORD_SIZE = 20

function sfntTable(view: DataView, tag: string): TableRange | null {
  if (view.byteLength < 12) return null
  const numTables = view.getUint16(4)
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16
    if (record + 16 > view.byteLength) return null
    let recordTag = ''
    for (let c = 0; c < 4; c++) recordTag += String.fromCharCode(view.getUint8(record + c))
    if (recordTag !== tag) continue
    const offset = view.getUint32(record + 8)
    const length = view.getUint32(record + 12)
    return offset + length <= view.byteLength ? { offset, length } : null
  }
  return null
}

export function isVariableFont(data: ArrayBuffer): boolean {
  return sfntTable(new DataView(data), 'fvar') !== null
}

function fixed(view: DataView, offset: number): number {
  return view.getInt32(offset) / 65536
}

function normalizeStyleName(style: string): string {
  return style.toLowerCase().replace(/\s+/g, '')
}

function fontName(view: DataView, name: TableRange, nameId: number): string | null {
  const end = name.offset + name.length
  if (name.length < NAME_HEADER_SIZE) return null
  const count = view.getUint16(name.offset + 2)
  const strings = name.offset + view.getUint16(name.offset + 4)
  if (name.offset + NAME_HEADER_SIZE + count * NAME_RECORD_SIZE > end) return null
  let fallback: string | null = null
  for (let i = 0; i < count; i++) {
    const record = name.offset + NAME_HEADER_SIZE + i * NAME_RECORD_SIZE
    if (view.getUint16(record + 6) !== nameId) continue
    const platform = view.getUint16(record)
    const language = view.getUint16(record + 4)
    const length = view.getUint16(record + 8)
    const start = strings + view.getUint16(record + 10)
    if (start + length > end) continue
    const bytes = new Uint8Array(view.buffer, view.byteOffset + start, length)
    if (platform === WINDOWS_PLATFORM) {
      let value = ''
      for (let c = 0; c + 1 < length; c += 2)
        value += String.fromCharCode((bytes[c] << 8) | bytes[c + 1])
      if (language === ENGLISH_US) return value
      fallback ??= value
    } else if (platform === MAC_PLATFORM) {
      fallback ??= String.fromCharCode(...bytes)
    }
  }
  return fallback
}

/**
 * Returns the axis coordinates a variable font needs to render `style`, preferring the named
 * instance with that name (for example SF Pro `Medium` is `wght` 510) and otherwise clamping the
 * style's weight to the `wght` axis. Returns `null` for static fonts.
 */
export function namedInstanceVariations(data: ArrayBuffer, style: string): FontVariation[] | null {
  const view = new DataView(data)
  const fvar = sfntTable(view, 'fvar')
  if (!fvar || fvar.length < FVAR_HEADER_SIZE) return null

  const axesOffset = fvar.offset + view.getUint16(fvar.offset + 4)
  const axisCount = view.getUint16(fvar.offset + 8)
  const axisSize = view.getUint16(fvar.offset + 10)
  const instanceCount = view.getUint16(fvar.offset + 12)
  const instanceSize = view.getUint16(fvar.offset + 14)
  if (axisSize < AXIS_RECORD_SIZE || instanceSize < 4 + axisCount * 4) return null
  if (
    axesOffset + axisCount * axisSize + instanceCount * instanceSize >
    fvar.offset + fvar.length
  ) {
    return null
  }

  const axes = Array.from({ length: axisCount }, (_, index) => {
    const axis = axesOffset + index * axisSize
    let tag = ''
    for (let c = 0; c < 4; c++) tag += String.fromCharCode(view.getUint8(axis + c))
    return { tag, min: fixed(view, axis + 4), max: fixed(view, axis + 12) }
  })

  const name = sfntTable(view, 'name')
  const requested = normalizeStyleName(style)
  const instancesOffset = axesOffset + axisCount * axisSize
  const instance = name
    ? Array.from(
        { length: instanceCount },
        (_, index) => instancesOffset + index * instanceSize
      ).find((offset) => {
        const instanceName = fontName(view, name, view.getUint16(offset))
        return instanceName !== null && normalizeStyleName(instanceName) === requested
      })
    : undefined
  if (instance !== undefined) {
    return axes.map((axis, axisIndex) => ({
      axis: axis.tag,
      value: fixed(view, instance + 4 + axisIndex * 4)
    }))
  }

  const weight = axes.find((axis) => axis.tag === 'wght')
  if (!weight) return []
  return [{ axis: 'wght', value: Math.min(weight.max, Math.max(weight.min, styleToWeight(style))) }]
}

/** What a font file says of itself: its family, and the weight and slant its faces have. */
export interface FontFileDescription {
  family: string
  /** A weight such as `700`, or a variable font's range, such as `100 900`. */
  weight: string
  style: 'normal' | 'italic'
}

const OS2_WEIGHT_CLASS = 4
const OS2_FS_SELECTION = 62
const ITALIC_BIT = 1

/**
 * A TrueType or OpenType file's family, weight and slant, from its `name`, `OS/2` and `fvar`
 * tables: the typographic family when it names one, as design tools list it. Null for a file
 * that is not an uncompressed font, such as WOFF2.
 */
export function describeFontFile(data: ArrayBuffer): FontFileDescription | null {
  const view = new DataView(data)
  const name = sfntTable(view, 'name')
  if (!name) return null
  const family = fontName(view, name, 16) ?? fontName(view, name, 1)
  if (!family?.trim()) return null
  const subfamily = fontName(view, name, 17) ?? fontName(view, name, 2) ?? ''
  const os2 = sfntTable(view, 'OS/2')
  const weightClass =
    os2 && os2.length > OS2_WEIGHT_CLASS + 1 ? view.getUint16(os2.offset + OS2_WEIGHT_CLASS) : 0
  const italic =
    /italic|oblique/i.test(subfamily) ||
    (!!os2 &&
      os2.length > OS2_FS_SELECTION + 1 &&
      (view.getUint16(os2.offset + OS2_FS_SELECTION) & ITALIC_BIT) !== 0)
  let weight = String(
    weightClass >= 1 && weightClass <= 1000 ? weightClass : styleToWeight(subfamily)
  )
  const fvar = sfntTable(view, 'fvar')
  if (fvar && fvar.length >= FVAR_HEADER_SIZE) {
    const axesOffset = fvar.offset + view.getUint16(fvar.offset + 4)
    const axisCount = view.getUint16(fvar.offset + 8)
    const axisSize = view.getUint16(fvar.offset + 10)
    for (let index = 0; index < axisCount; index++) {
      const axis = axesOffset + index * axisSize
      if (axis + AXIS_RECORD_SIZE > fvar.offset + fvar.length) break
      let tag = ''
      for (let c = 0; c < 4; c++) tag += String.fromCharCode(view.getUint8(axis + c))
      if (tag === 'wght')
        weight = `${Math.round(fixed(view, axis + 4))} ${Math.round(fixed(view, axis + 12))}`
    }
  }
  return { family: family.trim(), weight, style: italic ? 'italic' : 'normal' }
}
