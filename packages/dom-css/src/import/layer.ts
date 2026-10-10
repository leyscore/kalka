import { parseShaderLayer, type SceneGraph, type SceneNode } from '@open-pencil/scene-graph'
import { parseCSSNumber } from '@open-pencil/scene-graph/css'

import type { DesignElement, DesignStyleDeclaration } from '../types'
import { applyHTMLElement } from './html-element'
import { paintColor } from './paint'
import { applyElementStyle, applyTextStyle, type ImageSourceResolver } from './scene-graph'
import { textContentFromChildren } from './text-runs'

export interface LayerStyleOptions {
  /** The layer's parent, already read, whose layout decides what the child's CSS means. */
  parent: SceneNode | undefined
  /** The image an `<img src>` names, for sources that are files rather than data URLs. */
  resolveImage?: ImageSourceResolver
}

/** Whether a parent places its children itself: auto layout or grid, not free positions. */
function laysOutChildren(parent: SceneNode | undefined): parent is SceneNode {
  return parent !== undefined && parent.type !== 'CANVAS' && parent.layoutMode !== 'NONE'
}

/** Whether the layer fills its parent along an axis, which leaves the CSS size unset. */
function fillsAxis(node: SceneNode, parent: SceneNode | undefined, axis: 'width' | 'height') {
  if (!laysOutChildren(parent)) return false
  if (parent.layoutMode === 'GRID') return true
  const along = (parent.layoutMode === 'HORIZONTAL') === (axis === 'width')
  return along ? node.layoutGrow > 0 : node.layoutAlignSelf === 'STRETCH'
}

/**
 * An auto layout frame hugs its content on an axis its CSS leaves unsized and that it does not
 * fill, as the projection writes it.
 */
function applyAxisSizing(
  node: SceneNode,
  style: DesignStyleDeclaration,
  parent: SceneNode | undefined
): void {
  if (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL') return
  const hugs = (axis: 'width' | 'height') => !(axis in style) && !fillsAxis(node, parent, axis)
  const row = node.layoutMode === 'HORIZONTAL'
  if (hugs(row ? 'width' : 'height')) node.primaryAxisSizing = 'HUG'
  if (hugs(row ? 'height' : 'width')) node.counterAxisSizing = 'HUG'
}

/** Text sizes itself on the axes its CSS leaves unsized; truncation from the clamp it wrote. */
function applyTextSizing(
  node: SceneNode,
  style: DesignStyleDeclaration,
  parent: SceneNode | undefined
): void {
  const unsized = (axis: 'width' | 'height') => !(axis in style) && !fillsAxis(node, parent, axis)
  if (unsized('width') && unsized('height')) node.textAutoResize = 'WIDTH_AND_HEIGHT'
  else if (unsized('height')) node.textAutoResize = 'HEIGHT'
  const clamp = parseCSSNumber(style['-webkit-line-clamp'])
  if (clamp !== null) node.maxLines = clamp
  if (clamp !== null || style['text-overflow'] === 'ellipsis') node.textTruncation = 'ENDING'
}

/** A line's solid stroke, which the projection draws as a shadow as thick as the stroke. */
function applyLineStroke(node: SceneNode): void {
  if (node.effects.length !== 1) return
  const shadow = node.effects[0]
  if (shadow.type !== 'DROP_SHADOW') return
  if (shadow.offset.x !== 0 || shadow.offset.y !== 0 || shadow.radius !== 0) return
  const weight = shadow.spread * 2
  node.strokes = [
    { type: 'SOLID', ...paintColor(shadow.color), weight, visible: true, align: 'CENTER' }
  ]
  node.strokeWeight = weight
  node.effects = []
}

/**
 * Applies an element's CSS to a layer, reading it as the DOM projection writes it: sizes left
 * unset hug or fill, `position: absolute` is a free position in a frame without auto layout,
 * and a fill child's zero minimum is the projection's, not the layer's.
 */
export function applyLayerStyle(
  graph: SceneGraph,
  node: SceneNode,
  element: DesignElement,
  style: DesignStyleDeclaration,
  { parent, resolveImage }: LayerStyleOptions
): void {
  const positioning = node.layoutPositioning
  if (node.type === 'TEXT') {
    applyTextStyle(node, style)
    applyTextSizing(node, style, parent)
  } else {
    applyElementStyle(graph, node, element, style, resolveImage)
    applyAxisSizing(node, style, parent)
    // A shader layer's settings ride on its element; its gradient is only the stand-in.
    const shader = element.attrs['data-kalka-shader']
    if (shader) node.shader = parseShaderLayer(shader)
  }
  applyHTMLElement(node, element)
  if (node.type === 'LINE') applyLineStroke(node)
  if (!laysOutChildren(parent)) {
    node.layoutPositioning = positioning
    return
  }
  if (node.layoutGrow > 0 && parent.layoutMode !== 'GRID') {
    const row = parent.layoutMode === 'HORIZONTAL'
    if (style[row ? 'min-width' : 'min-height'] === '0px') {
      if (row) node.minWidth = null
      else node.minHeight = null
    }
  }
}

/** A text element's characters and runs, the layer's own style left to its CSS. */
export function applyLayerText(node: SceneNode, element: DesignElement): void {
  const { text, styleRuns } = textContentFromChildren(element.children)
  node.text = text
  node.styleRuns = styleRuns
}
