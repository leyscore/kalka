/**
 * The binary frames between Kalka and a room on this server. Kalka keeps a copy of this file in
 * `src/app/collab/transport/server-protocol.ts`; change both together and bump PROTOCOL_VERSION.
 *
 * Client to server:
 *   ACTION  [0x01][ns][target][payload]   target empty = every other peer, "server" = the server
 * Server to client:
 *   ACTION  [0x01][ns][sender][payload]
 *   WELCOME [0x02][selfId][count u16][peerId…]
 *   JOIN    [0x03][peerId]
 *   LEAVE   [0x04][peerId]
 * Strings are one length byte followed by UTF-8.
 */

export const PROTOCOL_VERSION = 1

export const FRAME_ACTION = 1
export const FRAME_WELCOME = 2
export const FRAME_JOIN = 3
export const FRAME_LEAVE = 4

/** The peer ID the server answers to in a room. */
export const SERVER_PEER = 'server'

/** Actions the server itself sends or understands. */
export const SERVER_LOAD = 'srv-load'
export const SERVER_COMPACT = 'srv-compact'
export const SERVER_SNAPSHOT = 'srv-snap'
/**
 * A version uploaded outside Kalka (WebDAV, a restore) waits to be applied; the payload is its
 * id. Sent before `srv-load`'s done item and whenever a new one arrives. Older Kalka ignores it.
 */
export const SERVER_PENDING = 'srv-pending'
export const YJS_UPDATE = 'yjs-update'
export const SYNC_REPLY = 'sync-reply'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function shortString(value: string): Uint8Array {
  const bytes = encoder.encode(value)
  if (bytes.length > 255) throw new Error('String too long for a frame')
  const out = new Uint8Array(bytes.length + 1)
  out[0] = bytes.length
  out.set(bytes, 1)
  return out
}

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

class Reader {
  at = 0
  constructor(readonly bytes: Uint8Array) {}
  byte(): number {
    const value = this.bytes[this.at]
    if (value === undefined) throw new Error('Truncated frame')
    this.at += 1
    return value
  }
  string(): string {
    const length = this.byte()
    if (this.at + length > this.bytes.length) throw new Error('Truncated frame')
    const value = decoder.decode(this.bytes.subarray(this.at, this.at + length))
    this.at += length
    return value
  }
  u16(): number {
    return this.byte() * 256 + this.byte()
  }
  rest(): Uint8Array {
    return this.bytes.subarray(this.at)
  }
}

export function encodeAction(namespace: string, peer: string, payload: Uint8Array): Uint8Array {
  return concat([Uint8Array.of(FRAME_ACTION), shortString(namespace), shortString(peer), payload])
}

export function encodeWelcome(selfId: string, peers: string[]): Uint8Array {
  return concat([
    Uint8Array.of(FRAME_WELCOME),
    shortString(selfId),
    Uint8Array.of(peers.length >> 8, peers.length & 0xff),
    ...peers.map(shortString)
  ])
}

export function encodePeerEvent(kind: typeof FRAME_JOIN | typeof FRAME_LEAVE, peerId: string) {
  return concat([Uint8Array.of(kind), shortString(peerId)])
}

export type Frame =
  | { type: 'action'; namespace: string; peer: string; payload: Uint8Array }
  | { type: 'welcome'; selfId: string; peers: string[] }
  | { type: 'join' | 'leave'; peerId: string }

/** Decodes a frame, or returns null for anything malformed. */
export function decodeFrame(bytes: Uint8Array): Frame | null {
  try {
    const reader = new Reader(bytes)
    const type = reader.byte()
    if (type === FRAME_ACTION) {
      const namespace = reader.string()
      const peer = reader.string()
      return { type: 'action', namespace, peer, payload: reader.rest() }
    }
    if (type === FRAME_WELCOME) {
      const selfId = reader.string()
      const count = reader.u16()
      const peers: string[] = []
      for (let index = 0; index < count; index++) peers.push(reader.string())
      return { type: 'welcome', selfId, peers }
    }
    if (type === FRAME_JOIN || type === FRAME_LEAVE) {
      return { type: type === FRAME_JOIN ? 'join' : 'leave', peerId: reader.string() }
    }
    return null
  } catch {
    return null
  }
}

/** A list of byte chunks as [count u32][len u32, bytes]…, used by `srv-load`. */
export function encodeChunks(chunks: Uint8Array[]): Uint8Array {
  const header = new Uint8Array(4 + chunks.length * 4)
  const view = new DataView(header.buffer)
  view.setUint32(0, chunks.length)
  chunks.forEach((chunk, index) => view.setUint32(4 + index * 4, chunk.length))
  return concat([header, ...chunks])
}

export function decodeChunks(bytes: Uint8Array): Uint8Array[] | null {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const count = view.getUint32(0)
    let at = 4 + count * 4
    const chunks: Uint8Array[] = []
    for (let index = 0; index < count; index++) {
      const length = view.getUint32(4 + index * 4)
      if (at + length > bytes.length) return null
      chunks.push(bytes.subarray(at, at + length))
      at += length
    }
    return chunks
  } catch {
    return null
  }
}

export function encodeU32(value: number, rest: Uint8Array = new Uint8Array()): Uint8Array {
  const out = new Uint8Array(4 + rest.length)
  new DataView(out.buffer).setUint32(0, value)
  out.set(rest, 4)
  return out
}

export function decodeU32(bytes: Uint8Array): { value: number; rest: Uint8Array } | null {
  if (bytes.length < 4) return null
  const value = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0)
  return { value, rest: bytes.subarray(4) }
}
