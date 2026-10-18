import { isEmptyObject } from 'es-toolkit/predicate'
import { fromUint8Array } from 'js-base64'

import { readIcon, type SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { writeLayerStyle, type FieldCSS, type WriteContext } from '@kalka/scene-graph/css-model'

import { DesignTokens, type CSSModes } from '../tokens/references'
import type { DesignDocument, DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { maskStyle } from './masks'
import { croppedImageStyle, patternBackground, tiledImageStyle } from './patterns'
import { flowMargins, withoutOverflowingPadding, withUnhuggableAxisFixed } from './sizing'
import {
  imageSourceURL,
  INTERACTIVE_TAGS,
  nestedTag,
  VECTOR_SHAPES,
  withBlockDisplay
} from './tags'
import { textRunChildren } from './text-runs'

/**
 * Draws a vector-shaped layer as an inline `<svg>` element sized to the layer, from the
 * engine's own SVG export. dom-css cannot depend on that engine, so it comes in as an option.
 */
export type VectorElementRenderer = (graph: SceneGraph, node: SceneNode) => DesignElement | null

export interface SceneGraphToDesignOptions {
  rootId?: string
  includeSourceIds?: boolean
  /**
   * Write variable-bound values as `var(--name)` where CSS resolves them as drawn. Default true;
   * a caller projecting often can pass the references it keeps instead of building new ones.
   */
  tokens?: boolean | DesignTokens
  /** Vector, boolean, star, polygon, and icon layers as inline SVG; without it they project as boxes. */
  vectorElement?: VectorElementRenderer
  /** Hidden layers to project as shown, such as the tab panels a component reveals itself. */
  shown?: ReadonlySet<string>
  /**
   * Project the root without its child layers, so a renderer patching the DOM layer by layer
   * can restyle one element. Text keeps its characters; vector layers keep their SVG.
   */
  shallow?: boolean
  /**
   * Size auto layout frames that hug from the sizes their file saved, where it saved them, as the
   * author's tool computed them. For a canvas showing a file as its author laid it out; exports
   * leave hugging frames to their content.
   */
  derivedSizes?: boolean
  /**
   * Project internal-only layers, such as shared style definitions, which exports leave out. A
   * format that saves the whole document keeps them.
   */
  internal?: boolean
  /**
   * Draw masks as CSS: a mask hidden in its place, and the layers above it through `mask-image`.
   * Default true; a format that saves which layers are masks leaves the CSS they derive out.
   */
  masks?: boolean
  /**
   * Draw pattern fills and tiled images as repeating CSS backgrounds. Default true; a format that
   * saves the fills themselves leaves the CSS they derive out.
   */
  tiles?: boolean
}

/** Shapes without children whose stroke the SVG export draws when CSS cannot. */
const STROKED_SHAPES = new Set<SceneNode['type']>(['RECTANGLE', 'ELLIPSE', 'LINE'])

/**
 * Whether a shape's stroke is one CSS cannot draw: an outline or a shadow paints a single color,
 * so a gradient or image stroke would draw in its fallback color, and a line's box cannot end in
 * round caps or arrowheads. Such a shape draws as SVG, unless it asks for an HTML tag of its own.
 */
function strokeNeedsVector(node: SceneNode): boolean {
  if (!STROKED_SHAPES.has(node.type) || node.htmlTag || node.childIds.length > 0) return false
  const stroke = node.strokes.find((paint) => paint.visible)
  if (!stroke) return false
  if (stroke.type !== 'SOLID') return true
  const cap = stroke.cap ?? node.strokeCap
  return node.type === 'LINE' && cap !== 'NONE' && cap !== 'SQUARE'
}

/** What a box draws itself, which the SVG of a vector layer draws instead. */
const BOX_PAINT = /^(background|border|box-shadow|outline|filter)/

/** A layer's CSS: what the table writes from its fields, then what its CSS says otherwise. */
function layerCSS(node: SceneNode, context: WriteContext): DesignStyleDeclaration {
  return { ...writeLayerStyle(node, context), ...node.style }
}

function nodeChildren(graph: SceneGraph, node: SceneNode): SceneNode[] {
  return node.childIds
    .map((id) => graph.getNode(id))
    .filter((child): child is SceneNode => child !== undefined)
}

function attrsForNode(
  graph: SceneGraph,
  node: SceneNode,
  includeSourceIds: boolean
): Record<string, string> {
  const attrs: Record<string, string> = includeSourceIds ? { 'data-kalka-node-id': node.id } : {}
  const sourceURL = imageSourceURL(node)
  if (sourceURL) attrs.src = sourceURL
  if (node.htmlClasses.length > 0) attrs.class = node.htmlClasses.join(' ')
  if (node.shader) {
    // Paper Shaders mounts on elements marked so; the layer's settings travel with the export.
    attrs['data-paper-shader'] = ''
    attrs['data-kalka-shader'] = JSON.stringify(node.shader)
  }
  const fill = node.fills.at(0)
  if (fill?.type !== 'IMAGE' || !fill.imageHash) return attrs
  const bytes = graph.images.get(fill.imageHash)
  if (!bytes) return attrs
  return { ...attrs, src: `data:image/png;base64,${fromUint8Array(bytes)}` }
}

/**
 * The CSS of a layer on its own, without a parent or variables: what a class template writes,
 * so its declarations compare with those of the layers projected with the class.
 */
export function standaloneLayerStyle(node: SceneNode): DesignStyleDeclaration {
  const literal: FieldCSS = (_field, value) => value
  return layerCSS(node, { parent: undefined, css: literal })
}

interface ProjectionContext {
  graph: SceneGraph
  includeSourceIds: boolean
  tokens: DesignTokens | undefined
  vectorElement: VectorElementRenderer | undefined
  shown: ReadonlySet<string> | undefined
  shallow: boolean
  derivedSizes: boolean
  internal: boolean
  masks: boolean
  tiles: boolean
  /** Inside an `a` or `button`, which HTML does not let another one sit in. */
  interactive: boolean
}

/**
 * A hugging auto layout frame as fixed at the size its file saved, on each axis it saved one,
 * so the browser lays out its content inside the box the author's tool computed.
 */
function withDerivedSize(node: SceneNode): SceneNode {
  const derived = node.derivedLayout
  if (!derived || (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL')) return node
  const row = node.layoutMode === 'HORIZONTAL'
  const sized: Partial<SceneNode> = {}
  const main = row ? derived.width : derived.height
  const cross = row ? derived.height : derived.width
  if (node.primaryAxisSizing === 'HUG' && main !== undefined) {
    sized.primaryAxisSizing = 'FIXED'
    sized[row ? 'width' : 'height'] = main
  }
  if (node.counterAxisSizing === 'HUG' && cross !== undefined) {
    sized.counterAxisSizing = 'FIXED'
    sized[row ? 'height' : 'width'] = cross
  }
  return Object.keys(sized).length > 0 ? { ...node, ...sized } : node
}

/**
 * A vector layer as the renderer's `<svg>`, placed where the layer's box would be: its
 * position, size, opacity, and transform stay, and its paint is the SVG's, not the box's.
 */
function vectorDesignNode(
  context: ProjectionContext,
  node: SceneNode,
  attrs: Record<string, string>,
  style: DesignStyleDeclaration
): DesignElement | null {
  const drawn = context.vectorElement?.(context.graph, node)
  if (!drawn) return null
  const placement = Object.fromEntries(
    Object.entries(style).filter(([property]) => !BOX_PAINT.test(property))
  )
  return {
    ...drawn,
    attrs: { ...drawn.attrs, ...attrs },
    inlineStyle: { ...drawn.inlineStyle, ...placement },
    sourceSceneNodeId: node.id,
    sourceSceneNode: node
  }
}

/** A text layer as a span of its runs, or, set on a path, as the SVG of its saved glyphs. */
/** A frame's CSS, positioned so its absolutely placed children and siblings stack in order. */
function frameStyle(
  context: ProjectionContext,
  node: SceneNode,
  parent: SceneNode | undefined,
  css: FieldCSS,
  tagName: string
): DesignStyleDeclaration {
  const style = withBlockDisplay(
    tagName,
    layerCSS(
      withoutOverflowingPadding(
        withUnhuggableAxisFixed(context.graph, context.derivedSizes ? withDerivedSize(node) : node)
      ),
      { parent, css }
    )
  )
  if (context.tiles) {
    // A pattern's tile draws another layer, which only the SVG export can.
    Object.assign(style, patternBackground(context.graph, node, context.vectorElement))
    Object.assign(style, tiledImageStyle(context.graph, node))
    Object.assign(style, croppedImageStyle(context.graph, node))
  }
  // An auto layout frame is where its absolutely placed children are measured from.
  if (!style.position && hasAbsoluteChild(context.graph, node)) style.position = 'relative'
  stackInLayerOrder(context.graph, style, parent)
  return style
}

function hasAbsoluteChild(graph: SceneGraph, node: SceneNode): boolean {
  return nodeChildren(graph, node).some((child) => child.layoutPositioning === 'ABSOLUTE')
}

/**
 * Beside an absolutely placed sibling, an in-flow layer is positioned too: browsers paint
 * positioned elements over the others, and layers paint in their order.
 */
function stackInLayerOrder(
  graph: SceneGraph,
  style: DesignStyleDeclaration,
  parent: SceneNode | undefined
): void {
  if (!style.position && parent && hasAbsoluteChild(graph, parent)) style.position = 'relative'
}

function textDesignNode(
  context: ProjectionContext,
  node: SceneNode,
  attrs: Record<string, string>,
  parent: SceneNode | undefined,
  css: FieldCSS
): DesignNode {
  const style = layerCSS(node, { parent, css })
  stackInLayerOrder(context.graph, style, parent)
  // CSS cannot lay text along a curve; its saved glyph outlines draw it instead.
  if (node.textPathData !== null) {
    const curved = vectorDesignNode(context, node, attrs, style)
    if (curved) return curved
  }
  return {
    type: 'element',
    tagName: nestedTag(context.graph, node, context),
    attrs,
    inlineStyle: style,
    sourceSceneNodeId: node.id,
    sourceSceneNode: node,
    children: textRunChildren(node)
  }
}

function sceneNodeToDesignNode(
  context: ProjectionContext,
  node: SceneNode,
  inherited: CSSModes,
  root: boolean
): DesignNode | null {
  const projected = layerDesignNode(context, node, inherited, root)
  if (projected?.type !== 'element') return projected
  const margins = flowMargins(context.graph, node)
  const masked = context.masks ? maskStyle(context.graph, node, context.vectorElement) : {}
  if (isEmptyObject(masked) && isEmptyObject(margins)) return projected
  return { ...projected, inlineStyle: { ...projected.inlineStyle, ...margins, ...masked } }
}

function layerDesignNode(
  context: ProjectionContext,
  node: SceneNode,
  inherited: CSSModes,
  root: boolean
): DesignNode | null {
  if (!node.visible && !context.shown?.has(node.id)) return null
  if (node.internalOnly && !context.internal) return null
  const { graph, includeSourceIds, tokens } = context
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  const entered = tokens?.enter(node, inherited, root)
  const modes = entered?.modes ?? inherited
  const attrs = { ...attrsForNode(graph, node, includeSourceIds), ...entered?.attrs }
  const css: FieldCSS = (field, literal) => tokens?.reference(node, field, modes) ?? literal

  if (node.type === 'TEXT') return textDesignNode(context, node, attrs, parent, css)

  // An icon is one drawing, however many paths it has.
  if (VECTOR_SHAPES.has(node.type) || readIcon(node) || strokeNeedsVector(node)) {
    const vector = vectorDesignNode(context, node, attrs, layerCSS(node, { parent, css }))
    if (vector) return vector
  }

  const children =
    context.shallow && root
      ? []
      : nodeChildren(graph, node)
          .map((child) =>
            sceneNodeToDesignNode(
              INTERACTIVE_TAGS.has(nestedTag(context.graph, node, context))
                ? { ...context, interactive: true }
                : context,
              child,
              modes,
              false
            )
          )
          .filter((child): child is DesignNode => child !== null)

  if (node.type === 'CANVAS') {
    return {
      type: 'element',
      tagName: 'main',
      attrs,
      sourceSceneNodeId: node.id,
      sourceSceneNode: node,
      children
    }
  }

  const tagName = nestedTag(context.graph, node, context)
  const style = frameStyle(context, node, parent, css, tagName)
  return {
    type: 'element',
    tagName,
    attrs,
    inlineStyle: style,
    sourceSceneNodeId: node.id,
    sourceSceneNode: node,
    children
  }
}

function projectionTokens(
  graph: SceneGraph,
  tokens: boolean | DesignTokens
): DesignTokens | undefined {
  if (tokens instanceof DesignTokens) return tokens
  return tokens ? new DesignTokens(graph) : undefined
}

function projectionContext(
  graph: SceneGraph,
  {
    includeSourceIds = true,
    tokens = true,
    vectorElement,
    shown,
    shallow = false,
    derivedSizes = false,
    internal = false,
    masks = true,
    tiles = true
  }: SceneGraphToDesignOptions
): ProjectionContext {
  return {
    graph,
    includeSourceIds,
    tokens: projectionTokens(graph, tokens),
    vectorElement,
    shown,
    shallow,
    derivedSizes,
    internal,
    masks,
    tiles,
    interactive: false
  }
}

export function sceneGraphToDesignDocument(
  graph: SceneGraph,
  options: SceneGraphToDesignOptions = {}
): DesignDocument {
  const root = graph.getNode(options.rootId ?? graph.rootId)
  const context = projectionContext(graph, options)
  const modes = context.tokens?.defaultModes() ?? new Map<string, string>()
  const children = root
    ? nodeChildren(graph, root)
        .map((child) => sceneNodeToDesignNode(context, child, modes, true))
        .filter((child): child is DesignNode => child !== null)
    : []

  return { type: 'document', sourceGraph: graph, tokens: context.tokens, children }
}

/** Project one node, including its own box, instead of the children of a root. */
export function sceneNodeToDesignDocument(
  graph: SceneGraph,
  nodeId: string,
  options: Omit<SceneGraphToDesignOptions, 'rootId'> = {}
): DesignDocument {
  const node = graph.getNode(nodeId)
  const context = projectionContext(graph, options)
  const modes = context.tokens?.defaultModes() ?? new Map<string, string>()
  const projected = node ? sceneNodeToDesignNode(context, node, modes, true) : null
  return {
    type: 'document',
    sourceGraph: graph,
    tokens: context.tokens,
    children: projected ? [projected] : []
  }
}

export type { SceneGraphToDesignOptions as ToDesignDocumentOptions }
