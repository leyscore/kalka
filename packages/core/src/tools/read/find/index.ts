import * as v from 'valibot'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import type { FigmaAPI } from '#core/figma-api'
import { figmaNodeIdInput, toolNumber } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

import { matchNode, type FindQuery, type FoundNode } from './search'
import { reachingVariables, variablesNamed } from './tokens'
import { DEFAULT_COLOR_TOLERANCE, DEFAULT_NUMBER_TOLERANCE } from './values'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

const NODE_TYPES = [
  'FRAME',
  'RECTANGLE',
  'ELLIPSE',
  'TEXT',
  'LINE',
  'STAR',
  'POLYGON',
  'SECTION',
  'GROUP',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE',
  'VECTOR',
  'BOOLEAN_OPERATION'
] as const

/** Where a search looks, with the page each starting layer is on. */
type SearchRoots = { roots: Array<{ node: SceneNode; page: SceneNode }> } | { error: string }

function pageOf(graph: SceneGraph, node: SceneNode): SceneNode | undefined {
  return node.type === 'CANVAS' ? node : graph.closest(node.id, (found) => found.type === 'CANVAS')
}

function rootsOf(graph: SceneGraph, nodes: readonly SceneNode[]): SearchRoots {
  const roots = nodes.flatMap((node) => {
    const page = pageOf(graph, node)
    return page ? [{ node, page }] : []
  })
  return { roots }
}

function searchRoots(
  figma: FigmaAPI,
  args: { within?: 'page' | 'selection' | 'document'; page?: string; root_id?: string }
): SearchRoots {
  const graph = figma.graph
  if (args.root_id !== undefined) {
    const root = graph.getNode(args.root_id)
    if (!root) return { error: `Node "${args.root_id}" not found` }
    return rootsOf(graph, [root])
  }
  if (args.within === 'selection') {
    const selection = figma.currentPage.selection
    if (selection.length === 0)
      return { error: 'Nothing is selected; select layers or pass root_id' }
    return rootsOf(
      graph,
      selection.flatMap((node) => graph.getNode(node.id) ?? [])
    )
  }
  if (args.within === 'document') return rootsOf(graph, graph.getPages())
  if (args.page !== undefined) {
    const wanted = args.page.trim()
    const page = graph.getPages().find((found) => found.id === wanted || found.name === wanted)
    if (!page) {
      const names = graph.getPages().map((found) => found.name)
      return { error: `Page "${wanted}" not found; pages: ${names.join(', ')}` }
    }
    return rootsOf(graph, [page])
  }
  const current = graph.getNode(figma.currentPage.id)
  return current ? rootsOf(graph, [current]) : { error: 'No page is open' }
}

const styleInput = v.pipe(
  v.strictObject({
    property: v.optional(
      v.pipe(
        v.string(),
        v.description(
          'CSS property as Kalka writes the layer, such as background-color, color, font-size, border-radius, gap, padding-left, box-shadow. Omit to look in every property'
        )
      )
    ),
    value: v.optional(
      v.pipe(
        v.string(),
        v.description(
          'Value to match. Colors match in any notation (hex, rgb, hsl, oklch) with alpha, including colors inside border, box-shadow or gradients; lengths match in px or rem; * and ? are wildcards over the whole value. Omit to find every layer declaring the property'
        )
      )
    )
  }),
  v.description('Match layers by a CSS declaration of their projected CSS')
)

