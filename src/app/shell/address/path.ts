import { isRoomId } from '@/app/collab/room/id'

/**
 * Where a tab lives in the address bar. A server document has its own address, like
 * `/design/<id>/<name>`, so the address can be shared and a reload reopens it; a peer-to-peer
 * room keeps its `/share/<id>` link; Home and documents without an address sit at `/`.
 */
export type DocumentAddress =
  | { kind: 'home' }
  | { kind: 'design'; id: string; slug: string }
  | { kind: 'share'; id: string }

/** What the address needs to know about the active tab. */
export interface TabAddressSource {
  isHome: boolean
  name: string
  room: { roomId: string; onServer: boolean } | null
}

const MAX_SLUG_LENGTH = 60
const UNTITLED_SLUG = 'untitled'

/** The document's name as it reads in an address: lower case, plain letters and dashes. */
export function documentSlug(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, '')
  return slug || UNTITLED_SLUG
}

export function tabAddress(tab: TabAddressSource): DocumentAddress {
  if (tab.isHome || !tab.room) return { kind: 'home' }
  if (tab.room.onServer) {
    return { kind: 'design', id: tab.room.roomId, slug: documentSlug(tab.name) }
  }
  return { kind: 'share', id: tab.room.roomId }
}

export function addressPath(address: DocumentAddress): string {
  if (address.kind === 'design') return `/design/${address.id}/${address.slug}`
  if (address.kind === 'share') return `/share/${address.id}`
  return '/'
}

/** The address a route path names, or null for a path that is not a document address. */
export function parseAddressPath(path: string): DocumentAddress | null {
  if (path === '/') return { kind: 'home' }
  const design = /^\/design\/([^/]+)(?:\/([^/]*))?\/?$/.exec(path)
  if (design?.[1]) {
    const id = design[1]
    return isRoomId(id) ? { kind: 'design', id, slug: design[2] || UNTITLED_SLUG } : null
  }
  const share = /^\/share\/([^/]+)\/?$/.exec(path)
  if (share?.[1]) return isRoomId(share[1]) ? { kind: 'share', id: share[1] } : null
  return null
}

/** Whether two addresses name the same document, whatever name the address carries. */
export function sameDocument(first: DocumentAddress | null, second: DocumentAddress): boolean {
  if (!first || first.kind !== second.kind) return false
  if (first.kind === 'home' || second.kind === 'home') return true
  return first.id === second.id
}
