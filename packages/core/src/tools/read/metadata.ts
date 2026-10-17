import * as v from 'valibot'

import type { FigmaAPI, FigmaNodeProxy } from '#core/figma-api'
import { figmaClientInputs, figmaNodeIdInput, toolNumber } from '#core/tools/input'
import { documentPages, resolveFigmaToolTarget } from '#core/tools/read/target'
import { defineTool } from '#core/tools/schema'

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}

function xmlAttribute(name: string, value: string | number): string {
  const text = String(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char)
  return `${name}="${text}"`
}

/** Figma's outline names elements after node types in kebab case: `frame`, `component-set`. */
function elementName(type: string): string {
  return type === 'CANVAS' ? 'page' : type.toLowerCase().replaceAll('_', '-')
}

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * One node and, up to `depth` levels, its children as XML lines. Positions are relative to the
 * parent, as Figma's `x` and `y` are; a page carries no geometry. A node whose children fall past
 * the depth says how many it has.
 */
function outlineLines(
  node: FigmaNodeProxy,
  indent: string,
  depth: number | undefined,
  lines: string[]
): void {
  const attributes = [xmlAttribute('id', node.id), xmlAttribute('name', node.name)]
  if (node.type !== 'CANVAS') {
    attributes.push(
      xmlAttribute('x', roundCoordinate(node.x)),
      xmlAttribute('y', roundCoordinate(node.y)),
      xmlAttribute('width', roundCoordinate(node.width)),
      xmlAttribute('height', roundCoordinate(node.height))
    )
    if (!node.visible) attributes.push(xmlAttribute('hidden', 'true'))
  }
  const children = node.children
  const tag = elementName(node.type)
  const open = `${indent}<${tag} ${attributes.join(' ')}`
  if (children.length === 0) {
    lines.push(`${open} />`)
    return
  }
  if (depth === 0) {
    lines.push(`${open} ${xmlAttribute('children', children.length)} />`)
    return
  }
  lines.push(`${open}>`)
  const childDepth = depth === undefined ? undefined : depth - 1
  for (const child of children) outlineLines(child, `${indent}  `, childDepth, lines)
  lines.push(`${indent}</${tag}>`)
}

/** An XML outline of these nodes and their descendants, one root after another. */
function metadataOutline(nodes: readonly FigmaNodeProxy[], depth?: number): string {
  const lines: string[] = []
  for (const node of nodes) outlineLines(node, '', depth, lines)
  return lines.join('\n')
}

function pagesOutline(figma: FigmaAPI): string {
  return documentPages(figma)
    .map((page) => `<page ${xmlAttribute('id', page.id)} ${xmlAttribute('name', page.name)} />`)
    .join('\n')
}

export const getMetadata = defineTool({
  name: 'get_metadata',
  description:
    "Lightweight XML outline of a node or the selection, as Figma's get_metadata returns: each layer's id, type (as the element name), name, x, y (relative to its parent), width, and height, with children nested. Use it to plan before fetching details with get_node, describe, or get_jsx. With no nodeId and no selection it lists the document's pages; pass a page ID to outline a page.",
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    nodeId: v.optional(
      v.pipe(figmaNodeIdInput, v.description('Node or page to outline. Default: the selection'))
    ),
    depth: v.optional(
      toolNumber(
        v.pipe(
          v.number(),
          v.integer(),
          v.minValue(0),
          v.description(
            'Levels of children to include (0 = the nodes only, with a children count). Default: unlimited'
          )
        )
      )
    ),
    ...figmaClientInputs
  }),
  execute: (figma, { nodeId, depth }) => {
    const target = resolveFigmaToolTarget(figma, nodeId)
    if (target.kind === 'missing') {
      return {
        error: `Node "${target.nodeId}" not found; pass the ID of a layer or one of these pages`,
        xml: pagesOutline(figma)
      }
    }
    if (target.kind === 'none') return { xml: pagesOutline(figma) }
    return { xml: metadataOutline(target.nodes, depth) }
  }
})
