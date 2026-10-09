import { afterEach, describe, expect, test } from 'bun:test'

import {
  createMCPConnectionDraft,
  mcpConnectionSettings,
  mcpCredentialRef,
  parseMCPConnectionSettings,
  saveMCPConnectionDraft
} from '@/app/integrations/mcp/store'

afterEach(() => {
  mcpConnectionSettings.value = { version: 1, connections: [] }
})

describe('MCP connections', () => {
  test('a local server saves its command line and keeps its environment secret', () => {
    const saved = saveMCPConnectionDraft({
      ...createMCPConnectionDraft(),
      name: 'Notion',
      transportType: 'stdio',
      command: 'npx -y "@notionhq/notion-mcp-server"',
      enabled: true,
      authenticationType: 'env'
    })
    expect(saved.transport).toEqual({
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@notionhq/notion-mcp-server']
    })
    expect(saved.authentication).toEqual({
      type: 'env',
      credentialRef: mcpCredentialRef(saved.id, 'env')
    })
    expect(createMCPConnectionDraft(saved).command).toBe('npx -y @notionhq/notion-mcp-server')
  })

  test('a transport keeps only the authentication it allows', () => {
    const saved = saveMCPConnectionDraft({
      ...createMCPConnectionDraft(),
      name: 'Local',
      transportType: 'stdio',
      command: 'node server.js',
      authenticationType: 'oauth'
    })
    expect(saved.authentication).toEqual({ type: 'none' })
  })

  test('stored connections read back, and a secret pointing elsewhere is dropped', () => {
    const settings = parseMCPConnectionSettings({
      version: 1,
      connections: [
        {
          id: 'mcp-linear',
          name: 'Linear',
          enabled: true,
          transport: { type: 'streamable-http', url: 'https://mcp.linear.app/mcp' },
          authentication: { type: 'oauth', credentialRef: mcpCredentialRef('mcp-linear', 'oauth') }
        },
        {
          id: 'mcp-local',
          name: 'Local',
          enabled: true,
          transport: { type: 'stdio', command: 'node', args: ['a.js'] },
          authentication: { type: 'env', credentialRef: mcpCredentialRef('mcp-linear', 'env') }
        }
      ]
    })
    expect(settings.connections[0].authentication.type).toBe('oauth')
    expect(settings.connections[1].transport).toEqual({
      type: 'stdio',
      command: 'node',
      args: ['a.js']
    })
    expect(settings.connections[1].authentication).toEqual({ type: 'none' })
  })
})
