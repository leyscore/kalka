import { SceneGraph, type SceneNode, parseShaderLayer } from '@kalka/scene-graph'
import {
  clipsBackgroundToText,
  colorToFillFromCSS,
  firstCSSNumber,
  mergedStyle,
  writeLayerStyle,
  pickStyle
} from '@kalka/scene-graph/css-model'

import { shaderSettings } from '../export/tidy/attributes'
import type {
  DesignDocument,
  DesignElement,
  DesignNode,
  DesignStyleDeclaration,
  LayoutBox
} from '../types'
import { hasBoxStyle, isTextLikeElement, textContent } from './element-kinds'
import { applyHTMLElement } from './html-element'
import { readElementStyle, svgImageFill } from './image'
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
  /**
   * Keep, as each layer's `style`, the inline CSS its author wrote that the layer's fields do not
   * give back as written, such as `width: 50%`, `padding: 1rem` or `transition`. On by default.
   */
  keepAuthoredCSS?: boolean
  /**
   * Build the measured page's artboard into this graph's page instead of a new graph, at `x`, `y`
   * there, `height` tall when given rather than as tall as its content.
   */
  into?: ArtboardTarget
}

/** Where an imported page's artboard goes in a graph that already exists. */
export interface ArtboardTarget {
  graph: SceneGraph
  pageId: string
  x?: number
  y?: number
  height?: number
}

export type { ImageSourceResolver } from './image'

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
  readElementStyle(graph, draft, declarations)
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
  readElementStyle(graph, node, style)
  return node
}

/**
 * Text that auto layout places keeps the size it was measured at: one line takes the width of its
 * words, and several keep the width they wrapped at, rounded up so the widest line still fits.
 */
function sizeFlowText(node: SceneNode, box: LayoutBox): void {
  const lineHeight = node.lineHeight ?? node.fontSize * 1.3
  node.height = box.height
  if (box.height < lineHeight * 1.5) {
    node.width = Math.ceil(box.width) + 1
    node.textAutoResize = 'WIDTH_AND_HEIGHT'
    return
  }
  node.width = Math.ceil(box.width) + 1
  node.textAutoResize = 'HEIGHT'
}

