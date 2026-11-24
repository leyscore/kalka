import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import {
  mcpConnectionSettingsSnapshot,
  replaceMCPConnectionSettings,
  SUGGESTED_MCP_CONNECTIONS,
  type MCPConnectionSettings
} from '@/app/integrations/mcp'
import { useReferenceLibraries } from '@/app/integrations/mcp/libraries'

let original: MCPConnectionSettings

beforeEach(() => {
  original = mcpConnectionSettingsSnapshot()
  replaceMCPConnectionSettings({ version: 1, connections: [] })
})

afterEach(() => {
  replaceMCPConnectionSettings(original)
})

function suggestion(key: string) {
  const found = SUGGESTED_MCP_CONNECTIONS.find((entry) => entry.key === key)
  if (!found) throw new Error(`No suggestion ${key}`)
  return found
}

function stateOf(libraries: ReturnType<typeof useReferenceLibraries>, key: string) {
  return libraries.libraries.value.find((library) => library.key === key)
}

describe('reference libraries', () => {
  test('offers every suggested library until one is connected', () => {
    const libraries = useReferenceLibraries()
    expect(libraries.libraries.value.map(({ state }) => state)).toEqual(
      SUGGESTED_MCP_CONNECTIONS.map(() => 'available')
    )
    expect(libraries.connected.value).toBe(false)
  })

  test('a library with no account is connected as soon as it is saved', async () => {
    const libraries = useReferenceLibraries()
    await libraries.connect(suggestion('inspo'))
    expect(stateOf(libraries, 'inspo')?.state).toBe('connected')
    expect(libraries.connected.value).toBe(true)
    expect(mcpConnectionSettingsSnapshot().connections).toHaveLength(1)
  })

  test('a library with an account is connected only once signed in', async () => {
    let signedIn = false
    const libraries = useReferenceLibraries({
      signIn: async () => {
        signedIn = true
      },
      signedIn: async () => signedIn
    })
    await libraries.connect(suggestion('mobbin'))
    expect(stateOf(libraries, 'mobbin')?.state).toBe('connected')
  })

  test('a failed sign-in keeps the library on offer and says why', async () => {
    const libraries = useReferenceLibraries({
      signIn: async () => {
        throw new Error('Sign-in to MCP servers needs the desktop app')
      },
      signedIn: async () => false
    })
    await libraries.connect(suggestion('mobbin'))
    const mobbin = stateOf(libraries, 'mobbin')
    expect(mobbin?.state).toBe('available')
    expect(mobbin?.error).toBe('Sign-in to MCP servers needs the desktop app')
    expect(libraries.connected.value).toBe(false)
    await libraries.connect(suggestion('mobbin'))
    expect(mcpConnectionSettingsSnapshot().connections).toHaveLength(1)
  })
})
