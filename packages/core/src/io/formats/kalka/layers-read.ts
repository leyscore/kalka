import { omit } from 'es-toolkit/object'
import { parse, type DefaultTreeAdapterTypes } from 'parse5'

import {
  applyLayerStyle,
  applyLayerText,
  parseStyleDeclarations,
  type ClassRule,
  type DesignStyleDeclaration,
  type DesignElement,
  type DesignNode,
  type ImageSourceResolver
} from '@kalka/dom-css/import'
import {
  createDefaultNode,
  type NodeType,
  type SceneGraph,
  type SceneNode,
  type Vector
} from '@kalka/scene-graph'

import { ATTR, LAYER_TYPES, type LayerType } from './constants'
import type { Residual } from './residual'

type ParsedNode = DefaultTreeAdapterTypes.ChildNode
type ParsedElement = DefaultTreeAdapterTypes.Element
type ParsedParent = DefaultTreeAdapterTypes.ParentNode
type ParsedTemplate = DefaultTreeAdapterTypes.Template

export interface ReadLayersOptions {
  /**
   * The fields to set after the CSS: the props a page saved when opening it, or, when saving,
   * what the CSS failed to give back, which the writer then saves.
   */
  residual: (node: SceneNode, attrs: Readonly<Record<string, string>>) => Residual | null
  /** Where each artboard sits on the canvas, from `project.json`. */
  artboards: ReadonlyMap<string, Vector>
  resolveImage: ImageSourceResolver
  /** The class rules of `styles.css`, which apply before each element's own style. */
  classRules?: readonly ClassRule[]
}

/** The value a page's style writes to undo a class declaration the layer does not have. */
const UNSET = 'initial'

/**
 * An element's style as the cascade gives it: its classes' rules in stylesheet order, then its
 * own declarations, with the ones it undoes left out.
 */
function cascadedStyle(
  rules: readonly ClassRule[],
  classAttribute: string | undefined,
  own: DesignStyleDeclaration
): DesignStyleDeclaration {
  const names = new Set(classAttribute?.split(/\s+/))
  const style: DesignStyleDeclaration = {}
  for (const rule of rules) if (names.has(rule.name)) Object.assign(style, rule.declarations)
  Object.assign(style, own)
  return Object.fromEntries(Object.entries(style).filter(([, value]) => value !== UNSET))
}

/** Elements that are document plumbing, never layers. */
const NOT_LAYERS = new Set(['script', 'style', 'link', 'meta', 'title', 'head', 'noscript', 'br'])

/** Elements whose only content is text, which become text layers when written by hand. */
const TEXT_TAGS = new Set([
  'span',
  'p',
  'label',
  'strong',
  'em',
  'b',
  'i',
  'a',
  'button',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6'
])
const INLINE_TAGS = new Set(['span', 'strong', 'em', 'b', 'i', 'a', 'br', 'code', 'small'])

function isElement(node: ParsedNode): node is ParsedElement {
  return 'tagName' in node
}

function attrsOf(element: ParsedElement): Record<string, string> {
  return Object.fromEntries(element.attrs.map((attr) => [attr.name, attr.value]))
}

function isTemplate(element: ParsedElement): element is ParsedTemplate {
  return element.tagName === 'template' && 'content' in element
}

function childNodesOf(element: ParsedElement): ParsedNode[] {
  // A template's children live in its content fragment, where browsers keep them inert.
  return isTemplate(element) ? element.content.childNodes : element.childNodes
}

/** A parsed element as dom-css reads elements, run styles parsed, whitespace kept. */
function designNode(node: ParsedNode): DesignNode | null {
  if (node.nodeName === '#text' && 'value' in node) return { type: 'text', text: node.value }
  if (!isElement(node)) return null
  const attrs = attrsOf(node)
  return {
    type: 'element',
    tagName: node.tagName,
    attrs,
    inlineStyle: parseStyleDeclarations(attrs.style),
    children: node.childNodes.flatMap((child) => designNode(child) ?? [])
  }
}

function layerTypeFromAttribute(value: string): LayerType | null {
  const type = value.toUpperCase().replaceAll('-', '_')
  return LAYER_TYPES.find((candidate) => candidate === type) ?? null
}

/** The type a layer element has without a `data-kalka-type`, as the writer leaves it out. */
export function impliedLayerType(tagName: string): LayerType {
  if (tagName === 'span') return 'TEXT'
  if (tagName === 'svg') return 'VECTOR'
  if (tagName === 'section') return 'SECTION'
  return 'FRAME'
}

