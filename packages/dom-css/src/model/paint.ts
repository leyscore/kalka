import { isValid, toUint8Array } from 'js-base64'

import type { Fill, ImageScaleMode, SceneNode } from '@kalka/scene-graph'
import { BLACK, TRANSPARENT } from '@kalka/scene-graph/constants'
import { parseCSSNumber } from '@kalka/scene-graph/css'
import { computeImageHash } from '@kalka/scene-graph/images'

import { cssColor, fillToCSS, fillsToBackground } from '../export/css'
import { DOM_CSS_PLUGIN_ID, IMAGE_SOURCE_URL_KEY } from '../export/tags'
import { colorToFillFromCSS, pickStyle } from '../import/css-values'
import { linearGradientFill } from '../import/gradient'
import { clipsBackgroundToText } from '../import/phrasing'
import type { DesignStyleDeclaration } from '../types'
import type { PropertyFamily, ReadContext } from './types'

const BACKGROUND = ['background-color', 'background-image', 'background-blend-mode']

/** A box's fills: one solid color, or gradients and several layers as background images. */
export const fills: PropertyFamily = {
  name: 'fills',
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
  read(style, node, { element }) {
    const read = colorToFillFromCSS(pickStyle(style, 'background-color'))
    // A gradient clipped to the text paints the text, not the box (see `textFills`).
    const gradient = clipsBackgroundToText(style)
      ? null
      : linearGradientFill(
          pickStyle(style, 'background-image'),
          element?.layoutBox?.width ?? parseCSSNumber(pickStyle(style, 'width')) ?? 0,
          element?.layoutBox?.height ?? parseCSSNumber(pickStyle(style, 'height')) ?? 0
        )
    if (gradient) read.push(gradient)
    if (read.length > 0) node.fills = read
  }
}

function imageScaleModeFromObjectFit(value: string | undefined): ImageScaleMode | null {
  if (value === 'contain' || value === 'scale-down') return 'FIT'
  if (value === 'cover') return 'FILL'
  return null
}

function bytesFromDataURL(value: string | undefined): Uint8Array | null {
  if (!value?.startsWith('data:')) return null
  const commaIndex = value.indexOf(',')
  if (commaIndex === -1) return null
  const metadata = value.slice(0, commaIndex)
  const body = value.slice(commaIndex + 1)
  // Invalid Base64 in imported HTML drops that image instead of the whole import.
  if (!metadata.endsWith(';base64') || !isValid(body)) return null
  return toUint8Array(body)
}

function imageFill(hash: string, style: DesignStyleDeclaration): Fill {
  return {
    type: 'IMAGE',
    imageHash: hash,
    imageScaleMode: imageScaleModeFromObjectFit(pickStyle(style, 'object-fit')) ?? 'FILL',
    color: TRANSPARENT,
    opacity: 1,
    visible: true
  }
}

function readImage(style: DesignStyleDeclaration, node: SceneNode, context: ReadContext): void {
  const { graph, element, resolveImage } = context
  if (element?.tagName.toLowerCase() !== 'img') return
  const source = element.attrs.src
  const resolved = source && resolveImage ? resolveImage(source) : null
  if (resolved) {
    node.fills = [imageFill(resolved, style)]
    return
  }
  const bytes = bytesFromDataURL(source)
  if (!bytes) {
    if (source)
      node.pluginData.push({
        pluginId: DOM_CSS_PLUGIN_ID,
        key: IMAGE_SOURCE_URL_KEY,
        value: source
      })
    return
  }
  const imageHash = computeImageHash(bytes)
  graph.images.set(imageHash, bytes)
  node.fills = [imageFill(imageHash, style)]
}

/** An image fill is an `<img>`: its source on the element, its scale mode as `object-fit`. */
export const image: PropertyFamily = {
  name: 'image',
  properties: ['aspect-ratio', 'object-fit'],
  write(style, node) {
    const fill = node.fills.at(0)
    if (fill?.type !== 'IMAGE' || !fill.visible) return
    if (node.width > 0 && node.height > 0) style['aspect-ratio'] = `${node.width} / ${node.height}`
    if (fill.imageScaleMode === 'FIT') style['object-fit'] = 'contain'
    if (fill.imageScaleMode === 'FILL') style['object-fit'] = 'cover'
  },
  read: readImage
}

/**
 * A shader layer's stand-in where no shader runs, such as in a static export: its colors as a
 * gradient. On the canvas the shader's own drawing covers it; its settings ride on the element.
 */
export const shaderFallback: PropertyFamily = {
  name: 'shader fallback',
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
