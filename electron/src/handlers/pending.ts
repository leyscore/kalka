import { realpath, stat } from 'node:fs/promises'
import { join } from 'node:path'

/** The URL scheme of desktop links: kalka://open, kalka://join, kalka://oauth. */
export const LINK_SCHEME = 'kalka'

interface PendingOpenFile {
  path: string
  node?: string
  deepLink: boolean
}

let pendingOpen: PendingOpenFile[] = []
let pendingRooms: string[] = []
/** Where documents and links handed to the app go. */
export interface OpenTarget {
  /** Tells the editor window that something waits for it; false when no editor is open. */
  notify(event: string, payload?: unknown): boolean
  /** Opens an editor window, which takes what waits for it as it starts. */
  openEditor(): void
}

let target: OpenTarget | null = null

export function setOpenTarget(next: OpenTarget): void {
  target = next
}

/**
 * Tells the editor something waits for it. With no editor open, as on macOS once the last
 * window closed, one opens: a file from the Finder or a link must not wait unseen.
 */
function deliver(event: string, payload?: unknown): void {
  if (!target) return
  if (!target.notify(event, payload)) target.openEditor()
}

/** Opens an editor window when none is open, such as for a menu command on macOS. */
export function openEditor(): void {
  target?.openEditor()
}

export function takePendingOpen(): PendingOpenFile[] {
  const taken = pendingOpen
  pendingOpen = []
  return taken
}

export function takePendingRooms(): string[] {
  const taken = pendingRooms
  pendingRooms = []
  return taken
}

/** A document the app opens: an existing `.fig`, `.pen` or `.kalka` file, or a Kalka folder. */
async function designFile(path: string): Promise<string | null> {
  try {
    const resolved = await realpath(path)
    const entry = await stat(resolved)
    if (entry.isFile()) return /\.(fig|pen|kalka)$/i.test(resolved) ? resolved : null
    return entry.isDirectory() && (await stat(join(resolved, 'project.json'))).isFile()
      ? resolved
      : null
  } catch {
    return null
  }
}

/** Files from the command line, a second launch or the Finder; the editor takes them. */
export async function queueOpenPaths(paths: string[]): Promise<void> {
  const files = (await Promise.all(paths.map(designFile))).filter(
    (path): path is string => path !== null
  )
  if (files.length === 0) return
  pendingOpen.push(...files.map((path) => ({ path, deepLink: false })))
  deliver('open-associated-files')
}

/** `kalka://open?file=…&node=…`, `kalka://join?room=…`, `kalka://oauth/<provider>?…`. */
export function handleLink(url: string): void {
  let link: URL
  try {
    link = new URL(url)
  } catch {
    return
  }
  if (link.protocol !== `${LINK_SCHEME}:`) return
  if (link.hostname === 'open') {
    const file = link.searchParams.get('file')
    if (
      !file ||
      !/\.(fig|pen)$/i.test(file) ||
      file.startsWith('/') ||
      file.split(/[\\/]/).includes('..')
    )
      return
    pendingOpen.push({
      path: file,
      node: link.searchParams.get('node') ?? undefined,
      deepLink: true
    })
    deliver('open-associated-files')
  } else if (link.hostname === 'join') {
    const room = link.searchParams.get('room')
    if (!room || !/^[a-z0-9]{32}$/.test(room)) return
    pendingRooms.push(room)
    deliver('open-room-links')
  } else if (link.hostname === 'oauth') {
    const provider = link.pathname.replace(/^\//, '')
    // A sign-in answers the editor that asked for it; with none open, there is nobody to answer.
    if (!/^[a-z]+$/.test(provider)) return
    target?.notify('oauth-callback', { provider, query: link.search })
  }
}
