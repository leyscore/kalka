import { describe, expect, test } from 'bun:test'
import { Readable } from 'node:stream'

import {
  createAutomationEnvironment,
  readDevMCPConfiguration
} from '@/app/automation/bridge/vite-plugin'

describe('MCP Vite development server', () => {
  test('passes an explicit empty auth token when authentication is disabled', () => {
    const env = createAutomationEnvironment({
      authToken: 'development-token',
      baseEnv: { OPENPENCIL_MCP_AUTH_TOKEN: 'inherited-token' },
      configuration: {
        authenticationEnabled: false,
        rootDirectory: '/designs',
        disabledTools: 'eval,delete_node'
      },
      corsOrigin: 'http://localhost:1420',
      socketPath: '/tmp/open-pencil.sock'
    })

    expect(env.OPENPENCIL_MCP_AUTH_TOKEN).toBe('')
    expect(env.OPENPENCIL_MCP_ROOT).toBe('/designs')
    expect(env.OPENPENCIL_MCP_DISABLED_TOOLS).toBe('eval,delete_node')
  })

  test('decodes UTF-8 configuration split across request chunks', async () => {
    const body = Buffer.from(
      JSON.stringify({
        authenticationEnabled: true,
        rootDirectory: '/设计',
        disabledTools: ''
      })
    )
    const split = body.indexOf(Buffer.from('设')) + 1
    const request = Readable.from([body.subarray(0, split), body.subarray(split)])

    await expect(readDevMCPConfiguration(request as never)).resolves.toEqual({
      authenticationEnabled: true,
      rootDirectory: '/设计',
      disabledTools: ''
    })
  })

  test('rejects configuration bodies above the byte limit', async () => {
    const request = Readable.from([Buffer.alloc(70_001)])
    await expect(readDevMCPConfiguration(request as never)).rejects.toThrow(
      'Request body is too large'
    )
  })
})