export const findNodes = defineTool({
  name: 'find_nodes',
  description: `Find layers by name, type, text, CSS style value, or variable (token), for audits and bulk edits. Filters combine (all must match). Searches the current page unless within, page, or root_id says otherwise.

- style { property, value }: matches the CSS Kalka projects for each layer (its fields as CSS plus its own CSS). Colors are equivalent across hex, rgb, hsl and oklch within tolerance; lengths compare in px. Each match names the variables bound to that property.
- variable: name, ID, or CSS custom property (--color-primary) of a variable. variable_match "bound" (default) finds layers bound to it, directly or through an alias, in any mode; "unbound" finds layers whose raw value equals its value in some mode but bind no variable there — candidates to bind with bind_variable using the reported field; "any" returns both.
- name and text: case-insensitive substring, or a whole-value pattern with * and ? wildcards.

Returns count (all matches), the first limit nodes with id, name, type, page, and what matched.`,
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    name: v.optional(
      v.pipe(
        v.string(),
        v.description('Layer name: substring, or a pattern with * and ? (case-insensitive)')
      )
    ),
    type: v.optional(v.pipe(v.picklist(NODE_TYPES), v.description('Node type filter'))),
    text: v.optional(
      v.pipe(
        v.string(),
        v.description('Text layer content: substring, or a pattern with * and ? (case-insensitive)')
      )
    ),
    style: v.optional(styleInput),
    variable: v.optional(
      v.pipe(
        v.string(),
        v.description('Variable name (color/primary), ID, or CSS custom property (--color-primary)')
      )
    ),
    variable_match: v.optional(
      v.pipe(
        v.picklist(['bound', 'unbound', 'any']),
        v.description(
          'With variable: bound layers (default), unbound layers holding its value, or both'
        )
      )
    ),
    tolerance: v.optional(
      toolNumber(
        v.pipe(
          v.number(),
          v.minValue(0),
          v.description(
            `How close values must be: for colors, distance in 0-255 RGB (default ${DEFAULT_COLOR_TOLERANCE}); for lengths, pixels (default ${DEFAULT_NUMBER_TOLERANCE})`
          )
        )
      )
    ),
    within: v.optional(
      v.pipe(
        v.picklist(['page', 'selection', 'document']),
        v.description('Search the current page (default), the selected layers, or every page')
      )
    ),
    page: v.optional(
      v.pipe(v.string(), v.description('With within "page": page name or ID instead of current'))
    ),
    root_id: v.optional(
      v.pipe(figmaNodeIdInput, v.description('Search only this layer and its descendants'))
    ),
    limit: v.optional(
      toolNumber(
        v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.maxValue(MAX_LIMIT),
          v.description(`Most nodes to return (default ${DEFAULT_LIMIT}); count reports all`)
        )
      )
    )
  }),
  execute: (figma, args) => {
    const graph = figma.graph
    if (args.style && args.style.property === undefined && args.style.value === undefined)
      return { error: 'style needs a property, a value, or both' }
    const target = searchRoots(figma, args)
    if ('error' in target) return { error: target.error }

    const query: FindQuery = {
      type: args.type,
      name: args.name,
      text: args.text,
      style: args.style,
      tolerance: {
        color: args.tolerance ?? DEFAULT_COLOR_TOLERANCE,
        number: args.tolerance ?? DEFAULT_NUMBER_TOLERANCE
      }
    }
    if (args.variable !== undefined) {
      const named = variablesNamed(graph, args.variable)
      if (named.length === 0) {
        return {
          error: `No variable named "${args.variable}"; use search_design_system to find variables`
        }
      }
      query.variables = {
        named,
        reaching: reachingVariables(graph, named),
        match: args.variable_match ?? 'bound'
      }
    }

    const limit = args.limit ?? DEFAULT_LIMIT
    const nodes: FoundNode[] = []
    const seen = new Set<string>()
    let count = 0
    for (const { node: root, page } of target.roots) {
      const pending = root.type === 'CANVAS' ? [...root.childIds].reverse() : [root.id]
      for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
        const node = graph.getNode(id)
        if (!node || seen.has(id)) continue
        seen.add(id)
        const found = matchNode(graph, node, page, query)
        if (found) {
          count++
          if (nodes.length < limit) nodes.push(found)
        }
        for (let index = node.childIds.length - 1; index >= 0; index--)
          pending.push(node.childIds[index])
      }
    }
    if (count > nodes.length) return { count, truncated: true, nodes }
    return { count, nodes }
  }
})
