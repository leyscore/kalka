import { breakpointsOf, responsiveArtboards, type SceneGraph } from '@open-pencil/scene-graph'

import type { DesignDocument, DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { inlineStyleOverClasses } from './classes'

/** Projects one artboard as the export does, so breakpoints compare like with like. */
export type ArtboardProjector = (nodeId: string) => DesignNode | undefined

const sourceOf = (element: DesignElement) =>
  element.sourceSceneNode?.responsiveSource ?? element.sourceSceneNode?.id

/** Each element of a projected artboard by the primary layer it stands for. */
function elementsBySource(root: DesignNode | undefined): Map<string, DesignElement> {
  const elements = new Map<string, DesignElement>()
  const visit = (node: DesignNode) => {
    if (node.type === 'text') return
    const source = sourceOf(node)
    if (source) elements.set(source, node)
    node.children.forEach(visit)
  }
  if (root) visit(root)
  return elements
}

/** The source of each element's parent element, by the element's source. */
function parentSources(root: DesignElement): Map<string, string> {
  const parents = new Map<string, string>()
  const visit = (node: DesignElement) => {
    const source = sourceOf(node)
    for (const child of node.children) {
      if (child.type === 'text') continue
      const childSource = sourceOf(child)
      if (source && childSource) parents.set(childSource, source)
      visit(child)
    }
  }
  visit(root)
  return parents
}

function withoutWidth(style: DesignStyleDeclaration): DesignStyleDeclaration {
  return Object.fromEntries(Object.entries(style).filter(([name]) => name !== 'width'))
}

/**
 * Gives a primary artboard's elements the declarations each breakpoint changes: a breakpoint
 * narrower than the next wider artboard applies below that artboard's width, and holds what
 * differs from it, so the rules cascade from wide to narrow. A layer hidden in a breakpoint is
 * `display: none` there. The artboard itself fills the page instead of its design width.
 */
function responsiveRoot(
  graph: SceneGraph,
  root: DesignElement,
  project: ArtboardProjector
): DesignElement {
  const primary = root.sourceSceneNode
  if (!primary) return root
  const artboards = responsiveArtboards(graph, primary.id)
  const elements = elementsBySource(root)
  const parents = parentSources(root)
  let wider = elements
  artboards.slice(1).forEach((artboard, index) => {
    const maxWidth = artboards[index].width - 1
    const current = elementsBySource(project(artboard.id))
    for (const [source, previous] of wider) {
      const element = elements.get(source)
      if (!element) continue
      const copy = current.get(source)
      // Inside a layer hidden here, hiding the layer is enough.
      const parent = parents.get(source)
      if (!copy && parent && wider.has(parent) && !current.has(parent)) continue
      let style = copy
        ? inlineStyleOverClasses(copy.inlineStyle ?? {}, previous.inlineStyle ?? {})
        : { display: 'none' }
      if (element === root) style = withoutWidth(style)
      if (Object.keys(style).length > 0)
        element.mediaStyles = [...(element.mediaStyles ?? []), { maxWidth, style }]
    }
    wider = current
  })
  root.inlineStyle = { ...root.inlineStyle, width: '100%' }
  return root
}

/** A copy of a projected tree whose elements can take media styles; layers stay shared. */
function copyTree(node: DesignElement): DesignElement {
  return {
    ...node,
    attrs: { ...node.attrs },
    inlineStyle: node.inlineStyle && { ...node.inlineStyle },
    children: node.children.map((child) => (child.type === 'text' ? { ...child } : copyTree(child)))
  }
}

/** Whether a projected element is a primary artboard with breakpoints. */
export function isResponsiveRoot(graph: SceneGraph | undefined, node: DesignNode): boolean {
  const layer = node.type === 'element' ? node.sourceSceneNode : undefined
  return !!graph && !!layer && breakpointsOf(graph, layer.id).length > 0
}

/** A projected document with its primary artboards' breakpoints as media styles. */
export function withResponsiveStyles(
  graph: SceneGraph,
  document: DesignDocument,
  project: ArtboardProjector
): DesignDocument {
  return {
    ...document,
    children: document.children.map((node) =>
      node.type === 'element' && isResponsiveRoot(graph, node)
        ? responsiveRoot(graph, copyTree(node), project)
        : node
    )
  }
}
