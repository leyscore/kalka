// Kalka Cloud opens the web editor with a launch link:
// https://edit.kalka.design/#kalka-server=<server url>&code=<one-time code>&open=<document id|new>
// The fragment never reaches a server log. The editor signs in to that server with the code,
// then opens the document, or creates a new one there. Only servers this app trusts by
// address may sign it in, so a link from elsewhere cannot point it at someone else's server.
import { isRoomId } from '@/app/collab/room/id'

import { describeServer, signInWithCode } from './account'
import { normalizeServerURL, type ServerDocument } from './api'
import { refreshServerDocuments, serverDocuments } from './documents'

/** Origins of the hosted Kalka servers whose launch links sign the editor in. */
export const TRUSTED_SERVER_ORIGINS: readonly string[] = ['https://app.kalka.design']

/** Development builds also trust a Kalka Cloud running on this machine. */
const TRUST_LOCALHOST = import.meta.env.MODE !== 'production'

export interface ServerLaunch {
  url: string
  code: string
  /** A document id, or 'new' to create one; null opens nothing. */
  open: string | null
}

export function isTrustedServer(url: string, ownOrigin: string): boolean {
  try {
    const origin = new URL(url).origin
    if (TRUST_LOCALHOST && /^http:\/\/localhost:\d+$/.test(origin)) return true
    return origin === ownOrigin || TRUSTED_SERVER_ORIGINS.includes(origin)
  } catch {
    return false
  }
}

/** Pure parser over a `location.hash`; null when it is not a launch link or not trusted. */
export function parseServerLaunch(hash: string, ownOrigin: string): ServerLaunch | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const server = params.get('kalka-server')
  const code = params.get('code')
  if (!server || !code || !/^[a-f0-9]{64}$/.test(code)) return null
  const url = normalizeServerURL(server)
  if (!url || (!url.startsWith('https://') && !url.startsWith('http://localhost'))) return null
  if (!isTrustedServer(url, ownOrigin)) {
    console.warn('[Server launch] refused a server this app does not trust:', new URL(url).origin)
    return null
  }
  const open = params.get('open')
  return { url, code, open: open === 'new' || (open && isRoomId(open)) ? open : null }
}

export interface ServerLaunchActions {
  openDocument: (document: ServerDocument) => void
  createDocument: () => Promise<void>
  notify: (message: string, level: 'info' | 'error') => void
}

/** Signs in from the launch link in `hash`, strips it from the address, then opens or creates. */
export async function launchFromServerLink(
  hash: string,
  ownOrigin: string,
  strip: () => void,
  actions: ServerLaunchActions
): Promise<boolean> {
  if (!hash.includes('kalka-server=')) return false
  const launch = parseServerLaunch(hash, ownOrigin)
  // The code works once: drop it from the address whatever happens next.
  strip()
  if (!launch) return false
  try {
    const { info } = await describeServer(launch.url)
    await signInWithCode(launch.url, info, launch.code)
    await refreshServerDocuments()
    if (launch.open === 'new') {
      await actions.createDocument()
    } else if (launch.open) {
      const document = serverDocuments.value.find((item) => item.id === launch.open)
      if (document) actions.openDocument(document)
      else actions.notify('This file is no longer on the server.', 'error')
    }
    return true
  } catch (error) {
    console.error('[Server launch]', error)
    actions.notify(
      'Signing in to Kalka Cloud did not work. Open the editor again from your workspace.',
      'error'
    )
    return false
  }
}
