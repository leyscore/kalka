import { realpath, stat } from 'node:fs/promises'

import type { WebContents } from 'electron'

import { emit } from '../ipc'

/** The URL scheme of desktop links: kalka://open, kalka://join, kalka://oauth. */
export const LINK_SCHEME = 'kalka'

interface PendingOpenFile {
  path: string
  node?: string
  deepLink: boolean
}

let pendingOpen: PendingOpenFile[] = []
let pendingRooms: string[] = []
let target: () => WebContents | null = () => null

export function setOpenTarget(resolve: () => WebContents | null): void {
  target = resolve
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

/** A design file the app opens: existing, and a `.fig` or `.pen`. */
async function designFile(path: string): Promise<string | null> {
  try {
    const resolved = await realpath(path)
    return (await stat(resolved)).isFile() && /\.(fig|pen)$/i.test(resolved) ? resolved : null
  } catch {
    return null
  }
}

/** Files from the command line, a second launch or the Finder; the editor takes them. */
export async function queueOpenPaths(
  paths: string[],
  contents: WebContents | null = null
): Promise<void> {
  const files = (await Promise.all(paths.map(designFile))).filter(
    (path): path is string => path !== null
  )
  if (files.length === 0) return
  pendingOpen.push(...files.map((path) => ({ path, deepLink: false })))
  const receiver = contents ?? target()
  if (receiver) emit(receiver, 'open-associated-files')
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
  const receiver = target()
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
    if (receiver) emit(receiver, 'open-associated-files')
  } else if (link.hostname === 'join') {
    const room = link.searchParams.get('room')
    if (!room || !/^[a-z0-9]{32}$/.test(room)) return
    pendingRooms.push(room)
    if (receiver) emit(receiver, 'open-room-links')
  } else if (link.hostname === 'oauth') {
    const provider = link.pathname.replace(/^\//, '')
    if (!/^[a-z]+$/.test(provider) || !receiver) return
    emit(receiver, 'oauth-callback', { provider, query: link.search })
  }
}
