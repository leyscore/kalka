import { afterAll, beforeAll, describe, expect, test } from 'bun:test'

import { McpServer, WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server'
// eslint-disable-next-line kalka/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toStandardJsonSchema as toStandardJSONSchema } from '@valibot/to-json-schema'
import type { Tool } from 'ai'
import * as v from 'valibot'

import { createExternalMCPTools } from '@/app/integrations/mcp/client'
import {
  isSignedIn,
  oauthAccessToken,
  signInMCPConnection,
  type SignInEnvironment
} from '@/app/integrations/mcp/oauth'
import { mcpCredentialRef, replaceMCPConnectionSettings } from '@/app/integrations/mcp/store'
import type { MCPConnection } from '@/app/integrations/mcp/types'

const ACCESS_TOKEN = 'access-1'
let base = ''
let server: ReturnType<typeof Bun.serve>
const registered: unknown[] = []

/** An MCP server behind OAuth, with the authorization server the spec describes. */
async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url)
  switch (url.pathname) {
    case '/.well-known/oauth-protected-resource':
    case '/.well-known/oauth-protected-resource/mcp':
      return Response.json({ resource: `${base}/mcp`, authorization_servers: [base] })
    case '/.well-known/oauth-authorization-server':
      return Response.json({
        issuer: base,
        authorization_endpoint: `${base}/authorize`,
        token_endpoint: `${base}/token`,
        registration_endpoint: `${base}/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none']
      })
    case '/register': {
      const body = v.parse(v.looseObject({}), await request.json())
      registered.push(body)
      return Response.json({ ...body, client_id: 'kalka-client' }, { status: 201 })
    }
    case '/authorize': {
      // The person approves at once: back to the app with a code and the app's state.
      const redirect = new URL(url.searchParams.get('redirect_uri') ?? '')
      redirect.searchParams.set('code', 'code-1')
      redirect.searchParams.set('state', url.searchParams.get('state') ?? '')
      return Response.redirect(redirect.toString(), 302)
    }
    case '/token': {
      const form = new URLSearchParams(await request.text())
      const refresh = form.get('grant_type') === 'refresh_token' && form.get('refresh_token')
      if (!refresh && (form.get('code') !== 'code-1' || !form.get('code_verifier'))) {
        return Response.json({ error: 'invalid_grant' }, { status: 400 })
      }
      return Response.json({
        access_token: ACCESS_TOKEN,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh-1'
      })
    }
    case '/mcp': {
      if (request.headers.get('authorization') !== `Bearer ${ACCESS_TOKEN}`) {
        return new Response(null, {
          status: 401,
          headers: {
            'WWW-Authenticate': `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource"`
          }
        })
      }
      const mcp = new McpServer({ name: 'tickets', version: '1.0.0' })
      mcp.registerTool(
        'open_tickets',
        {
          description: 'List open tickets',
          inputSchema: toStandardJSONSchema(v.object({}))
        },
        () => ({ content: [{ type: 'text', text: 'KAL-1 Hero section' }] })
      )
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      })
      await mcp.connect(transport)
      return transport.handleRequest(request)
    }
    default:
      return new Response(null, { status: 404 })
  }
}

/**
 * The desktop sign-in, played locally: a loopback server receives the redirect, and the
 * "browser" follows the authorization page's redirect to it.
 */
const localSignIn: SignInEnvironment = {
  async listen() {
    let settle: (value: unknown) => void = () => undefined
    const answer = new Promise((resolve) => {
      settle = resolve
    })
    const listener = Bun.serve({
      port: 0,
      fetch(request) {
        const params = new URL(request.url).searchParams
        settle({ code: params.get('code') ?? undefined, state: params.get('state') ?? undefined })
        return new Response('ok')
      }
    })
    return { port: listener.port ?? 0, answer: () => answer, stop: () => listener.stop(true) }
  },
  async openBrowser(url) {
    await fetch(url)
  },
  fetch: (input, init) => fetch(input, init)
}

beforeAll(() => {
  server = Bun.serve({ port: 0, fetch: handle })
  base = `http://127.0.0.1:${server.port}`
})

afterAll(async () => {
  await server.stop(true)
})

describe('signing in to an MCP server', () => {
  test('registers, signs in through the browser and calls tools with the token', async () => {
    const connection = {
      id: 'mcp-tickets',
      name: 'Tickets',
      enabled: true,
      transport: { type: 'streamable-http', url: `${base}/mcp` },
      authentication: { type: 'oauth', credentialRef: mcpCredentialRef('mcp-tickets', 'oauth') }
    } satisfies MCPConnection
    replaceMCPConnectionSettings({ version: 1, connections: [connection] })

    expect(await isSignedIn(connection)).toBe(false)
    await signInMCPConnection(connection, localSignIn)

    expect(await isSignedIn(connection)).toBe(true)
    expect(registered).toHaveLength(1)
    expect(await oauthAccessToken(connection)).toBe(ACCESS_TOKEN)

    const tools: Record<string, Tool> = {}
    const external = createExternalMCPTools()
    await external.sync(tools)
    const output = await tools['mcp__Tickets__open_tickets'].execute?.(
      {},
      { toolCallId: '1', messages: [], context: {} }
    )
    expect(output).toEqual({ text: 'KAL-1 Hero section' })
    await external.close()
    replaceMCPConnectionSettings({ version: 1, connections: [] })
  })
})
