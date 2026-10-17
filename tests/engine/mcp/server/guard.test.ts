import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

import { WebSocket } from 'ws'

import { startServer, type ServerHandle } from '#mcp/server'
import { isAllowedOrigin, isLoopbackHost } from '#mcp/server/guard'
import { DESKTOP_APP_ORIGINS } from '#mcp/transport/origins'

import { tcpRequest } from '#tests/helpers/mcp/server'

const AUTH_TOKEN = 'test-guard-token'
const APP_ORIGIN = 'kalka-app://app'
const FOREIGN_ORIGIN = 'https://evil.example'

/** Opens a WebSocket with the given headers and reports the handshake's HTTP status. */
function handshakeStatus(port: number, headers: Record<string, string>): Promise<number> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, { headers })
    ws.once('open', () => {
      ws.close()
      resolve(101)
    })
    ws.once('unexpected-response', (_req, res) => {
      resolve(res.statusCode ?? 0)
      ws.terminate()
    })
    ws.once('error', reject)
  })
}

describe('MCP request guard rules', () => {
  test('accepts loopback hosts and refuses other names', () => {
    for (const host of [
      undefined,
      'localhost',
      '127.0.0.1:7600',
      '[::1]:7600',
      'mcp.kalka.localhost'
    ])
      expect(isLoopbackHost(host)).toBe(true)
    for (const host of [
      'evil.example',
      'evil.example:7600',
      '127.0.0.1.nip.io',
      'localhost.evil.example',
      ''
    ])
      expect(isLoopbackHost(host)).toBe(false)
  })

  test('lets through requests without Origin and from listed origins only', () => {
    expect(isAllowedOrigin(undefined, [])).toBe(true)
    expect(isAllowedOrigin(APP_ORIGIN, DESKTOP_APP_ORIGINS)).toBe(true)
    expect(isAllowedOrigin(FOREIGN_ORIGIN, DESKTOP_APP_ORIGINS)).toBe(false)
    expect(isAllowedOrigin('null', DESKTOP_APP_ORIGINS)).toBe(false)
    expect(isAllowedOrigin(APP_ORIGIN, [])).toBe(false)
  })
})

describe('MCP server request guard', () => {
  let handle: ServerHandle
  let port = 0

  beforeAll(async () => {
    handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: null,
      authToken: AUTH_TOKEN,
      corsOrigin: DESKTOP_APP_ORIGINS,
      enableEval: false,
      mcpRoot: null
    })
    port = handle.httpPort
  })

  afterAll(async () => {
    await handle.close()
  })

  const auth = { authorization: `Bearer ${AUTH_TOKEN}` }

  test('serves requests from programs, which send no Origin', async () => {
    const health = await tcpRequest(port, 'GET', '/health', undefined, auth)
    expect(health.status).toBe(200)
  })

  test('serves the desktop app origin, preflight included', async () => {
    const health = await tcpRequest(port, 'GET', '/health', undefined, {
      ...auth,
      origin: APP_ORIGIN
    })
    expect(health.status).toBe(200)

    const preflight = await fetch(`http://127.0.0.1:${port}/health`, {
      method: 'OPTIONS',
      headers: {
        origin: APP_ORIGIN,
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization'
      }
    })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe(APP_ORIGIN)
  })

  test('refuses a foreign Origin even with a valid token', async () => {
    for (const path of ['/health', '/rpc', '/mcp']) {
      const response = await tcpRequest(
        port,
        'POST',
        path,
        { command: 'list_documents', args: {} },
        { ...auth, origin: FOREIGN_ORIGIN }
      )
      expect(response.status).toBe(403)
      expect(response.data).toEqual({ error: 'Origin not allowed' })
    }
    const opaque = await tcpRequest(port, 'GET', '/health', undefined, { origin: 'null' })
    expect(opaque.status).toBe(403)
  })

  test('refuses CORS preflights from other origins', async () => {
    const preflight = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'OPTIONS',
      headers: {
        origin: FOREIGN_ORIGIN,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'authorization, content-type'
      }
    })
    expect(preflight.status).toBe(403)
    expect(preflight.headers.get('access-control-allow-origin')).toBeNull()
  })

  test('refuses a Host that is not loopback, as DNS rebinding sends', async () => {
    const rebound = await tcpRequest(port, 'GET', '/health', undefined, {
      ...auth,
      host: `rebind.evil.example:${port}`
    })
    expect(rebound.status).toBe(403)
    expect(rebound.data).toEqual({ error: 'Host not allowed' })

    const portless = await tcpRequest(port, 'GET', '/health', undefined, {
      ...auth,
      host: 'mcp.kalka.localhost'
    })
    expect(portless.status).toBe(200)
  })

  test('answers OAuth discovery probes with an empty 404', async () => {
    for (const path of [
      '/.well-known/oauth-protected-resource',
      '/.well-known/oauth-protected-resource/mcp',
      '/.well-known/oauth-authorization-server'
    ]) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`)
      expect(response.status).toBe(404)
      expect(await response.text()).toBe('')
    }
  })

  test('applies the same rules to WebSocket handshakes', async () => {
    expect(await handshakeStatus(port, {})).toBe(101)
    expect(await handshakeStatus(port, { origin: APP_ORIGIN })).toBe(101)
    expect(await handshakeStatus(port, { origin: FOREIGN_ORIGIN })).toBe(403)
    expect(await handshakeStatus(port, { host: 'rebind.evil.example' })).toBe(403)
  })
})

describe('MCP server without configured origins', () => {
  test('refuses every request that carries an Origin', async () => {
    const handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: null,
      authToken: null,
      enableEval: false,
      mcpRoot: null
    })
    try {
      const page = await tcpRequest(
        handle.httpPort,
        'POST',
        '/rpc',
        { command: 'list_documents' },
        {
          origin: 'http://localhost:3000'
        }
      )
      expect(page.status).toBe(403)
      expect(await handshakeStatus(handle.httpPort, { origin: 'http://localhost:3000' })).toBe(403)
    } finally {
      await handle.close()
    }
  })
})
