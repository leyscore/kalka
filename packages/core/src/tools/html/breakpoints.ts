import * as v from 'valibot'

import { createBreakpoint, responsiveArtboards } from '@kalka/scene-graph'

import { computeAllLayouts } from '#core/layout'
import { nodeIdInput, toolNumber } from '#core/tools/input'
import { defineTool, nodeNotFound } from '#core/tools/schema'

export const addBreakpoint = defineTool({
  name: 'add_breakpoint',
  description:
    'Add a breakpoint to a top-level artboard: a linked copy at a narrower width (810 for tablet, 390 for phone) placed next to it. Its layers follow the wider artboard until you change them in the breakpoint with update_styles or update_node; those changes become @media rules in the HTML export. Adding, deleting or moving a layer in any of the artboards changes the shared structure.',
  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    id: nodeIdInput,
    width: toolNumber(v.pipe(v.number(), v.minValue(120), v.description('Breakpoint width in px'))),
    name: v.optional(v.pipe(v.string(), v.description('Artboard name, such as "Phone"')))
  }),
  execute: async (figma, { id, width, name }) => {
    const graph = figma.graph
    const primary = graph.getNode(id)
    if (!primary) return nodeNotFound(id)
    const created = createBreakpoint(graph, id, width, name ?? `${primary.name} ${width}`)
    if (!created)
      return {
        error: `"${primary.name}" must be a top-level artboard wider than ${width}px, not itself a breakpoint`
      }
    if (created.parentId) computeAllLayouts(graph, created.parentId)
    return {
      id: created.id,
      name: created.name,
      artboards: responsiveArtboards(graph, id).map((artboard) => ({
        id: artboard.id,
        name: artboard.name,
        width: artboard.width
      }))
    }
  }
})
