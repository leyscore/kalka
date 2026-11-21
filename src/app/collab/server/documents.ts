import { shallowRef } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'
import { panelMessages } from '@kalka/vue'

import { joinRoom, roomForStore, shareDocument } from '@/app/collab/rooms'
import type { RoomSession } from '@/app/collab/session'
import { serverRoomJoiner } from '@/app/collab/transport/server'
import type { EditorStore } from '@/app/editor/active-store'
import { rememberRecentServerDocument } from '@/app/recent-files'
import { addressPath, documentSlug } from '@/app/shell/address/path'
import { IS_BROWSER, IS_TAURI } from '@/constants'

import { refreshServerAccount, serverAccount, updateServerUser, withServerSession } from './account'
import { serverAPI, type ServerDocument } from './api'

/** Rooms this app opened through the server, so the room panel can say where they live. */
export const serverRoomIds = shallowRef<ReadonlySet<string>>(new Set())

function markServerRoom(roomId: string) {
  if (serverRoomIds.value.has(roomId)) return
  serverRoomIds.value = new Set([...serverRoomIds.value, roomId])
}

/** Documents on the signed-in server, as last listed. */
export const serverDocuments = shallowRef<readonly ServerDocument[]>([])
export const serverDocumentsLoading = shallowRef(false)

export async function refreshServerDocuments(): Promise<void> {
  if (!serverAccount.value) {
    serverDocuments.value = []
    return
  }
  serverDocumentsLoading.value = true
  try {
    serverDocuments.value = await withServerSession((url, token) => serverAPI.documents(url, token))
    // The role may have changed since signing in; the list is a natural time to look again.
    await refreshServerAccount().catch(() => undefined)
  } finally {
    serverDocumentsLoading.value = false
  }
}

/** Joins a server room: each (re)connection asks the server for a fresh one-time ticket. */
export const serverTransport = serverRoomJoiner(async (roomId) => {
  const ticket = await withServerSession((url, token) => serverAPI.ticket(url, token, roomId))
  // The ticket carries the role the server gives now, which the stored account may predate.
  const user = serverAccount.value?.user
  if (user && user.role !== ticket.role) updateServerUser({ ...user, role: ticket.role })
  return ticket
})

/** Opens a server document in a tab of its own, or switches to the tab already showing it. */
export function openServerDocument(
  document: Pick<ServerDocument, 'id' | 'name'>
): RoomSession | null {
  markServerRoom(document.id)
  const account = serverAccount.value
  if (account) rememberRecentServerDocument(account.url, document.id, document.name)
  return joinRoom(document.id, { tabName: document.name, transport: serverTransport })
}

/** The server a `/design` link named, by document, for someone who must sign in to open it. */
export const linkedServers = shallowRef<ReadonlyMap<string, string>>(new Map())

/**
 * Opens a server document from its address, before the server's list has loaded. Someone not
 * signed in gets the tab too, at the same address, which asks them to sign in to `server` (the
 * one the link named) and opens the file once they have. Null when the id is not a room's.
 * The tab shows `fallbackName` until the document brings its own name.
 */
export function openServerDocumentById(
  id: string,
  fallbackName: string,
  server: string | null = null
): RoomSession | null {
  if (server) linkedServers.value = new Map([...linkedServers.value, [id, server]])
  const known = serverDocuments.value.find((document) => document.id === id)
  const session = openServerDocument({ id, name: known?.name ?? fallbackName })
  // The server's name wins over the one guessed from the address, which a new document takes.
  if (session && !known && serverAccount.value) {
    withServerSession((url, token) => serverAPI.document(url, token, id))
      .then((document) => {
        serverDocuments.value = [
          document,
          ...serverDocuments.value.filter((other) => other.id !== document.id)
        ]
        session.store.state.documentName = document.name
        return undefined
      })
      .catch(() => undefined)
  }
  return session
}

/** Puts a tab's document on the server: a new server document whose room it then shares. */
export async function shareToServer(store: EditorStore): Promise<RoomSession> {
  const existing = roomForStore(store)
  if (existing) return existing
  const name = store.state.documentName || panelMessages.get().untitled
  const document = await withServerSession((url, token) =>
    serverAPI.createDocument(url, token, name)
  )
  serverDocuments.value = [document, ...serverDocuments.value]
  markServerRoom(document.id)
  return shareDocument(store, document.id, serverTransport)
}

/** Gives a server document a new name, on the server and in the list of its files. */
export async function renameServerDocument(roomId: string, name: string): Promise<void> {
  if (serverDocuments.value.some((document) => document.id === roomId && document.name === name)) {
    return
  }
  const renamed = await withServerSession((url, token) =>
    serverAPI.renameDocument(url, token, roomId, name)
  )
  serverDocuments.value = serverDocuments.value.map((document) =>
    document.id === renamed.id ? renamed : document
  )
}

/** Saves the document as a Kalka file on the server, for export and backups. */
export async function saveServerFile(roomId: string, store: EditorStore): Promise<void> {
  const { writeKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  const archive = await writeKalkaArchive(store.graph)
  await withServerSession((url, token) => serverAPI.saveFile(url, token, roomId, archive))
}

/**
 * Takes the version waiting for a server document: reads it, then dismisses it, and returns it
 * only when this window's dismissal went through, so one window applies each version. A file
 * Kalka cannot read is dismissed too, so it does not wait forever. Null when there is nothing
 * to apply.
 */
export async function takePendingVersion(roomId: string): Promise<SceneGraph | null> {
  const pending = await withServerSession((url, token) => serverAPI.pending(url, token, roomId))
  if (!pending) return null
  const { readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  let graph: SceneGraph | null = null
  try {
    graph = readKalkaArchive(pending.data)
  } catch (error) {
    console.warn('[Kalka server] Dismissed an uploaded version Kalka cannot read', error)
  }
  const { dismissed } = await withServerSession((url, token) =>
    serverAPI.dismissPending(url, token, roomId, pending.version)
  )
  return dismissed ? graph : null
}

/**
 * The address of a server document in this web editor, to send to a teammate; null in the
 * desktop app, whose own addresses mean nothing elsewhere.
 */
export function serverDocumentLink(roomId: string, name: string): string | null {
  if (IS_TAURI || !IS_BROWSER) return null
  const path = addressPath({ kind: 'design', id: roomId, slug: documentSlug(name) })
  // The link names its server, so a teammate who is not signed in knows where to sign in.
  const server = serverAccount.value?.url
  const query = server ? `?server=${encodeURIComponent(server)}` : ''
  return `${window.location.origin}${path}${query}`
}

/** Whether a room lives on the signed-in server rather than between peers. */
export function isServerRoom(roomId: string): boolean {
  return serverRoomIds.value.has(roomId)
}
