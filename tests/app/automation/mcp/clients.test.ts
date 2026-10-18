import { describe, expect, test } from 'bun:test'

import { mcpClientError, type MCPClientFailure } from '@/app/automation/mcp/clients'

describe('mcpClientError', () => {
  test('reads the failure codes the desktop app reports', () => {
    const failure: MCPClientFailure = {
      code: 'config-invalid',
      client: 'Claude Code',
      file: 'C:\\Users\\Jane\\.claude.json',
      syntax: 'JSON',
      details: 'Claude Code: spawn EINVAL\n\nJSON error at offset 15'
    }
    expect(mcpClientError(failure)).toEqual({ failure })
    expect(mcpClientError({ code: 'bridge-missing', bridge: 'kalka-mcp' })).toEqual({
      failure: { code: 'bridge-missing', bridge: 'kalka-mcp' }
    })
    expect(mcpClientError({ code: 'extension-missing' })).toEqual({
      failure: { code: 'extension-missing' }
    })
  })

  test('keeps the text of an error it cannot read, for the details', () => {
    expect(mcpClientError('Claude Code refused to add Kalka.')).toEqual({
      failure: null,
      message: 'Claude Code refused to add Kalka.'
    })
    expect(mcpClientError(new Error('Unknown MCP client'))).toEqual({
      failure: null,
      message: 'Unknown MCP client'
    })
    expect(mcpClientError({ code: 'config-invalid', client: 'Zed' })).toMatchObject({
      failure: null
    })
  })
})