/** What a hand-written element becomes: text when it holds only text, otherwise a frame. */
function handWrittenType(element: ParsedElement): LayerType | null {
  // An SVG drawn by hand has no geometry Kalka reads yet.
  if (element.tagName === 'svg') return null
  const onlyText = element.childNodes.every(
    (child) => !isElement(child) || INLINE_TAGS.has(child.tagName)
  )
  return TEXT_TAGS.has(element.tagName) && onlyText ? 'TEXT' : 'FRAME'
}

function layerType(element: ParsedElement, attrs: Record<string, string>): LayerType | null {
  if (ATTR.type in attrs) return layerTypeFromAttribute(attrs[ATTR.type])
  if (ATTR.id in attrs) return impliedLayerType(element.tagName)
  return handWrittenType(element)
}

function defaultName(type: NodeType, element: DesignElement, node: SceneNode): string {
  if (type === 'TEXT') return node.text.slice(0, 32) || 'Text'
  return element.attrs.id || element.attrs.class || element.tagName
}

class LayerReader {
  constructor(
    private readonly graph: SceneGraph,
    private readonly options: ReadLayersOptions
  ) {}

  readChildren(nodes: readonly ParsedNode[], parent: SceneNode): void {
    for (const child of nodes) {
      if (!isElement(child)) continue
      if (child.tagName === 'template') {
        const ownerId = attrsOf(child)[ATTR.childrenOf]
        const owner = ownerId ? this.graph.getNode(ownerId) : undefined
        if (owner) this.readChildren(childNodesOf(child), owner)
        continue
      }
      this.readElement(child, parent)
    }
  }

  private readElement(element: ParsedElement, parent: SceneNode): void {
    if (NOT_LAYERS.has(element.tagName)) return
    const attrs = attrsOf(element)
    const type = layerType(element, attrs)
    if (!type) return
    const savedId = attrs[ATTR.id]
    // A copy-pasted element repeats its id; the copy becomes a layer of its own.
    const id = savedId && !this.graph.getNode(savedId) ? savedId : null
    const node = createDefaultNode(() => id ?? '', type)
    node.visible = !('hidden' in attrs)
    node.locked = ATTR.locked in attrs
    node.internalOnly = ATTR.internal in attrs

    const design = designNode(element)
    if (design?.type !== 'element') return
    const style = cascadedStyle(
      this.options.classRules ?? [],
      attrs.class,
      design.inlineStyle ?? {}
    )
    applyLayerStyle(this.graph, node, design, style, {
      parent,
      resolveImage: this.options.resolveImage
    })
    if (type === 'TEXT') applyLayerText(node, design)
    node.name = attrs[ATTR.name] ?? defaultName(type, design, node)

    const artboard = parent.type === 'CANVAS' && id ? this.options.artboards.get(id) : undefined
    if (artboard) {
      node.x = artboard.x
      node.y = artboard.y
    }
    const residual = this.options.residual(node, attrs)
    if (residual) Object.assign(node, residual)

    const fields = omit(node, ['id', 'childIds', 'parentId'])
    const created = id
      ? this.graph.createNodeWithId(id, type, parent.id, fields)
      : this.graph.createNode(type, parent.id, fields)
    // A text layer's elements are its runs; an SVG's are its drawing.
    if (type === 'TEXT' || element.tagName === 'svg') return
    this.readChildren(element.childNodes, created)
  }
}

/** The `<body>` of a page, whose elements are its artboards. */
function pageBody(html: string): ParsedParent {
  const parsed = parse(html)
  const htmlElement = parsed.childNodes.find(
    (node): node is ParsedElement => isElement(node) && node.tagName === 'html'
  )
  const body = htmlElement?.childNodes.find(
    (node): node is ParsedElement => isElement(node) && node.tagName === 'body'
  )
  if (!body) throw new Error('A page has no <body>')
  return body
}

/**
 * Reads a page's HTML into layers on `page`: each element a layer, its CSS read by dom-css, its
 * `data-kalka-*` attributes the editor data CSS has no place for. Elements written by hand, without
 * those attributes, become new layers.
 */
export function readPageLayers(
  graph: SceneGraph,
  page: SceneNode,
  html: string,
  options: ReadLayersOptions
): void {
  new LayerReader(graph, options).readChildren(pageBody(html).childNodes, page)
}
