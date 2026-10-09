// A local MCP server for the stdio transport tests: it reads its greeting from the environment.
import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
// eslint-disable-next-line open-pencil/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toStandardJsonSchema as toStandardJSONSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'

const server = new McpServer({ name: 'local-notes', version: '1.0.0' })
server.registerTool(
  'read_note',
  {
    description: 'Read a note',
    inputSchema: toStandardJSONSchema(v.object({ title: v.string() }))
  },
  ({ title }) => ({
    content: [{ type: 'text', text: `${process.env.NOTES_GREETING ?? 'Hi'}, ${title}` }]
  })
)
await server.connect(new StdioServerTransport())
