/**
 * A minimal stdio MCP server that offers Kalka Fresh search to the CLI, as Kalka's own MCP server
 * does: the same search function, with each match's HTML, since this session writes one page in
 * one reply instead of inserting instances. Every call is appended to FRESH_LOG.
 */
import { appendFileSync } from 'node:fs'
import { createInterface } from 'node:readline'

import { searchFreshComponents } from '/Users/beleyd/Developer/Kalka/public/kalka/.claude/worktrees/fresh-component-library/packages/core/src/library/fresh/search.ts'

const TOOL = {
  name: 'search_library_components',
  description:
    'Search Kalka Fresh, the built-in library of design-forward components (live shader backgrounds, headline effects, glass and paper cards, buttons, hero devices, separators), by intent such as "animated background for a tech landing". Returns the best matches with their variants, text properties, source and licence, and the HTML of each. An optional toolbox, not a template: use one or two where they serve the idea of the page, then adapt them. Skip them when nothing fits.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What the component is for, in a few words' },
      category: {
        type: 'string',
        enum: ['backgrounds', 'headlines', 'cards', 'buttons', 'hero-devices', 'separators']
      },
      limit: { type: 'number' }
    },
    required: ['query']
  }
}

const send = (message: unknown) => process.stdout.write(`${JSON.stringify(message)}\n`)

createInterface({ input: process.stdin }).on('line', (line) => {
  let request: { id?: number | string; method: string; params?: Record<string, unknown> }
  try {
    request = JSON.parse(line)
  } catch {
    return
  }
  const { id, method, params } = request
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'kalka-fresh', version: '1' } } })
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: [TOOL] } })
  } else if (method === 'tools/call') {
    const args = (params?.arguments ?? {}) as { query?: string; category?: never; limit?: number }
    const components = searchFreshComponents(args.query ?? '', { category: args.category, limit: args.limit ?? 4, includeHTML: true })
    if (process.env.FRESH_LOG) appendFileSync(process.env.FRESH_LOG, `${JSON.stringify({ query: args.query, category: args.category, results: components.map((c) => c.asset_key) })}\n`)
    send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify({ count: components.length, components }) }] } })
  } else if (id !== undefined) {
    send({ jsonrpc: '2.0', id, result: {} })
  }
})
