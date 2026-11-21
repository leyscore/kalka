import { useEventListener } from '@vueuse/core'
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
  SERVER_PENDING,
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
  /** The server has sent what it keeps of the document, on each (re)connection. */
  onLoaded?: () => void
  /** A version uploaded outside Kalka (WebDAV, a restore) waits to be applied, by its id. */
  onPending?: (version: string) => void
}

const decoder = new TextDecoder()

/**
 * The server's side of the room, seen from Kalka. The server stores the document but never
 * decodes it, so Kalka does the Yjs work: it applies what the server kept, sends back what the
 * server is missing, and answers the server's requests for a fresh snapshot.
 */
export function bindServerPeer({
  room,
  ydoc,
  sendYjsUpdate,
  saveFile,
  onLoaded,
  onPending
}: ServerPeerOptions) {
  const [, onLoad] = room.makeAction(SERVER_LOAD)
  const [, onCompact] = room.makeAction(SERVER_COMPACT)
  const [sendSnapshot] = room.makeAction(SERVER_SNAPSHOT)
  const [, onPendingVersion] = room.makeAction(SERVER_PENDING)
  let snapshotParts: Uint8Array[] = []
  let updates: Uint8Array[] = []
  let disposed = false
  let saveTimer: ReturnType<typeof setTimeout> | undefined

  const canEdit = () => room.role() !== 'viewer'

  function saveNow() {
    clearTimeout(saveTimer)
    saveTimer = undefined
    if (!canEdit()) return
    saveFile().catch((error: unknown) =>
      console.warn('[Kalka server] Could not save the file', error)
    )
  }

  function saveSoon() {
    if (disposed) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(saveNow, FILE_SAVE_DELAY_MS)
  }

  // A save still waiting goes out when the window is hidden or closed, not 30 seconds later.
  const stopHidden =
    typeof document === 'undefined'
      ? () => undefined
      : useEventListener(document, 'visibilitychange', () => {
          if (document.visibilityState === 'hidden' && saveTimer !== undefined) saveNow()
        })

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
      const readable = stored.filter((update) => {
        try {
          Y.applyUpdateV2(ydoc, update, 'remote')
          return true
        } catch (error) {
          console.warn('[Kalka server] Skipped a stored update Kalka cannot read', error)
          return false
        }
      })
      if (canEdit()) {
        // What this device has and the server does not, from edits made offline.
        const serverState = readable.length
          ? Y.encodeStateVectorFromUpdateV2(Y.mergeUpdatesV2(readable))
          : new Uint8Array([0])
        const missing = Y.encodeStateAsUpdateV2(ydoc, serverState)
        if (hasContent(missing)) sendYjsUpdate(missing)
      }
      onLoaded?.()
    }
  })

  onPendingVersion((data, peerId) => {
    if (peerId === SERVER_PEER && data.length > 0) onPending?.(decoder.decode(data))
  })

  onCompact((data, peerId) => {
    const seq = decodeU32(data)
    if (peerId !== SERVER_PEER || seq === null || !canEdit()) return
    sendSnapshot(encodeU32(seq, deflateSync(Y.encodeStateAsUpdateV2(ydoc))), SERVER_PEER)
    saveSoon()
  })

  const onUpdate = (_update: Uint8Array, origin: unknown) => {
    if (origin !== 'remote') saveSoon()
  }
  ydoc.on('updateV2', onUpdate)

  return () => {
    disposed = true
    ydoc.off('updateV2', onUpdate)
    stopHidden()
    // The file follows the last edit even when the tab closes right after it.
    if (saveTimer !== undefined) saveNow()
  }
}

const EMPTY_UPDATE_BYTES = Y.encodeStateAsUpdateV2(new Y.Doc()).length

/** Whether a Yjs V2 update carries anything; an empty one still has a few header bytes. */
function hasContent(update: Uint8Array): boolean {
  return update.length > EMPTY_UPDATE_BYTES
}
