import { expect, test } from 'bun:test'

import { codingAgentSetupPrompt } from '@/app/ai/acp/setup-prompt'

test('with the MCP server built into the app, the prompt asks only for the agent', () => {
  const prompt = codingAgentSetupPrompt('claude-code', { bundledMCP: true })
  expect(prompt).toContain('built into the Kalka app')
  expect(prompt).not.toContain('openpencil-mcp-http')
  expect(prompt).not.toContain('@open-pencil/mcp')
})

test('without it, the prompt also installs the MCP server', () => {
  expect(codingAgentSetupPrompt('claude-code')).toContain('openpencil-mcp-http')
})
