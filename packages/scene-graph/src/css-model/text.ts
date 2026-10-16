import { parseCSSNumber } from '../css'
import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import { px, type PropertyFamily } from './types'

export const font: PropertyFamily = {
  name: 'font',
  fields: ['fontFamily', 'fontSize', 'fontWeight', 'italic', 'lineHeight', 'letterSpacing'],
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
    if (node.lineHeight !== null) style['line-height'] = css('lineHeight', px(node.lineHeight))
    if (node.letterSpacing !== 0)
      style['letter-spacing'] = css('letterSpacing', px(node.letterSpacing))
  },
  read(style, node) {
    const fontFamily = pickStyle(style, 'font-family')
    if (fontFamily)
      node.fontFamily = fontFamily.split(',')[0]?.replaceAll('"', '').trim() || node.fontFamily
    for (const [property, field] of [
      ['font-size', 'fontSize'],
      ['font-weight', 'fontWeight'],
      ['line-height', 'lineHeight'],
      ['letter-spacing', 'letterSpacing']
    ] as const) {
      const value = parseCSSNumber(pickStyle(style, property))
      if (value !== null) node[field] = value
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
