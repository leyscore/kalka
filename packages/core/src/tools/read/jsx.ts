import * as v from 'valibot'

import { sceneNodeToJSX } from '@kalka/design-jsx'

import { jsxPatch } from '#core/tools/analyze/diff/jsx'
import { nodeIdInput, nodeComparisonInput } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

const MAX_INLINE_JSX_LENGTH = 12_000

export const getJSX = defineTool({
  name: 'get_jsx',
  description:
    'Get JSX representation of a node and its children. Compact round-trip format — same syntax as the render tool. ' +
    `JSX longer than ${MAX_INLINE_JSX_LENGTH} characters is cut, and the result says so.`,
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    id: nodeIdInput,
    path: v.optional(
      v.pipe(
        v.string(),
        v.minLength(1),
        v.description(
          'Write the complete JSX to this path instead of returning it (requires KALKA_MCP_ROOT)'
        )
      )
    )
  }),
  // Only the MCP server with a root writes files; elsewhere a path would return all the JSX inline.
  inputExposure: { path: { ai: false, webmcp: false } },
  execute: (figma, { id, path }) => {
    const node = figma.getNodeById(id)
    if (!node) return { error: `Node "${id}" not found` }
    const jsx = sceneNodeToJSX(id, figma.graph)
    if (path !== undefined || jsx.length <= MAX_INLINE_JSX_LENGTH) {
      return { id, name: node.name, jsx }
    }
    return {
      id,
      name: node.name,
      jsx: jsx.slice(0, MAX_INLINE_JSX_LENGTH),
      truncated: true,
      totalLength: jsx.length,
      note: `JSX cut at ${MAX_INLINE_JSX_LENGTH} of ${jsx.length} characters.`
    }
  }
})

export const diffJSX = defineTool({
  name: 'diff_jsx',
  description:
    'Structural diff between two nodes in JSX format. Shows added/removed children, changed props.',
  execution: { kind: 'sync', mutation: 'none' },
  input: nodeComparisonInput,
  execute: (figma, { from, to }) => {
    const fromNode = figma.getNodeById(from)
    if (!fromNode) return { error: `Node "${from}" not found` }
    const toNode = figma.getNodeById(to)
    if (!toNode) return { error: `Node "${to}" not found` }

    const patch = jsxPatch(
      fromNode.name,
      toNode.name,
      sceneNodeToJSX(from, figma.graph),
      sceneNodeToJSX(to, figma.graph)
    )
    return patch === null ? { diff: null, message: 'No differences' } : { diff: patch }
  }
})
