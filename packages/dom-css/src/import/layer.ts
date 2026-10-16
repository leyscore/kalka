import { parseShaderLayer, type SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { paintColor } from '@kalka/scene-graph/css-model'

import type { DesignElement, DesignStyleDeclaration } from '../types'
import { applyHTMLElement } from './html-element'
import { readElementStyle, type ImageSourceResolver } from './image'
import { textContentFromChildren } from './text-runs'

export interface LayerStyleOptions {
  /** The layer's parent, already read, whose layout decides what the child's CSS means. */
  parent: SceneNode | undefined
  /** The image an `<img src>` names, for sources that are files rather than data URLs. */
  resolveImage?: ImageSourceResolver
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
  readElementStyle(graph, node, style, { element, resolveImage, projected: { parent } })
  // A shader layer's settings ride on its element; its gradient is only the stand-in.
  const shader = element.attrs['data-kalka-shader']
  if (shader && node.type !== 'TEXT') node.shader = parseShaderLayer(shader)
  applyHTMLElement(node, element)
  if (node.type === 'LINE') applyLineStroke(node)
}

/** A text element's characters and runs, the layer's own style left to its CSS. */
export function applyLayerText(node: SceneNode, element: DesignElement): void {
  const { text, styleRuns } = textContentFromChildren(element.children)
  node.text = text
  node.styleRuns = styleRuns
}
