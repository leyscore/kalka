import { createMCPConnectionDraft } from './store'
import type { MCPAuthenticationType, MCPConnection, MCPConnectionDraft } from './types'

/**
 * Design-reference libraries Kalka offers to connect in one click, so the agent can show real
 * websites and app screens during the kickoff. Each one is a remote server the person adds as an
 * ordinary connection; the agent finds it among its tools.
 */
export type SuggestedMCPConnection = {
  key: 'inspo' | 'mobbin' | 'refero'
  name: string
  url: string
  authenticationType: Extract<MCPAuthenticationType, 'none' | 'oauth'>
  /** Whether using it needs a paid account with the service. */
  paid: boolean
}

export const SUGGESTED_MCP_CONNECTIONS: readonly SuggestedMCPConnection[] = [
  {
    key: 'inspo',
    name: 'Inspo',
    url: 'https://inspomcp.dev/api/mcp',
    authenticationType: 'none',
    paid: false
  },
  {
    key: 'mobbin',
    name: 'Mobbin',
    url: 'https://api.mobbin.com/mcp',
    authenticationType: 'oauth',
    paid: true
  },
  {
    key: 'refero',
    name: 'Refero',
    url: 'https://api.refero.design/mcp',
    authenticationType: 'oauth',
    paid: true
  }
]

function sameServer(a: string, b: string): boolean {
  return a.trim().replace(/\/+$/, '').toLowerCase() === b.replace(/\/+$/, '').toLowerCase()
}

/** The suggestions the person has not connected yet, matched by server URL. */
export function availableSuggestedMCPConnections(
  connections: readonly MCPConnection[]
): SuggestedMCPConnection[] {
  return SUGGESTED_MCP_CONNECTIONS.filter(
    (suggestion) =>
      !connections.some(
        ({ transport }) =>
          transport.type === 'streamable-http' && sameServer(transport.url, suggestion.url)
      )
  )
}

/** A new connection's draft filled in from a suggestion, ready to save (and sign in to). */
export function suggestedMCPConnectionDraft(
  suggestion: SuggestedMCPConnection
): MCPConnectionDraft {
  return {
    ...createMCPConnectionDraft(),
    name: suggestion.name,
    url: suggestion.url,
    authenticationType: suggestion.authenticationType,
    enabled: true
  }
}
