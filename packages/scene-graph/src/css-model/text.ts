import valueParser from 'postcss-value-parser'

import { parseCSSNumber } from '../css'
import { pixelsFromPercent, spacingPercent } from '../text-paragraphs'
import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import { px, type PropertyFamily } from './types'

/** A spacing as a multiple of the font size, the way CSS keeps it following the size. */
function fontRelative(pixels: number, fontSize: number): string {
  return String(spacingPercent(pixels, fontSize) / 100)
}

/**
 * A spacing CSS gives relative to the font size: a unitless line height, or `em` and `%`. The
 * pixels it comes to at the layer's font size, or null when it is not one.
 */
function readFontRelative(value: string | undefined, fontSize: number, unitless: boolean) {
  const dimension = value ? valueParser.unit(value.trim()) : false
  if (!dimension) return null
  const number = Number(dimension.number)
  if (!Number.isFinite(number)) return null
  const unit = dimension.unit.toLowerCase()
  if (unit === 'em' || (unitless && unit === '')) return pixelsFromPercent(number * 100, fontSize)
  if (unit === '%') return pixelsFromPercent(number, fontSize)
  return null
}

export const font: PropertyFamily = {
  name: 'font',
  fields: [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'italic',
    'lineHeight',
    'lineHeightUnit',
    'letterSpacing',
    'letterSpacingUnit'
  ],
  properties: [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing'
  ],
  write(style, node, { css }) {
    style['font-family'] = node.fontFamily
    style['font-size'] = css('fontSize', px(node.fontSize))
    style['font-weight'] = String(node.fontWeight)
    if (node.italic) style['font-style'] = 'italic'
    // A percentage is a unitless line height, which runs in another size scale as Figma's do.
    if (node.lineHeight !== null) {
      const literal =
        node.lineHeightUnit === 'PERCENT' && node.fontSize > 0
          ? fontRelative(node.lineHeight, node.fontSize)
          : px(node.lineHeight)
      style['line-height'] = css('lineHeight', literal)
    }
    if (node.letterSpacing !== 0) {
      const literal =
        node.letterSpacingUnit === 'PERCENT' && node.fontSize > 0
          ? `${fontRelative(node.letterSpacing, node.fontSize)}em`
          : px(node.letterSpacing)
      style['letter-spacing'] = css('letterSpacing', literal)
    }
  },
  read(style, node) {
    const fontFamily = pickStyle(style, 'font-family')
    if (fontFamily)
      node.fontFamily = fontFamily.split(',')[0]?.replaceAll('"', '').trim() || node.fontFamily
    for (const [property, field] of [
      ['font-size', 'fontSize'],
      ['font-weight', 'fontWeight']
    ] as const) {
      const value = parseCSSNumber(pickStyle(style, property))
      if (value !== null) node[field] = value
    }
    const lineHeight = pickStyle(style, 'line-height')
    const relativeLineHeight = readFontRelative(lineHeight, node.fontSize, true)
    if (relativeLineHeight !== null) {
      node.lineHeight = relativeLineHeight
      node.lineHeightUnit = 'PERCENT'
    } else {
      const value = parseCSSNumber(lineHeight)
      if (value !== null) {
        node.lineHeight = value
        node.lineHeightUnit = 'PIXELS'
      }
    }
    const letterSpacing = pickStyle(style, 'letter-spacing')
    const relativeLetterSpacing = readFontRelative(letterSpacing, node.fontSize, false)
    if (relativeLetterSpacing !== null) {
      node.letterSpacing = relativeLetterSpacing
      node.letterSpacingUnit = 'PERCENT'
    } else {
      const value = parseCSSNumber(letterSpacing)
      if (value !== null) {
        node.letterSpacing = value
        node.letterSpacingUnit = 'PIXELS'
      }
    }
    node.italic = pickStyle(style, 'font-style') === 'italic'
  }
}

export const textAlign: PropertyFamily = {
  name: 'text align',
  fields: ['textAlignHorizontal'],
  properties: ['text-align'],
  write(style, node) {
    if (node.textAlignHorizontal === 'JUSTIFIED') style['text-align'] = 'justify'
    else if (node.textAlignHorizontal !== 'LEFT')
      style['text-align'] = node.textAlignHorizontal.toLowerCase()
  },
  read(style, node) {
    const value = pickStyle(style, 'text-align')?.toUpperCase()
    if (value === 'CENTER' || value === 'RIGHT') node.textAlignHorizontal = value
    if (value === 'JUSTIFY') node.textAlignHorizontal = 'JUSTIFIED'
  }
}