/** The box an element's words take, from their measured lines; none when they were not measured. */
function textBounds(element: DesignElement): LayoutBox | undefined {
  const boxes: LayoutBox[] = []
  const visit = (nodes: readonly DesignNode[]) => {
    for (const node of nodes) {
      if (node.type === 'text') {
        if (node.layoutBox && node.text.trim()) boxes.push(node.layoutBox)
      } else visit(node.children)
    }
  }
  visit(element.children)
  if (boxes.length === 0) return undefined
  const top = Math.min(...boxes.map((box) => box.y))
  const left = Math.min(...boxes.map((box) => box.x))
  return {
    x: left,
    y: top,
    width: Math.max(...boxes.map((box) => box.x + box.width)) - left,
    height: Math.max(...boxes.map((box) => box.y + box.height)) - top
  }
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
    node.style = { ...element.inlineStyle }
    node.styleRuns = styleRuns
    node.textAutoResize = 'HEIGHT'
    applyHTMLElement(node, element)
    if (placement?.byMeasure && box) placeAtMeasure(node, box, placement)
    else if (box) sizeFlowText(node, box)
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
    // Where the browser drew the words: a button taller than its line centers them.
    const drawn = textBounds(element)
    // One line (a badge, a button) keeps the width of its words, so slightly wider font metrics
    // cannot wrap its last word; a paragraph wraps where the browser wrapped it.
    const oneLine = (drawn?.height ?? box.height - top - bottom) < lineHeight * 1.5
    const width = Math.max(1, box.width - left - right)
    label.width = oneLine ? width : Math.ceil(width) + 1
    label.textAutoResize = oneLine || frame.layoutMode !== 'NONE' ? 'WIDTH_AND_HEIGHT' : 'HEIGHT'
    label.x = left
    label.y = drawn && frame.layoutMode === 'NONE' ? drawn.y - box.y : top
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
  const shaderJSON = shaderSettings(element.attrs)
  const node = graph.createNode('FRAME', parentId, {
    name: element.attrs.id || element.attrs.class || element.tagName,
    clipsContent: false,
    // An exported shader layer comes back as one; its gradient was only the stand-in.
    shader: shaderJSON ? parseShaderLayer(shaderJSON) : null
  })
  readElementStyle(graph, node, style, { element })
  node.style = { ...element.inlineStyle }
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
  if (element.drawnSVG) {
    // An inline SVG keeps its drawing as an image; its shapes are not boxes of their own.
    const svg = createFrameNode(graph, parentId, element, style, placement)
    svg.name = element.attrs['aria-label'] || 'svg'
    svg.fills = [svgImageFill(graph, element.drawnSVG)]
    return svg
  }
  // A measured paragraph, link or heading with inline markup is one text layer.
  if (element.layoutBox && isPhrasingBlock(element))
    return createPhrasingNode(graph, parentId, element, style, placement)
  if (
    isTextLikeElement(element) &&
    !hasBoxStyle(style) &&
    element.children.every((child) => child.type === 'text')
  ) {
    const text = createTextNode(graph, parentId, textContent(element), style)
    text.style = { ...element.inlineStyle }
    applyHTMLElement(text, element)
    if (placement?.byMeasure && element.layoutBox)
      placeAtMeasure(text, element.layoutBox, placement)
    else if (element.layoutBox) sizeFlowText(text, element.layoutBox)
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

  const layer = createElementNode(graph, parentId, node, placement)
  if (isVisuallyHidden(node)) layer.visible = false
  return layer
}

/**
 * Text for screen readers only: a box of a pixel or less with its content clipped away. It
 * stays in the design, hidden, as the page keeps it.
 */
function isVisuallyHidden(element: DesignElement): boolean {
  const box = element.layoutBox
  if (!box || box.width > 1 || box.height > 1) return false
  const style = mergedStyle(element)
  const clip = pickStyle(style, 'clip')?.replace(/\s+/g, '')
  const clipPath = pickStyle(style, 'clip-path')?.replace(/\s+/g, '')
  return (
    clip === 'rect(0000)' ||
    clip === 'rect(0,0,0,0)' ||
    clip === 'rect(0px,0px,0px,0px)' ||
    clipPath === 'inset(50%)' ||
    pickStyle(style, 'overflow') === 'hidden'
  )
}

const sameValue = (a: string, b: string | undefined) =>
  a.trim().toLowerCase() === b?.trim().toLowerCase()

/** What places a layer; where its parent places it by its coordinates, those are its place. */
const PLACEMENT_PROPERTIES = new Set(['position', 'left', 'top', 'right', 'bottom', 'inset'])

/**
 * Of the CSS an import noted as the layer's author wrote it, what the layer's fields do not
 * give back as written: the rest the fields hold already.
 */
function authoredOverrides(graph: SceneGraph, node: SceneNode): DesignStyleDeclaration {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  const written = writeLayerStyle(node, { parent, css: (_field, literal) => literal })
  const kept: DesignStyleDeclaration = {}
  // An authored `position: relative` kept over the placement would offset the layer from where
  // the page put it by its own coordinates, again on every layout.
  const placed = written.position === 'absolute'
  // The `background` shorthand resets the clip the fields write for text filled by its background.
  const clippedToText = clipsBackgroundToText(written)
  for (const [property, value] of Object.entries(node.style)) {
    if (placed && PLACEMENT_PROPERTIES.has(property)) continue
    if (clippedToText && property === 'background') continue
    if (!sameValue(value, written[property])) kept[property] = value
  }
  return kept
}

function fitPageToChildren(page: SceneNode, graph: SceneGraph): void {
  const children = graph.getChildren(page.id)
  if (children.length === 0) return
  page.width = Math.max(...children.map((child) => child.x + child.width))
  page.height = Math.max(...children.map((child) => child.y + child.height))
}

/** The page an import builds on: the target's, or the first page of a new graph. */
function importPage(graph: SceneGraph, options: DesignDocumentToSceneGraphOptions): SceneNode {
  const into = options.into
  if (into) {
    const page = graph.getNode(into.pageId)
    if (!page) throw new Error(`Page "${into.pageId}" not found`)
    return page
  }
  const page = graph.getPages().find((node) => node.type === 'CANVAS') ?? graph.addPage('DesignDOM')
  page.name = options.pageName ?? 'DesignDOM'
  return page
}

function createDesignNodes(
  graph: SceneGraph,
  page: SceneNode,
  document: DesignDocument,
  options: DesignDocumentToSceneGraphOptions
): void {
  const viewport = document.viewport
  if (!viewport) {
    for (const child of document.children) createDesignNode(graph, page.id, child)
    return
  }
  const into = options.into
  // A measured page becomes one artboard of the width it was rendered at.
  const artboard = graph.createNode('FRAME', page.id, {
    name: options.artboardName ?? 'Desktop',
    x: into?.x ?? 0,
    y: into?.y ?? 0,
    width: viewport.width,
    height: into?.height ?? Math.ceil(viewport.height),
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
}

export function designDocumentToSceneGraph(
  document: DesignDocument,
  options: DesignDocumentToSceneGraphOptions = {}
): SceneGraph {
  const graph = options.into?.graph ?? new SceneGraph()
  const page = importPage(graph, options)

  const created = new Set<string>()
  const stopTracking = graph.onNodeEvents({ created: (node) => created.add(node.id) })
  try {
    createDesignNodes(graph, page, document, options)
  } finally {
    stopTracking()
  }

  if (!options.into) fitPageToChildren(page, graph)
  for (const id of created) {
    const node = graph.getNode(id)
    if (node) node.style = options.keepAuthoredCSS === false ? {} : authoredOverrides(graph, node)
  }
  return graph
}

export type { DesignDocumentToSceneGraphOptions as ToSceneGraphOptions }
