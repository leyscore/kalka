import * as v from 'valibot'

import { declarationChanges } from '#core/editor/css-writes'
import { findPageId } from '#core/io/subgraph'
import { computeAllLayouts } from '#core/layout'
import { nodeIdInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

export const updateStyles = defineTool({
  name: 'update_styles',
  description:
    'Change a layer with CSS declarations, such as { "padding": "24px", "background-color": "#2F5BEA", "display": "flex", "gap": "12px", "border-radius": "16px" } or, on text, { "font-size": "40px", "color": "#121214" }. Only the given properties change.',
  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    id: nodeIdInput,
    styles: v.pipe(
      v.record(v.string(), v.string()),
      v.description('CSS properties in kebab-case and their values')
    )
  }),
  execute: async (figma, { id, styles }) => {
    const node = figma.graph.getNode(id)
    if (!node) return { error: `Node "${id}" not found` }
    const changes = declarationChanges(figma.graph, node, styles)
    const changed = Object.keys(changes)
    if (changed.length > 0) {
      figma.graph.updateNode(id, changes)
      const pageId = findPageId(figma.graph, id)
      if (pageId) computeAllLayouts(figma.graph, pageId)
    }
    return { id, name: node.name, changed }
  }
})
