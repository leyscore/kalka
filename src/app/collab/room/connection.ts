import { deflateSync, Inflate } from 'fflate'
import * as decoding from 'lib0/decoding'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import { joinCollabRoom, type JoinCollabRoom } from '@/app/collab/transport'
import type { CollabAction } from '@/app/collab/transport/types'
import { MAX_COLLAB_MESSAGE_BYTES } from '@/constants'

export type CollabRoomOptions = {
  roomId: string
  ydoc: Y.Doc
  awareness: awarenessProtocol.Awareness
  updatePeersList: () => void
  joinRoom?: JoinCollabRoom
  /** The most a peer's update may decode to; `MAX_COLLAB_MESSAGE_BYTES` unless a test lowers it. */
  maxMessageBytes?: number
}

export type CollabRoomConnection = {
  room: ReturnType<JoinCollabRoom>
  sendYjsUpdate: (data: Uint8Array, peerId?: string) => void
  sendAwareness: (data: Uint8Array, peerId?: string) => void
  sendSyncStep1: (data: Uint8Array, peerId?: string) => void
  /** What agents preview while they stream, apart from presence (`app/collab/agent-preview.ts`). */
  agentPreview: CollabAction
  /** Follow peers leaving the room; returns the unsubscribe. */
  onPeerLeave: (handler: (peerId: string) => void) => () => void
}

/**
 * What a peer joining needs is the whole document, which repeats the same field names across
 * every layer, so the reply to its state vector travels compressed; Yjs's V2 encoding already
 * groups that repetition, and together they make a room's first sync about a twelfth the size.
 * Edits travel as V2 updates uncompressed: they are small, and arrive in a stream.
 */
function encodeSyncReply(ydoc: Y.Doc, stateVector: Uint8Array): Uint8Array {
  return deflateSync(Y.encodeStateAsUpdateV2(ydoc, stateVector))
}

/**
 * Compressed input is inflated this much at a time, so a reply stops within a step of passing
 * the limit: deflate expands at most about 1,032 times, so a step can overshoot by about 16 MB.
 */
const INFLATE_STEP = 16 * 1024

/** `data` inflated, or null once it would decode past `limit` bytes. */
function inflateWithin(data: Uint8Array, limit: number): Uint8Array | null {
  const chunks: Uint8Array[] = []
  let size = 0
  const inflate = new Inflate((chunk) => {
    size += chunk.length
    if (size <= limit) chunks.push(chunk)
  })
  for (let offset = 0; offset < data.length; offset += INFLATE_STEP) {
    inflate.push(data.subarray(offset, offset + INFLATE_STEP), offset + INFLATE_STEP >= data.length)
    if (size > limit) return null
  }
  const inflated = new Uint8Array(size)
  let at = 0
  for (const chunk of chunks) {
    inflated.set(chunk, at)
    at += chunk.length
  }
  return inflated
}

/**
 * Applies what a peer sent, inflated first when `compressed`, as a sync reply is. An update past
 * `limit` is dropped with a warning; data that does not inflate or decode came from a build that
 * does not share this room's format, or from a broken peer, and is dropped rather than thrown
 * from the transport's handler. Returns whether it applied.
 */
function applyRemote(
  ydoc: Y.Doc,
  data: Uint8Array,
  { limit, peerId, compressed = false }: { limit: number; peerId: string; compressed?: boolean }
): boolean {
  try {
    let update: Uint8Array | null = null
    if (compressed) update = inflateWithin(data, limit)
    else if (data.length <= limit) update = data
    if (!update) {
      console.warn(`[Collab] Dropped an update from peer ${peerId} past ${limit} bytes`)
      return false
    }
    Y.applyUpdateV2(ydoc, update, 'remote')
    return true
  } catch {
    return false
  }
}

function awarenessClientIds(data: Uint8Array): number[] {
  try {
    const decoder = decoding.createDecoder(data)
    const count = decoding.readVarUint(decoder)
    const clients: number[] = []
    for (let index = 0; index < count; index++) {
      clients.push(decoding.readVarUint(decoder))
      decoding.readVarUint(decoder)
      decoding.readVarString(decoder)
    }
    return clients
  } catch {
    return []
  }
}

export function connectCollabRoom({
  roomId,
  ydoc,
  awareness,
  updatePeersList,
  joinRoom = joinCollabRoom,
  maxMessageBytes = MAX_COLLAB_MESSAGE_BYTES
}: CollabRoomOptions): CollabRoomConnection {
  const room = joinRoom(roomId)
  const [sendYjsUpdate, getUpdate] = room.makeAction('yjs-update')
  const [sendAwareness, getAwareness] = room.makeAction('awareness')
  const [sendSyncStep1, getSyncStep1] = room.makeAction('sync-step1')
  const [sendSyncReply, getSyncReply] = room.makeAction('sync-reply')
  const agentPreview = room.makeAction('agent-preview')
  // A transport keeps one leave handler, so the connection shares it with its users.
  const leaveHandlers = new Set<(peerId: string) => void>()

  const awarenessClientsByPeer = new Map<string, Set<number>>()

  getUpdate((data, peerId) => {
    applyRemote(ydoc, data, { limit: maxMessageBytes, peerId })
  })

  getAwareness((data, peerId) => {
    awarenessClientsByPeer.set(peerId, new Set(awarenessClientIds(data)))
    awarenessProtocol.applyAwarenessUpdate(awareness, data, 'remote')
  })

  getSyncStep1((stateVector, peerId) => {
    sendSyncReply(encodeSyncReply(ydoc, stateVector), peerId)
  })

  getSyncReply((data, peerId) => {
    applyRemote(ydoc, data, { limit: maxMessageBytes, peerId, compressed: true })
  })

  ydoc.on('updateV2', (update: Uint8Array, origin: unknown) => {
    if (origin === 'remote') return
    sendYjsUpdate(update)
  })

  awareness.on(
    'update',
    (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => {
      if (origin === 'remote' || origin === 'peer-left') return
      const changedClients = [...added, ...updated, ...removed]
      const encodedUpdate = awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      sendAwareness(encodedUpdate)
    }
  )

  room.onPeerJoin((peerId) => {
    sendSyncStep1(Y.encodeStateVector(ydoc), peerId)
    sendAwareness(awarenessProtocol.encodeAwarenessUpdate(awareness, [awareness.clientID]), peerId)
  })

  room.onPeerLeave((peerId) => {
    const remoteClients = [...(awarenessClientsByPeer.get(peerId) ?? [])]
    awarenessClientsByPeer.delete(peerId)
    awarenessProtocol.removeAwarenessStates(awareness, remoteClients, 'peer-left')
    updatePeersList()
    for (const handler of leaveHandlers) handler(peerId)
  })

  return {
    room,
    sendYjsUpdate,
    sendAwareness,
    sendSyncStep1,
    agentPreview,
    onPeerLeave(handler) {
      leaveHandlers.add(handler)
      return () => leaveHandlers.delete(handler)
    }
  }
}
