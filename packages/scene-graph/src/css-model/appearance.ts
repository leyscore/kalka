import { parseCSSNumber, parseCSSShadows } from '../css'
import type { SceneNode } from '../types'
import { pickStyle } from './from-css'
import { blendModeFromCSS, blurEffects } from './paint-from-css'
import { blendModeToCSS, effectsToCSS, textShadowToCSS } from './to-css'
import { type CSSDeclarations, type PropertyFamily, px } from './types'

export const effects: PropertyFamily = {
  name: 'effects',
  fields: ['effects'],
  properties: ['box-shadow', 'filter', 'backdrop-filter'],
  write(style, node) {
    Object.assign(style, effectsToCSS(node.effects))
  },
  read(style, node) {
    const read = [...parseCSSShadows(pickStyle(style, 'box-shadow')), ...blurEffects(style)]
    if (read.length > 0) node.effects = read
  }
}

/** Text draws its drop shadows on the letters. */
export const textShadow: PropertyFamily = {
  name: 'text shadow',
  fields: ['effects'],
  properties: ['text-shadow'],
  write(style, node) {
    const shadow = textShadowToCSS(node.effects)
    if (shadow) style['text-shadow'] = shadow
  },
  read(style, node) {
    const read = parseCSSShadows(pickStyle(style, 'text-shadow'))
    if (read.length > 0) node.effects = read
  }
}

export const opacity: PropertyFamily = {
  name: 'opacity',
  fields: ['opacity'],
  properties: ['opacity'],
  write(style, node, { css }) {
    if (node.opacity < 1) style.opacity = css('opacity', String(node.opacity))
  },
  read(style, node) {
    const value = parseCSSNumber(pickStyle(style, 'opacity'))
    if (value !== null) node.opacity = value
  }
}

export const blendMode: PropertyFamily = {
  name: 'blend mode',
  fields: ['blendMode'],
  properties: ['mix-blend-mode'],
  write(style, node) {
    const blend = blendModeToCSS(node.blendMode)
    if (blend) style['mix-blend-mode'] = blend
  },
  read(style, node) {
    const mode = blendModeFromCSS(pickStyle(style, 'mix-blend-mode'))
    if (mode) node.blendMode = mode
  }
}

const CORNERS = [
  ['border-top-left-radius', 'topLeftRadius'],
  ['border-top-right-radius', 'topRightRadius'],
  ['border-bottom-right-radius', 'bottomRightRadius'],
  ['border-bottom-left-radius', 'bottomLeftRadius']
] as const

/**
 * A corner radius in pixels. A percentage is of the box, as `border-radius: 50%` draws a circle;
 * an elliptical corner keeps its horizontal radius.
 */
function cornerRadiusOf(node: SceneNode, style: CSSDeclarations, property: string) {
  const value = pickStyle(style, property)?.trim().split(/\s+/)[0]
  if (value?.endsWith('%')) {
    const percent = Number.parseFloat(value)
    return Number.isFinite(percent) ? (Math.min(node.width, node.height) * percent) / 100 : null
  }
  return parseCSSNumber(value)
}

export const cornerRadii: PropertyFamily = {
  name: 'corner radii',
  fields: [
    'type',
    'independentCorners',
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomRightRadius',
    'bottomLeftRadius'
  ],
  properties: ['border-radius', ...CORNERS.map(([property]) => property)],
  write(style, node, { css }) {
    if (node.type === 'ELLIPSE') {
      style['border-radius'] = '50%'
      return
    }
    if (node.independentCorners) {
      for (const [property, field] of CORNERS)
        if (node[field] > 0) style[property] = css(field, px(node[field]))
      return
    }
    if (node.cornerRadius > 0) style['border-radius'] = css('cornerRadius', px(node.cornerRadius))
  },
  read(style, node) {
    const cornerRadius = cornerRadiusOf(node, style, 'border-radius')
    const corners = CORNERS.map(([property]) => cornerRadiusOf(node, style, property))
    if (cornerRadius !== null) node.cornerRadius = cornerRadius
    if (corners.every((radius) => radius === null)) return

    const fallback = cornerRadius ?? 0
    CORNERS.forEach(([, field], index) => {
      node[field] = corners[index] ?? fallback
    })
    node.independentCorners = CORNERS.some(([, field]) => node[field] !== fallback)
  }
}

export const clipsContent: PropertyFamily = {
  name: 'clip content',
  fields: ['clipsContent'],
  properties: ['overflow'],
  write(style, node) {
    if (node.clipsContent) style.overflow = 'hidden'
  },
  read(style, node) {
    const overflow = pickStyle(style, 'overflow')
    if (overflow === 'hidden' || overflow === 'clip') node.clipsContent = true
  }
}
