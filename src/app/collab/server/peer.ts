import { useDebounceFn } from '@vueuse/core'
import { deflateSync, inflateSync } from 'fflate'
import * as Y from 'yjs'

import type { ServerRoomTransport } from '@/app/collab/transport/server'
import {
  concatBytes,
  decodeU32,
  encodeU32,
  LOAD_DONE,
  LOAD_SNAPSHOT_PART,
  LOAD_UPDATE,
  SERVER_COMPACT,
  SERVER_LOAD,
  SERVER_PEER,
  SERVER_SNAPSHOT
} from '@/app/collab/transport/server-protocol'

/** How long after the last edit Kalka saves the document's Kalka file on the server. */
const FILE_SAVE_DELAY_MS = 30_000

export interface ServerPeerOptions {
  room: ServerRoomTransport
  ydoc: Y.Doc
  /** Sends an update to everyone in the room, which the server also stores. */
  sendYjsUpdate: (update: Uint8Array) => void
  /** Saves the document as a Kalka file on the server, for export and WebDAV. */
  saveFile: () => Promise<void>
}

/**
 * The server's side of the room, seen from Kalka. The server stores the document but never
 * decodes it, so Kalka does the Yjs work: it applies what the server kept, sends back what the
 * server is missing, and answers the server's requests for a fresh snapshot.
 */
export function bindServerPeer({ room, ydoc, sendYjsUpdate, saveFile }: ServerPeerOptions) {
  const [, onLoad] = room.makeAction(SERVER_LOAD)
  const [, onCompact] = room.makeAction(SERVER_COMPACT)
  const [sendSnapshot] = room.makeAction(SERVER_SNAPSHOT)
  let snapshotParts: Uint8Array[] = []
  let updates: Uint8Array[] = []
  let disposed = false

  const canEdit = () => room.role() !== 'viewer'

  const saveSoon = useDebounceFn(() => {
    if (disposed || !canEdit()) return
    saveFile().catch((error: unknown) =>
      console.warn('[Kalka server] Could not save the file', error)
    )
  }, FILE_SAVE_DELAY_MS)

  onLoad((data, peerId) => {
    if (peerId !== SERVER_PEER || data.length === 0) return
    const kind = data[0]
    const body = data.subarray(1)
    if (kind === LOAD_SNAPSHOT_PART) snapshotParts.push(body)
    else if (kind === LOAD_UPDATE) updates.push(body)
    else if (kind === LOAD_DONE) {
      const stored = [
        ...(snapshotParts.length ? [inflateSync(concatBytes(snapshotParts))] : []),
        ...updates
      ]
      snapshotParts = []
      updates = []
      for (const update of stored) {
        try {
          Y.applyUpdateV2(ydoc, update, 'remote')
        } catch (error) {
          console.warn('[Kalka server] Skipped a stored update Kalka cannot read', error)
        }
      }
      if (!canEdit()) return
      // What this device has and the server does not, from edits made offline.
      const serverState = stored.length
        ? Y.encodeStateVectorFromUpdateV2(Y.mergeUpdatesV2(stored))
        : new Uint8Array([0])
      const missing = Y.encodeStateAsUpdateV2(ydoc, serverState)
      if (hasContent(missing)) sendYjsUpdate(missing)
    }
  })

  onCompact((data, peerId) => {
    const seq = decodeU32(data)
    if (peerId !== SERVER_PEER || seq === null || !canEdit()) return
    sendSnapshot(encodeU32(seq, deflateSync(Y.encodeStateAsUpdateV2(ydoc))), SERVER_PEER)
    void saveSoon()
  })

  const onUpdate = (_update: Uint8Array, origin: unknown) => {
    if (origin !== 'remote') void saveSoon()
  }
  ydoc.on('updateV2', onUpdate)

  return () => {
    disposed = true
    ydoc.off('updateV2', onUpdate)
  }
}

const EMPTY_UPDATE_BYTES = Y.encodeStateAsUpdateV2(new Y.Doc()).length

/** Whether a Yjs V2 update carries anything; an empty one still has a few header bytes. */
function hasContent(update: Uint8Array): boolean {
  return update.length > EMPTY_UPDATE_BYTES
}
