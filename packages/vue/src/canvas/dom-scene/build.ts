import { elementAttributes, type DesignNode } from '@kalka/dom-css/export'

const SVG_NS = 'http://www.w3.org/2000/svg'

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
