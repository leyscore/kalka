import { randomUUID } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { app } from 'electron'

import { registerAll, type CallContext } from '../ipc'

/** How long a sign-in waits in the browser before it gives up. */
const SIGN_IN_TIMEOUT_MS = 5 * 60_000

export interface OAuthCallback {
  code?: string
  state?: string
  iss?: string
  error?: string
}

interface PendingSignIn {
  server: Server
  callback: Promise<OAuthCallback>
}

const pending = new Map<string, PendingSignIn>()

const PAGE_TEXT = {
  fr: {
    success: ['Connexion réussie', 'Vous pouvez fermer cet onglet et revenir dans Kalka.'],
    failure: ['Connexion interrompue', 'Revenez dans Kalka pour réessayer.']
  },
  en: {
    success: ['Signed in', 'You can close this tab and go back to Kalka.'],
    failure: ['Sign-in stopped', 'Go back to Kalka to try again.']
  }
} as const

function page(success: boolean): string {
  const text = PAGE_TEXT[app.getLocale().startsWith('fr') ? 'fr' : 'en']
  const [title, body] = success ? text.success : text.failure
  return `<!doctype html><meta charset="utf-8"><title>Kalka</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;font:15px/1.5 system-ui,sans-serif;background:#efefec;color:#121214"><main style="text-align:center"><div style="width:44px;height:44px;margin:0 auto 18px;border-radius:12px;background:#2f5bea"></div><h1 style="font-size:20px;margin:0 0 6px">${title}</h1><p style="margin:0;color:#5c5c66">${body}</p></main>`
}

/**
 * OAuth sign-in for MCP servers, as RFC 8252 asks of native apps: a loopback server on a free
 * port receives the browser's redirect, answers with a page saying to go back to Kalka, and
 * hands the code to the page that started the sign-in. It accepts one redirect and closes.
 */
export const oauthHandlers = {
  async loopbackStart(): Promise<{ id: string; port: number }> {
    const id = randomUUID()
    let settle: (callback: OAuthCallback) => void = () => undefined
    const callback = new Promise<OAuthCallback>((resolve) => {
      settle = resolve
    })
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      if (url.pathname !== '/callback') {
        response.writeHead(404).end()
        return
      }
      const result: OAuthCallback = {
        code: url.searchParams.get('code') ?? undefined,
        state: url.searchParams.get('state') ?? undefined,
        iss: url.searchParams.get('iss') ?? undefined,
        error: url.searchParams.get('error') ?? undefined
      }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      response.end(page(Boolean(result.code)))
      settle(result)
    })
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve)
    })
    const timeout = setTimeout(() => settle({ error: 'timeout' }), SIGN_IN_TIMEOUT_MS)
    void callback.finally(() => {
      clearTimeout(timeout)
      server.close()
    })
    pending.set(id, { server, callback })
    return { id, port: (server.address() as AddressInfo).port }
  },
  async loopbackWait(_context: CallContext, id: string): Promise<OAuthCallback> {
    const signIn = pending.get(id)
    if (!signIn) throw new Error('No sign-in is waiting')
    try {
      return await signIn.callback
    } finally {
      pending.delete(id)
    }
  },
  loopbackCancel(_context: CallContext, id: string): void {
    pending.get(id)?.server.close()
    pending.delete(id)
  }
}

export function registerOAuthHandlers(): void {
  registerAll(oauthHandlers, 'oauth')
}
