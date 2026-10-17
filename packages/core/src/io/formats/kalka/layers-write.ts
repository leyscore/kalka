import { isValid, toUint8Array } from 'js-base64'

import {
  cssClassDeclarations,
  sceneNodeToDesignDocument,
  serializeHTML,
  withClassRules,
  type DesignElement,
  type DesignNode
} from '@kalka/dom-css/export'
import type { ClassRule } from '@kalka/dom-css/import'
import { documentCSSClasses, SceneGraph, type SceneNode, type Vector } from '@kalka/scene-graph'
import { computeImageHash } from '@kalka/scene-graph/images'

import { vectorElement } from '#core/io/formats/html/vectors'

import { imageFilePath, imageSourceResolver, imagesByContent, pageRelativePath } from './assets'
import { ATTR, STYLES_FILE, TOKENS_CSS_FILE } from './constants'
import { impliedLayerType, readPageLayers } from './layers-read'
import { layerResidual, type Residual } from './residual'
import { encodeValue } from './values'

/** What every page of one save shares. */
export interface PageWriteContext {
  /** Hidden layers, which the page keeps with a `hidden` attribute. */
  hidden: ReadonlySet<string>
  /** Saved image hashes by the hash of their bytes, to name images SVG drawings embed. */
  imagesByContent: ReadonlyMap<string, string>
  /** The class rules `styles.css` holds, which layers with those classes rely on. */
  classRules: readonly ClassRule[]
}

export function pageWriteContext(graph: SceneGraph): PageWriteContext {
  const hidden = new Set<string>()
  for (const node of graph.getAllNodes()) if (!node.visible) hidden.add(node.id)
  const classRules = documentCSSClasses(graph).map((cssClass) => ({
    name: cssClass.name,
    declarations: cssClassDeclarations(cssClass)
  }))
  return { hidden, imagesByContent: imagesByContent(graph.images), classRules }
}

function typeAttribute(type: SceneNode['type']): string {
  return type.toLowerCase().replaceAll('_', '-')
}

function styleText(style: DesignElement['inlineStyle']): string | undefined {
  const declarations = Object.entries(style ?? {})
    .filter(([, value]) => value !== '')
    .map(([property, value]) => `${property}: ${value}`)
  return declarations.length > 0 ? declarations.join('; ') : undefined
}

/** A `data:` image as the folder's file for it, when the document holds that image. */
function imageReference(
  graph: SceneGraph,
  context: PageWriteContext,
  value: string
): string | undefined {
  const marker = ';base64,'
  const at = value.indexOf(marker)
  if (!value.startsWith('data:image/') || at === -1) return undefined
  const base64 = value.slice(at + marker.length)
  if (!isValid(base64)) return undefined
  const hash = context.imagesByContent.get(computeImageHash(toUint8Array(base64)))
  const bytes = hash === undefined ? undefined : graph.images.get(hash)
  return hash !== undefined && bytes ? pageRelativePath(imageFilePath(hash, bytes)) : undefined
}

/** The attributes a layer's element carries: editor data first, then what draws it. */
function layerAttributes(node: SceneNode, element: DesignElement): Record<string, string> {
  const attrs: Record<string, string> = { [ATTR.id]: node.id }
  if (impliedLayerType(element.tagName) !== node.type) attrs[ATTR.type] = typeAttribute(node.type)
  attrs[ATTR.name] = node.name
  if (node.locked) attrs[ATTR.locked] = ''
  if (node.internalOnly) attrs[ATTR.internal] = ''
  if (!node.visible) attrs.hidden = ''
  for (const [name, value] of Object.entries(element.attrs))
    if (name !== 'data-kalka-node-id' && !(name in attrs)) attrs[name] = value
  const style = styleText(element.inlineStyle)
  if (style) attrs.style = style
  return attrs
}

class PageProjector {
  /** Each layer's element, to add its props once they are known. */
  readonly elements = new Map<string, DesignElement>()

  constructor(
    private readonly graph: SceneGraph,
    private readonly context: PageWriteContext
  ) {}

  /** A layer and its subtree, followed by a template of the children its SVG drawing hides. */
  project(nodeId: string): DesignNode[] {
    const projectedDocument = sceneNodeToDesignDocument(this.graph, nodeId, {
      includeSourceIds: false,
      vectorElement,
      shown: this.context.hidden,
      internal: true,
      // Props keep which layers are masks; CSS drawn from them would read back as the layers' own.
      masks: false,
      // Props keep the fills; a tile's CSS read back would stay on the layer as its own.
      tiles: false
    })
    // `styles.css` holds the class rules; a layer's style keeps what is its own.
    const projected = withClassRules(this.graph, projectedDocument).children
    return projected.flatMap((node) => this.decorate(node))
  }

