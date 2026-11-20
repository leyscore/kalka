import * as v from 'valibot'
import { shallowRef } from 'vue'

import { isTauri } from '@/app/tauri/env'

import { normalizeServerURL } from './api'

/** Desktop events and commands for `kalka://server?url=…` links (`electron/src/handlers/pending.ts`). */
const SERVER_LINKS_EVENT = 'open-server-links'
const TAKE_PENDING_SERVERS = 'take_pending_servers'
/** The web editor's twin of the desktop link: `?kalka-server=<address>`. */
const WEB_PARAM = 'kalka-server'

const pendingServersSchema = v.array(v.string())

/**
 * A server address a link asked to connect to, waiting for Settings › Server to fill it in.
 * Only the address travels: signing in stays the person's own step.
 */
export const linkedServerURL = shallowRef<string | null>(null)

/** The link that opens Kalka on Settings › Server with this address filled in. */
export function serverLinkURL(serverURL: string): string {
  return `kalka://server?url=${encodeURIComponent(serverURL)}`
}

/** Hands a linked address to Settings › Server, or ignores it when it is not one. */
export function offerLinkedServer(input: string, open: () => void): boolean {
  const url = normalizeServerURL(input)
  if (!url) return false
  linkedServerURL.value = url
  open()
  return true
}

/** Takes `?kalka-server=` off the web editor's address, so a reload does not ask again. */
export function takeWebServerLink(): string | null {
  const params = new URLSearchParams(window.location.search)
  const value = params.get(WEB_PARAM)
  if (!value) return null
  params.delete(WEB_PARAM)
  const query = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  )
  return value
}

/** Opens the server links the desktop app received, at startup and while running. */
export async function bindDesktopServerLinks(open: (url: string) => void): Promise<() => void> {
  if (!isTauri()) return () => undefined
  const [{ invoke }, { listen }] = await Promise.all([
    import('@tauri-apps/api/core'),
    import('@tauri-apps/api/event')
  ])
  async function drain() {
    const servers = v.parse(pendingServersSchema, await invoke<unknown>(TAKE_PENDING_SERVERS))
    for (const url of servers) open(url)
  }
  const stop = await listen(SERVER_LINKS_EVENT, () => {
    void drain().catch((error: unknown) => console.error('[Server link]', error))
  })
  await drain()
  return stop
}
