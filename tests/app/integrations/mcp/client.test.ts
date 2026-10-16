import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

import { McpServer, WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server'
// eslint-disable-next-line kalka/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toStandardJsonSchema as toStandardJSONSchema } from '@valibot/to-json-schema'
import type { Tool } from 'ai'
import * as v from 'valibot'

import { createExternalMCPTools } from '@/app/integrations/mcp/client'
import { replaceMCPConnectionSettings } from '@/app/integrations/mcp/store'

let server: ReturnType<typeof Bun.serve>

/** An outside server with one tool, as a docs or ticketing service would expose. */
async function handle(request: Request): Promise<Response> {
  const mcp = new McpServer({ name: 'docs', version: '1.0.0' })
  mcp.registerTool(
    'lookup_brief',
    {
      description: 'Read the product brief for a topic',
      inputSchema: toStandardJSONSchema(v.object({ topic: v.string() }))
    },
    ({ topic }) => ({ content: [{ type: 'text', text: `Brief for ${topic}: hero, pricing, FAQ` }] })
  )
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  })
  await mcp.connect(transport)
  return transport.handleRequest(request)
}

beforeAll(() => {
  server = Bun.serve({ port: 0, fetch: handle })
  replaceMCPConnectionSettings({
    version: 1,
    connections: [
      {
        id: 'mcp-docs',
        name: 'Product Docs',
        enabled: true,
        transport: { type: 'streamable-http', url: `http://127.0.0.1:${server.port}/mcp` },
        authentication: { type: 'none' }
      }
    ]
  })
})

afterAll(async () => {
  replaceMCPConnectionSettings({ version: 1, connections: [] })
  await server.stop(true)
})

describe('outside MCP servers in the built-in chat', () => {
  test('their tools join the catalog under the server name and call the server', async () => {
    const external = createExternalMCPTools()
    const tools: Record<string, Tool> = {
      render: { description: 'own tool', inputSchema: {} } as Tool
    }
    await external.sync(tools)

    expect(Object.keys(tools).sort()).toEqual(['mcp__Product-Docs__lookup_brief', 'render'])
    const lookup = tools['mcp__Product-Docs__lookup_brief']
    const output = await lookup.execute?.(
      { topic: 'pricing' },
      { toolCallId: '1', messages: [], context: {} }
    )
    expect(output).toEqual({ text: 'Brief for pricing: hero, pricing, FAQ' })
    await external.close()
  })

  test('a disabled server leaves the catalog', async () => {
    const external = createExternalMCPTools()
    const tools: Record<string, Tool> = {}
    await external.sync(tools)
    replaceMCPConnectionSettings({ version: 1, connections: [] })
    await external.sync(tools)
    expect(Object.keys(tools)).toEqual([])
    await external.close()
  })
})
