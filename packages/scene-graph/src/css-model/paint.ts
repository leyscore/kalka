import { BLACK } from '../constants'
import { parseCSSNumber } from '../css'
import { clipsBackgroundToText, colorToFillFromCSS, pickStyle } from './from-css'
import { linearGradientFill } from './gradient'
import { cssColor, fillToCSS, fillsToBackground } from './to-css'
import type { PropertyFamily } from './types'

const BACKGROUND = ['background-color', 'background-image', 'background-blend-mode']

/** A box's fills: one solid color, or gradients and several layers as background images. */
export const fills: PropertyFamily = {
  name: 'fills',
  fields: ['fills', 'width', 'height'],
  properties: BACKGROUND,
  write(style, node, { css }) {
    const layered = fillsToBackground(node.fills, node.width, node.height)
    if (layered) {
      Object.assign(style, layered)
      return
    }
    const fill = fillToCSS(node.fills.at(0))
    if (fill) style['background-color'] = css('fills/0/color', fill)
  },
  read(style, node, { box }) {
    const read = colorToFillFromCSS(pickStyle(style, 'background-color'))
    // A gradient clipped to the text paints the text, not the box (see `textFills`).
    const gradient = clipsBackgroundToText(style)
      ? null
      : linearGradientFill(
          pickStyle(style, 'background-image'),
          box?.width ?? parseCSSNumber(pickStyle(style, 'width')) ?? 0,
          box?.height ?? parseCSSNumber(pickStyle(style, 'height')) ?? 0
        )
    if (gradient) read.push(gradient)
    if (read.length > 0) node.fills = read
  }
}

/**
 * An image fill is an `<img>`: its scale mode as `object-fit`. Its source is the element's, which
 * DOM/CSS reads (`packages/dom-css/src/import/image.ts`).
 */
export const image: PropertyFamily = {
  name: 'image',
  fields: ['fills', 'width', 'height'],
  properties: ['aspect-ratio', 'object-fit'],
  write(style, node) {
    const fill = node.fills.at(0)
    if (fill?.type !== 'IMAGE' || !fill.visible) return
    if (node.width > 0 && node.height > 0) style['aspect-ratio'] = `${node.width} / ${node.height}`
    if (fill.imageScaleMode === 'FIT') style['object-fit'] = 'contain'
    if (fill.imageScaleMode === 'FILL') style['object-fit'] = 'cover'
  }
}

/**
 * A shader layer's stand-in where no shader runs, such as in a static export: its colors as a
 * gradient. On the canvas the shader's own drawing covers it; its settings ride on the element.
 */
export const shaderFallback: PropertyFamily = {
  name: 'shader fallback',
  fields: ['shader', 'fills'],
  properties: ['background-image'],
  write(style, node) {
    const colors = node.shader?.colors ?? []
    if (colors.length === 0 || style['background-image']) return
    const stops = colors.length === 1 ? [colors[0], colors[0]] : colors
    style['background-image'] = `linear-gradient(135deg, ${stops.map(cssColor).join(', ')})`
  }
}

/** Text paints its letters: one color, or gradients as a background clipped to them. */
export const textFills: PropertyFamily = {
  name: 'text fills',
  fields: ['fills', 'width', 'height'],
  properties: ['color', ...BACKGROUND, '-webkit-background-clip', 'background-clip'],
  write(style, node, { css }) {
    const gradient = node.fills.some((fill) => fill.visible && fill.type.startsWith('GRADIENT'))
      ? fillsToBackground(node.fills, node.width, node.height)
      : undefined
    if (gradient) {
      Object.assign(style, gradient)
      style['-webkit-background-clip'] = 'text'
      style['background-clip'] = 'text'
      style.color = 'transparent'
      return
    }
    const color = fillToCSS(node.fills.at(0))
    style.color = color ? css('fills/0/color', color) : cssColor(BLACK)
  },
  read(style, node) {
    const read = colorToFillFromCSS(pickStyle(style, 'color'))
    // The text's own box is not known yet; a square keeps the gradient's direction close.
    const clipped = clipsBackgroundToText(style)
      ? linearGradientFill(pickStyle(style, 'background-image'), 100, 100)
      : null
    if (clipped) node.fills = [clipped]
    else if (read.length > 0) node.fills = read
  }
}
