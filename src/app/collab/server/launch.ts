// Kalka Cloud opens the web editor with a launch link:
// https://app.kalka.design/#kalka-server=<server url>&code=<one-time code>&open=<document id|new>
// A new file can start with a frame (&frame=1440x900&name=Desktop) or a request to the AI agent
// (&prompt=<text>).
// The fragment never reaches a server log. The editor signs in to that server with the code,
// then opens the document, or creates a new one there. Only servers this app trusts by
// address may sign it in, so a link from elsewhere cannot point it at someone else's server.
import { panelMessages } from '@kalka/vue'

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
  /** What a new file starts with. */
  start: ServerLaunchStart
}

export interface ServerLaunchStart {
  frame?: { name: string; width: number; height: number }
  prompt?: string
}

/** The largest frame a launch link may ask for, in CSS pixels. */
const MAX_FRAME_SIDE = 10_000
/** A request to the agent longer than this is cut. */
const MAX_PROMPT_LENGTH = 4000

function parseStart(params: URLSearchParams): ServerLaunchStart {
  const start: ServerLaunchStart = {}
  const size = /^(\d{1,5})x(\d{1,5})$/.exec(params.get('frame') ?? '')
  if (size) {
    const width = Number(size[1])
    const height = Number(size[2])
    if (width >= 1 && height >= 1 && width <= MAX_FRAME_SIDE && height <= MAX_FRAME_SIDE) {
      const name = (params.get('name') ?? '').trim().slice(0, 60) || panelMessages.get().frame
      start.frame = { name, width, height }
    }
  }
  const prompt = (params.get('prompt') ?? '').trim()
  if (prompt) start.prompt = prompt.slice(0, MAX_PROMPT_LENGTH)
  return start
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
  const target = open === 'new' || (open && isRoomId(open)) ? open : null
  return { url, code, open: target, start: target === 'new' ? parseStart(params) : {} }
}

/** Why a launch link did not open its file: signing in failed, or the file is gone. */
export type ServerLaunchFailure = 'sign-in' | 'missing'

export interface ServerLaunchActions {
  openDocument: (document: ServerDocument) => void
  createDocument: (start: ServerLaunchStart) => Promise<void>
  /** The launch is under way, until the returned function is called. */
  started: () => () => void
  failed: (failure: ServerLaunchFailure, serverURL: string) => void
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
  const done = actions.started()
  try {
    const { info } = await describeServer(launch.url)
    await signInWithCode(launch.url, info, launch.code)
    await refreshServerDocuments()
    if (launch.open === 'new') {
      await actions.createDocument(launch.start)
    } else if (launch.open) {
      const document = serverDocuments.value.find((item) => item.id === launch.open)
      if (document) actions.openDocument(document)
      else actions.failed('missing', launch.url)
    }
    return true
  } catch (error) {
    console.error('[Server launch]', error)
    actions.failed('sign-in', launch.url)
    return false
  } finally {
    done()
  }
}
