import { SceneGraph, type SceneNode, parseShaderLayer } from '@kalka/scene-graph'

import { readLayerStyle } from '../model'
import { firstCSSNumber } from '../model/types'
import type { DesignDocument, DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { colorToFillFromCSS, mergedStyle, pickStyle } from './css-values'
import { hasBoxStyle, isTextLikeElement, textContent } from './element-kinds'
import { applyHTMLElement } from './html-element'
import {
  inheritedTextStyle,
  isNotRendered,
  keepsAutoLayout,
  paintOrder,
  placeAtMeasure,
  rotationFromTransform,
  placementOf,
  type Placement
} from './measured'
import { isPhrasingBlock, paintsBox, phrasingContent } from './phrasing'

export interface DesignDocumentToSceneGraphOptions {
  pageName?: string
  /** The artboard a measured page becomes; `Desktop` when left out. */
  artboardName?: string
}

export type { ImageSourceResolver } from '../model'

/**
 * What CSS declarations change on a layer: the fields they set, and only those that differ, so
 * a partial update such as `{ "padding": "24px" }` leaves the rest of the layer as it was.
 */
export function cssToNodeChanges(
  graph: SceneGraph,
  node: SceneNode,
  declarations: DesignStyleDeclaration
): Partial<SceneNode> {
  const draft = structuredClone(node)
  readLayerStyle(draft, declarations, { graph })
  // The text mapping reads a missing font-style as upright; here it means "leave it".
  if (!('font-style' in declarations)) draft.italic = node.italic
  const changes: Partial<SceneNode> = {}
  for (const key of Object.keys(draft) as (keyof SceneNode)[]) {
    if (JSON.stringify(draft[key]) !== JSON.stringify(node[key]))
      Object.assign(changes, { [key]: draft[key] })
  }
  return changes
}

function createTextNode(
  graph: SceneGraph,
  parentId: string,
  text: string,
  style: DesignStyleDeclaration
) {
  const node = graph.createNode('TEXT', parentId, {
    name: text.slice(0, 32) || 'Text',
    text,
    width: Math.max(text.length * 8, 1),
    height: 20
  })
  readLayerStyle(node, style, { graph })
  return node
}

/** A block of text and inline elements as one text layer, inside its box when it paints one. */
function createPhrasingNode(
  graph: SceneGraph,
  parentId: string,
  element: DesignElement,
  style: DesignStyleDeclaration,
  placement?: Placement
): SceneNode {
  const { text, styleRuns } = phrasingContent(element)
  const box = element.layoutBox
  if (!paintsBox(style)) {
    const node = createTextNode(graph, parentId, text, style)
    node.styleRuns = styleRuns
    node.textAutoResize = 'HEIGHT'
    applyHTMLElement(node, element)
    if (placement?.byMeasure && box) placeAtMeasure(node, box, placement)
    return node
  }
  const frame = createFrameNode(graph, parentId, element, style, placement)
  const label = createTextNode(graph, frame.id, text, inheritedTextStyle(style))
  label.styleRuns = styleRuns
  if (box) {
    const left = firstCSSNumber(style, 'padding-left') ?? 0
    const right = firstCSSNumber(style, 'padding-right') ?? 0
    const top = firstCSSNumber(style, 'padding-top') ?? 0
    const bottom = firstCSSNumber(style, 'padding-bottom') ?? 0
    const lineHeight = label.lineHeight ?? label.fontSize * 1.3
    // One line (a badge, a button) keeps the width of its words, so slightly wider font metrics
    // cannot wrap its last word; a paragraph wraps where the browser wrapped it, with a little room.
    const oneLine = box.height - top - bottom < lineHeight * 1.5
    const width = Math.max(1, box.width - left - right)
    label.width = oneLine ? width : Math.ceil(width * 1.01) + 1
    label.textAutoResize = oneLine || frame.layoutMode !== 'NONE' ? 'WIDTH_AND_HEIGHT' : 'HEIGHT'
    label.x = left
    label.y = top
  }
  return frame
}

function createFrameNode(
  graph: SceneGraph,
  parentId: string,
  element: DesignElement,
  style: DesignStyleDeclaration,
  placement?: Placement
): SceneNode {
  const shaderJSON = element.attrs['data-kalka-shader']
  const node = graph.createNode('FRAME', parentId, {
    name: element.attrs.id || element.attrs.class || element.tagName,
    clipsContent: false,
    // An exported shader layer comes back as one; its gradient was only the stand-in.
    shader: shaderJSON ? parseShaderLayer(shaderJSON) : null
  })
  readLayerStyle(node, style, { graph, element })
  applyHTMLElement(node, element)
  if (pickStyle(style, 'visibility') === 'hidden') node.visible = false
  if (node.shader) {
    // The gradient written for the shader stands in for it; the shader is the layer's paint.
    graph.updateNode(node.id, {
      fills: node.fills.filter((fill) => !fill.type.startsWith('GRADIENT'))
    })
  }
  if (!keepsAutoLayout(node, element)) node.layoutMode = 'NONE'
  if (element.layoutBox) {
    // The computed width and height leave padding and borders out under content-box sizing,
    // the browser default; the measured box is the size the layer draws at.
    node.width = Math.max(element.layoutBox.width, 0.01)
    node.height = Math.max(element.layoutBox.height, 0.01)
  }
  if (placement?.byMeasure && element.layoutBox) placeAtMeasure(node, element.layoutBox, placement)
  const rotation = element.layoutBox
    ? rotationFromTransform(pickStyle(style, 'transform'), pickStyle(style, 'rotate'))
    : null
  if (rotation !== null) node.rotation = rotation
  return node
}

function createElementNode(
  graph: SceneGraph,
  parentId: string,
  element: DesignElement,
  placement?: Placement
): SceneNode {
  const style = mergedStyle(element)
  // A measured paragraph, link or heading with inline markup is one text layer.
  if (element.layoutBox && isPhrasingBlock(element))
    return createPhrasingNode(graph, parentId, element, style, placement)
  if (
    isTextLikeElement(element) &&
    !hasBoxStyle(style) &&
    element.children.every((child) => child.type === 'text')
  ) {
    const text = createTextNode(graph, parentId, textContent(element), style)
    applyHTMLElement(text, element)
    if (placement?.byMeasure && element.layoutBox)
      placeAtMeasure(text, element.layoutBox, placement)
    return text
  }

  const node = createFrameNode(graph, parentId, element, style, placement)
  for (const child of paintOrder(element.children)) {
    createDesignNode(graph, node.id, child, style, placementOf(node, element.layoutBox, child))
  }
  return node
}

function createDesignNode(
  graph: SceneGraph,
  parentId: string,
  node: DesignNode,
  inheritedStyle: DesignStyleDeclaration = {},
  placement?: Placement
): SceneNode | null {
  if (isNotRendered(node)) return null
  if (node.type === 'text') {
    if (node.text.trim().length === 0) return null
    // Loose text takes the type of the element around it, not that element's box.
    const text = createTextNode(
      graph,
      parentId,
      node.text.trim(),
      inheritedTextStyle(inheritedStyle)
    )
    if (node.layoutBox) {
      // Its measured size, not a guess from its length, also where auto layout places it.
      text.textAutoResize = 'WIDTH_AND_HEIGHT'
      text.width = Math.ceil(node.layoutBox.width) + 1
      text.height = node.layoutBox.height
    }
    if (placement?.byMeasure && node.layoutBox) placeAtMeasure(text, node.layoutBox, placement)
    return text
  }

  return createElementNode(graph, parentId, node, placement)
}

function fitPageToChildren(page: SceneNode, graph: SceneGraph): void {
  const children = graph.getChildren(page.id)
  if (children.length === 0) return
  page.width = Math.max(...children.map((child) => child.x + child.width))
  page.height = Math.max(...children.map((child) => child.y + child.height))
}

export function designDocumentToSceneGraph(
  document: DesignDocument,
  options: DesignDocumentToSceneGraphOptions = {}
): SceneGraph {
  const graph = new SceneGraph()
  const page = graph.getPages().find((node) => node.type === 'CANVAS') ?? graph.addPage('DesignDOM')

  page.name = options.pageName ?? 'DesignDOM'

  const viewport = document.viewport
  if (viewport) {
    // A measured page becomes one artboard of the width it was rendered at.
    const artboard = graph.createNode('FRAME', page.id, {
      name: options.artboardName ?? 'Desktop',
      width: viewport.width,
      height: Math.ceil(viewport.height),
      clipsContent: true
    })
    const background = colorToFillFromCSS(pickStyle(viewport.bodyStyle, 'background-color'))
    artboard.fills = background.length > 0 ? background : colorToFillFromCSS('#ffffff')
    const placement: Placement = {
      parentBox: { x: 0, y: 0, width: viewport.width, height: viewport.height },
      byMeasure: true
    }
    for (const child of document.children)
      createDesignNode(graph, artboard.id, child, viewport.bodyStyle, placement)
  } else {
    for (const child of document.children) createDesignNode(graph, page.id, child)
  }

  fitPageToChildren(page, graph)
  return graph
}

export type { DesignDocumentToSceneGraphOptions as ToSceneGraphOptions }
