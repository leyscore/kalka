import type { DesignElement, DesignNode, DesignStyleDeclaration } from '@kalka/dom-css/export'

/** The attribute that ties a DOM element to its scene-graph layer. */
export const LAYER_ID_ATTR = 'data-kalka-id'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** The projection's own id attribute; the renderer writes {@link LAYER_ID_ATTR} instead. */
const PROJECTION_ID_ATTR = 'data-kalka-node-id'

export function styleText(style: DesignStyleDeclaration | undefined): string {
  if (!style) return ''
  let text = ''
  for (const [property, value] of Object.entries(style)) {
    if (value !== '') text += `${property}:${value};`
  }
  return text
}

/** The attributes an element should carry, the layer id and style included. */
export function elementAttributes(element: DesignElement): Map<string, string> {
  const attrs = new Map<string, string>()
  for (const [name, value] of Object.entries(element.attrs)) {
    if (name !== PROJECTION_ID_ATTR) attrs.set(name, value)
  }
  if (element.sourceSceneNodeId) attrs.set(LAYER_ID_ATTR, element.sourceSceneNodeId)
  if (element.sourceSceneNode?.type === 'TEXT') attrs.set('data-kalka-text', '')
  const style = styleText(element.inlineStyle)
  if (style) attrs.set('style', style)
  return attrs
}

/**
 * Builds DOM for a projected subtree in `doc`, registering every layer element it creates
 * through `register`. SVG keeps its namespace all the way down.
 */
export function buildNode(
  doc: Document,
  node: DesignNode,
  register?: (id: string, element: Element) => void,
  inSVG = false
): Node {
  if (node.type === 'text') return doc.createTextNode(node.text)
  const svg = inSVG || node.tagName === 'svg'
  const element = svg ? doc.createElementNS(SVG_NS, node.tagName) : doc.createElement(node.tagName)
  for (const [name, value] of elementAttributes(node)) element.setAttribute(name, value)
  for (const child of node.children) element.append(buildNode(doc, child, register, svg))
  if (node.sourceSceneNodeId) register?.(node.sourceSceneNodeId, element)
  return element
}

/** Brings an element's attributes in line with `wanted`, touching only what differs. */
export function patchAttributes(element: Element, wanted: Map<string, string>): void {
  for (const name of element.getAttributeNames()) {
    if (!wanted.has(name)) element.removeAttribute(name)
  }
  for (const [name, value] of wanted) {
    if (element.getAttribute(name) !== value) element.setAttribute(name, value)
  }
}
