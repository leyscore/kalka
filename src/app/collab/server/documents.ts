import { shallowRef } from 'vue'

import { joinRoom, roomForStore, shareDocument } from '@/app/collab/rooms'
import type { RoomSession } from '@/app/collab/session'
import { serverRoomJoiner } from '@/app/collab/transport/server'
import type { EditorStore } from '@/app/editor/active-store'

import { serverAccount, withServerSession } from './account'
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
  } finally {
    serverDocumentsLoading.value = false
  }
}

/** Joins a server room: each (re)connection asks the server for a fresh one-time ticket. */
export const serverTransport = serverRoomJoiner((roomId) =>
  withServerSession((url, token) => serverAPI.ticket(url, token, roomId))
)

/** Opens a server document in a tab of its own, or switches to the tab already showing it. */
export function openServerDocument(document: ServerDocument): RoomSession | null {
  markServerRoom(document.id)
  return joinRoom(document.id, { tabName: document.name, transport: serverTransport })
}

/** Puts a tab's document on the server: a new server document whose room it then shares. */
export async function shareToServer(store: EditorStore): Promise<RoomSession> {
  const existing = roomForStore(store)
  if (existing) return existing
  const name = store.state.documentName || 'Untitled'
  const document = await withServerSession((url, token) =>
    serverAPI.createDocument(url, token, name)
  )
  serverDocuments.value = [document, ...serverDocuments.value]
  markServerRoom(document.id)
  return shareDocument(store, document.id, serverTransport)
}

/** Saves the document as a Kalka file on the server, for export and backups. */
export async function saveServerFile(roomId: string, store: EditorStore): Promise<void> {
  const { writeKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  const archive = await writeKalkaArchive(store.graph)
  await withServerSession((url, token) => serverAPI.saveFile(url, token, roomId, archive))
}

/** Whether a room lives on the signed-in server rather than between peers. */
export function isServerRoom(roomId: string): boolean {
  return serverRoomIds.value.has(roomId)
}
