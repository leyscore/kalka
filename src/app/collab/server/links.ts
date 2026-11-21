import { shallowRef } from 'vue'

import { bindPendingLinks } from '@/app/tauri/pending-links'

import { normalizeServerURL } from './api'

/** Desktop events and commands for `kalka://server?url=…` links (`electron/src/handlers/pending.ts`). */
const SERVER_LINKS_EVENT = 'open-server-links'
const TAKE_PENDING_SERVERS = 'take_pending_servers'
/** The web editor's twin of the desktop link: `?kalka-server=<address>`. */
const WEB_PARAM = 'kalka-server'

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
export function bindDesktopServerLinks(open: (url: string) => void): Promise<() => void> {
  return bindPendingLinks(
    { event: SERVER_LINKS_EVENT, command: TAKE_PENDING_SERVERS, label: 'Server link' },
    open
  )
}
