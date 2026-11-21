/**
 * Where a room tab stands, from what this peer can actually observe:
 * - `connecting`: this device's saved copy is loading, or the service that introduces peers has
 *   not answered yet;
 * - `looking`: that service answered, and people already in the room have not had time to meet
 *   this peer yet;
 * - `receiving`: someone who has the file is here and it is on its way;
 * - `waiting`: nobody who has the file is online;
 * - `unreachable`: the service that introduces peers cannot be reached;
 * - `live`: the room's file is here and other people are too;
 * - `alone`: the room's file is here, from this device's copy, and nobody else is;
 * - `missing`: the room is a server document the server does not have, or no longer;
 * - `empty`: the room is a server document with nothing in it yet, and this person cannot
 *   start it, as a viewer cannot.
 */
export type RoomStatus =
  | 'connecting'
  | 'looking'
  | 'receiving'
  | 'waiting'
  | 'unreachable'
  | 'live'
  | 'alone'
  | 'missing'
  | 'empty'

/** The states a room tab shows its own screen for, until the room's file arrives. */
export type PendingRoomStatus = Exclude<RoomStatus, 'live' | 'alone'>

export interface RoomStatusInput {
  /** Whether the room's root is known, from a peer or from this device's saved copy. */
  hasDocument: boolean
  /** Whether this device's saved copy of the room has loaded. */
  savedCopyLoaded: boolean
  /** How long the tab has been in the room. */
  openFor: number
  /** How long the peer has been connected to the service that introduces peers, if it is. */
  connectedFor: number | null
  /** How long after connecting everyone already in the room has met this peer. */
  discoveryMs: number
  /** How long without connecting before the tab says the service cannot be reached. */
  unreachableMs: number
  peerCount: number
  /** Peers who have the room's file. */
  peersWithFile: number
  /** For a room on a Kalka server, what the server said of its document. */
  server?: ServerRoomState | null
}

export interface ServerRoomState {
  /** The server has sent what it keeps of the document. */
  loaded: boolean
  /** A version uploaded outside Kalka is being applied, or the document is being started. */
  settling: boolean
  /** The server does not have the document. */
  gone: boolean
}

export function deriveRoomStatus(input: RoomStatusInput): RoomStatus {
  if (input.server?.gone) return 'missing'
  if (input.hasDocument) return input.peerCount > 0 ? 'live' : 'alone'
  if (!input.savedCopyLoaded) return 'connecting'
  // A server keeps the document, so nobody needs to be online: it is loading, or empty.
  if (input.server) {
    if (input.server.loaded && !input.server.settling) {
      return input.peersWithFile > 0 ? 'receiving' : 'empty'
    }
    if (input.connectedFor === null && input.openFor >= input.unreachableMs) return 'unreachable'
    return 'connecting'
  }
  if (input.peersWithFile > 0) return 'receiving'
  if (input.connectedFor === null) {
    return input.openFor >= input.unreachableMs ? 'unreachable' : 'connecting'
  }
  return input.connectedFor < input.discoveryMs ? 'looking' : 'waiting'
}

/** Whether the room's file is shown, rather than the room's own screen. */
export function showsRoomDocument(status: RoomStatus): status is 'live' | 'alone' {
  return status === 'live' || status === 'alone'
}

/** Whether the tab is still trying to get the room's file, so it shows progress. */
export function isFetchingRoom(status: RoomStatus): boolean {
  return status === 'connecting' || status === 'looking' || status === 'receiving'
}
