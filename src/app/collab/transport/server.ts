import { useIntervalFn } from '@vueuse/core'

import { decodeFrame, encodeAction, SERVER_PEER } from './server-protocol'
import type {
  CollabAction,
  CollabActionReceiver,
  CollabRoomTransport,
  JoinCollabRoom
} from './types'

/** The close code a room's socket gets when its document is deleted on the server. */
const DOCUMENT_DELETED_CODE = 4404

/** The server introduces everyone in the room as soon as the socket opens. */
const SERVER_DISCOVERY_MS = 1500
const RECONNECT_MIN_MS = 1000
const RECONNECT_MAX_MS = 30_000

export type ServerRole = 'admin' | 'editor' | 'viewer'

/** A pass into one room: the WebSocket address with its one-time ticket, and the caller's role. */
export interface RoomTicket {
  url: string
  role: ServerRole
}

/** A room transport that goes through a Kalka server, which also keeps the document. */
export interface ServerRoomTransport extends CollabRoomTransport {
  readonly server: true
  /** The role the server gave this person in the room, once connected. */
  role(): ServerRole | null
  /** Runs once the server says the document does not exist, or no longer; it stops trying. */
  onGone(handler: () => void): void
}

/** Whether a failed ticket request means the document is not on the server. */
function isMissingDocument(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error.status === 404 || error.status === 410)
  )
}

export function isServerTransport(room: CollabRoomTransport): room is ServerRoomTransport {
  return 'server' in room && room.server === true
}

/**
 * Joins rooms through a Kalka server. `ticket` asks the server's API for a fresh pass each time
 * the socket (re)connects, so a session token never goes in a WebSocket address.
 */
export function serverRoomJoiner(ticket: (roomId: string) => Promise<RoomTicket>): JoinCollabRoom {
  return (roomId) => joinServerRoom(roomId, ticket)
}

function joinServerRoom(
  roomId: string,
  ticket: (roomId: string) => Promise<RoomTicket>
): ServerRoomTransport {
  const receivers = new Map<string, CollabActionReceiver[]>()
  const joinHandlers: ((peerId: string) => void)[] = []
  const leaveHandlers: ((peerId: string) => void)[] = []
  const goneHandlers: (() => void)[] = []
  let gone = false
  const peers = new Set<string>()
  let socket: WebSocket | null = null
  let welcomed = false
  let left = false
  /** Read through a function: `leave` can run while a ticket request is awaited. */
  const hasLeft = () => left
  let role: ServerRole | null = null
  let retryMs = RECONNECT_MIN_MS
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  function peerJoined(peerId: string) {
    if (peers.has(peerId)) return
    peers.add(peerId)
    for (const handler of joinHandlers) handler(peerId)
  }

  function peerLeft(peerId: string) {
    if (!peers.delete(peerId)) return
    for (const handler of leaveHandlers) handler(peerId)
  }

  function onMessage(event: MessageEvent<unknown>) {
    if (!(event.data instanceof ArrayBuffer)) return
    const frame = decodeFrame(new Uint8Array(event.data))
    if (!frame) return
    if (frame.type === 'action') {
      for (const receive of receivers.get(frame.namespace) ?? []) {
        receive(new Uint8Array(frame.payload), frame.peer)
      }
    } else if (frame.type === 'welcome') {
      welcomed = true
      retryMs = RECONNECT_MIN_MS
      for (const peerId of frame.peers) peerJoined(peerId)
    } else if (frame.type === 'join') peerJoined(frame.peerId)
    else peerLeft(frame.peerId)
  }

  function dropConnection() {
    welcomed = false
    socket = null
    // Everyone, the server included, is gone until the socket is back; they rejoin on welcome.
    for (const peerId of peers) peerLeft(peerId)
  }

  function markGone() {
    if (gone) return
    gone = true
    left = true
    clearTimeout(retryTimer)
    for (const handler of goneHandlers) handler()
  }

  function scheduleReconnect() {
    if (left) return
    clearTimeout(retryTimer)
    retryTimer = setTimeout(() => void connect(), retryMs)
    retryMs = Math.min(retryMs * 2, RECONNECT_MAX_MS)
  }

  async function connect() {
    if (left) return
    let pass: RoomTicket
    try {
      pass = await ticket(roomId)
    } catch (error) {
      if (isMissingDocument(error)) {
        markGone()
        return
      }
      console.warn('[Kalka server] Could not get a room ticket', error)
      scheduleReconnect()
      return
    }
    if (hasLeft()) return
    role = pass.role
    const ws = new WebSocket(pass.url)
    ws.binaryType = 'arraybuffer'
    socket = ws
    ws.addEventListener('message', onMessage)
    ws.addEventListener('close', (event) => {
      if (socket === ws) dropConnection()
      if (event.code === DOCUMENT_DELETED_CODE) markGone()
      else scheduleReconnect()
    })
  }

  // A sleeping laptop can drop the socket without a close event; this notices and reconnects.
  const watchdog = useIntervalFn(() => {
    if (!left && socket && socket.readyState === WebSocket.CLOSED) {
      dropConnection()
      scheduleReconnect()
    }
  }, 5000)

  void connect()

  function send(namespace: string, data: Uint8Array, target = '') {
    // Before the welcome, nobody is in the room to hear it; what matters is resent on join.
    if (!welcomed || socket?.readyState !== WebSocket.OPEN) return
    socket.send(encodeAction(namespace, target, data))
  }

  return {
    server: true,
    role: () => role,
    makeAction(namespace): CollabAction {
      return [
        (data, peerId) => send(namespace, data, peerId ?? ''),
        (handler) => {
          receivers.set(namespace, [...(receivers.get(namespace) ?? []), handler])
        }
      ]
    },
    onPeerJoin: (handler) => void joinHandlers.push(handler),
    onPeerLeave: (handler) => void leaveHandlers.push(handler),
    onGone: (handler) => {
      if (gone) handler()
      else goneHandlers.push(handler)
    },
    signalingConnected: () => welcomed,
    discoveryMs: SERVER_DISCOVERY_MS,
    async leave() {
      left = true
      goneHandlers.length = 0
      clearTimeout(retryTimer)
      watchdog.pause()
      socket?.close(1000, 'Left')
      socket = null
    }
  }
}

export { SERVER_PEER }