/**
 * Where the lines sit in a box taller than they are. A block's `align-content` does what Figma's
 * vertical alignment does, and a box that hugs its text leaves it nothing to move.
 */
export const textAlignVertical: PropertyFamily = {
  name: 'text vertical align',
  fields: ['textAlignVertical'],
  properties: ['align-content'],
  write(style, node) {
    if (node.textAlignVertical === 'CENTER') style['align-content'] = 'center'
    else if (node.textAlignVertical === 'BOTTOM') style['align-content'] = 'end'
  },
  read(style, node) {
    const value = pickStyle(style, 'align-content')
    if (value === 'center') node.textAlignVertical = 'CENTER'
    if (value === 'end' || value === 'flex-end') node.textAlignVertical = 'BOTTOM'
  }
}

const TEXT_CASES = [
  ['UPPER', 'uppercase'],
  ['LOWER', 'lowercase'],
  ['TITLE', 'capitalize']
] as const satisfies readonly (readonly [SceneNode['textCase'], string])[]

export const textDecoration: PropertyFamily = {
  name: 'text decoration',
  fields: ['textDecoration', 'textCase'],
  properties: ['text-decoration-line', 'text-transform'],
  write(style, node) {
    if (node.textDecoration !== 'NONE') {
      style['text-decoration-line'] =
        node.textDecoration === 'UNDERLINE' ? 'underline' : 'line-through'
    }
    const textCase = TEXT_CASES.find(([field]) => field === node.textCase)
    if (textCase) style['text-transform'] = textCase[1]
  },
  read(style, node) {
    const decoration = pickStyle(style, 'text-decoration-line')
    if (decoration === 'underline') node.textDecoration = 'UNDERLINE'
    if (decoration === 'line-through') node.textDecoration = 'STRIKETHROUGH'
    const transform = pickStyle(style, 'text-transform')
    const textCase = TEXT_CASES.find(([, css]) => css === transform)
    if (textCase) node.textCase = textCase[0]
  }
}

/** Auto-width text only breaks where its text does; one-line text never does. */
function textWhiteSpace(node: SceneNode): string {
  if (node.maxLines === 1) return 'nowrap'
  if (node.textAutoResize === 'WIDTH_AND_HEIGHT') return 'pre'
  return 'pre-wrap'
}

/**
 * How text wraps, and where it stops. Text set to truncate ends with an ellipsis on its last
 * line: the line limit when it has one, otherwise the lines its fixed height holds.
 */
export const textWrap: PropertyFamily = {
  name: 'text wrap',
  fields: ['maxLines', 'textAutoResize', 'textTruncation', 'lineHeight', 'height'],
  properties: [
    'white-space',
    'overflow',
    'text-overflow',
    'display',
    '-webkit-box-orient',
    '-webkit-line-clamp'
  ],
  write(style, node) {
    style['white-space'] = textWhiteSpace(node)
    if (node.textTruncation !== 'ENDING') return
    const fixedHeight = node.textAutoResize === 'NONE' || node.textAutoResize === 'TRUNCATE'
    const lines =
      node.maxLines ??
      (fixedHeight && node.lineHeight
        ? Math.max(1, Math.floor(node.height / node.lineHeight))
        : null)
    if (lines === null) return
    style.overflow = 'hidden'
    if (lines === 1) {
      style['white-space'] = 'nowrap'
      style['text-overflow'] = 'ellipsis'
      return
    }
    style.display = '-webkit-box'
    style['-webkit-box-orient'] = 'vertical'
    style['-webkit-line-clamp'] = String(lines)
  },
  read(style, node, { projected }) {
    if (pickStyle(style, 'white-space') === 'nowrap') node.maxLines = 1
    if (!projected) return
    const clamp = parseCSSNumber(style['-webkit-line-clamp'])
    if (clamp !== null) node.maxLines = clamp
    if (clamp !== null || style['text-overflow'] === 'ellipsis') node.textTruncation = 'ENDING'
  }
}