  private decorate(node: DesignNode): DesignNode[] {
    if (node.type === 'text') return [node]
    const layer = node.sourceSceneNode
    const element: DesignElement = {
      ...node,
      attrs: { ...node.attrs },
      children: node.children.flatMap((child) => this.decorate(child))
    }
    for (const name of ['src', 'href', 'xlink:href']) {
      const value = element.attrs[name]
      const reference = value && imageReference(this.graph, this.context, value)
      if (reference) element.attrs[name] = reference
    }
    if (!layer) return [element]
    element.attrs = layerAttributes(layer, element)
    element.inlineStyle = undefined
    this.elements.set(layer.id, element)
    // An SVG drawing has no room for child layers: they follow it in an inert template.
    if (element.tagName !== 'svg' || layer.type === 'TEXT' || layer.childIds.length === 0)
      return [element]
    const template: DesignElement = {
      type: 'element',
      tagName: 'template',
      attrs: { [ATTR.childrenOf]: layer.id },
      children: layer.childIds.flatMap((id) => this.project(id))
    }
    return [element, template]
  }
}

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/** An attribute in the quotes that keep it readable: JSON reads best in single quotes. */
function attribute(name: string, value: string): string {
  if (value === '') return ` ${name}`
  if (value.includes('"') && !value.includes("'"))
    return ` ${name}='${value.replaceAll('&', '&amp;')}'`
  return ` ${name}="${value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`
}

function openTag(element: DesignElement): string {
  const attrs = Object.entries(element.attrs)
    .map(([name, value]) => attribute(name, value))
    .join('')
  return `<${element.tagName}${attrs}>`
}

const VOID_ELEMENTS = new Set(['img', 'br', 'hr', 'input'])

/** Whether an element's children are layers, each printed on its own line. */
function holdsLayers(element: DesignElement): boolean {
  return element.children.some(
    (child) =>
      child.type === 'element' &&
      (child.sourceSceneNode !== undefined || child.tagName === 'template')
  )
}

function printNode(node: DesignNode, depth: number, lines: string[]): void {
  if (node.type === 'text') return
  const indent = '  '.repeat(depth)
  const open = openTag(node)
  if (VOID_ELEMENTS.has(node.tagName)) {
    lines.push(`${indent}${open}`)
    return
  }
  // Text runs and SVG drawings stay on one line: whitespace in them is content.
  if (!holdsLayers(node)) {
    const content = serializeHTML({ type: 'document', children: node.children })
    lines.push(`${indent}${open}${content}</${node.tagName}>`)
    return
  }
  lines.push(`${indent}${open}`)
  for (const child of node.children) printNode(child, depth + 1, lines)
  lines.push(`${indent}</${node.tagName}>`)
}

function printPage(page: SceneNode, layers: readonly DesignNode[]): string {
  const lines = [
    '<!doctype html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8">',
    `  <title>${escapeText(page.name)}</title>`,
    `  <link rel="stylesheet" href="${pageRelativePath(TOKENS_CSS_FILE)}">`,
    `  <link rel="stylesheet" href="${pageRelativePath(STYLES_FILE)}">`,
    '</head>',
    `<body${attribute(ATTR.page, page.id)}>`
  ]
  for (const layer of layers) printNode(layer, 1, lines)
  lines.push('</body>', '</html>', '')
  return lines.join('\n')
}

function descendantCount(graph: SceneGraph, node: SceneNode): number {
  return graph.countDescendants(node.id)
}

/** Where each artboard of a page sits on the canvas, which `project.json` keeps. */
export function artboardPositions(graph: SceneGraph, page: SceneNode): Map<string, Vector> {
  return new Map(graph.getChildren(page.id).map((child) => [child.id, { x: child.x, y: child.y }]))
}

/**
 * A page as HTML: each layer an element with the CSS dom-css projects for it, and the fields
 * that CSS cannot hold in `data-kalka-props`. Which fields those are is found by reading the page
 * back exactly as opening it does, so what the HTML holds and what the props add always agree.
 */
export function writePageHTML(graph: SceneGraph, page: SceneNode, context: PageWriteContext) {
  const projector = new PageProjector(graph, context)
  const layers = page.childIds.flatMap((id) => projector.project(id))
  const artboards = artboardPositions(graph, page)

  const scratch = new SceneGraph()
  const scratchPage = scratch.createNodeWithId(page.id, 'CANVAS', scratch.rootId, {
    name: page.name
  })
  const residuals = new Map<string, Residual>()
  readPageLayers(scratch, scratchPage, printPage(page, layers), {
    artboards,
    classRules: context.classRules,
    resolveImage: imageSourceResolver(graph.images),
    residual: (read) => {
      const original = graph.getNode(read.id)
      if (!original) throw new Error(`A page wrote a layer it does not have: ${read.id}`)
      const residual = layerResidual(original, read)
      if (residual) residuals.set(read.id, residual)
      return residual
    }
  })
  const written = descendantCount(scratch, scratchPage)
  const expected = descendantCount(graph, page)
  if (written !== expected)
    throw new Error(`Page "${page.name}" kept ${written} of its ${expected} layers`)

  for (const [id, residual] of residuals) {
    const element = projector.elements.get(id)
    if (element) element.attrs[ATTR.props] = JSON.stringify(encodeValue(residual))
  }
  return printPage(page, layers)
}
