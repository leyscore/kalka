/**
 * Binary frames between Kalka and a room on a Kalka server. The server keeps the same
 * definitions in `kalka-server/src/protocol.ts`; change both together and bump the version.
 *
 * Client to server: ACTION [0x01][namespace][target][payload], target empty = every other peer.
 * Server to client: ACTION [0x01][namespace][sender][payload], WELCOME [0x02][self][count u16][peer…],
 * JOIN [0x03][peer], LEAVE [0x04][peer]. Strings are one length byte, then UTF-8.
 */

export const SERVER_PROTOCOL_VERSION = 1

const FRAME_ACTION = 1
const FRAME_WELCOME = 2
const FRAME_JOIN = 3
const FRAME_LEAVE = 4

/** The peer ID a room's server answers to. */
export const SERVER_PEER = 'server'
export const SERVER_LOAD = 'srv-load'
export const SERVER_COMPACT = 'srv-compact'
export const SERVER_SNAPSHOT = 'srv-snap'

/** `srv-load` items: the deflated snapshot's parts, then each update since, then done. */
export const LOAD_SNAPSHOT_PART = 1
export const LOAD_UPDATE = 2
export const LOAD_DONE = 3

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

/** The parts, one after the other, in a single buffer. */
export function concatBytes(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

export function encodeAction(
  namespace: string,
  target: string,
  payload: Uint8Array
): Uint8Array<ArrayBuffer> {
  return concatBytes([
    Uint8Array.of(FRAME_ACTION),
    shortString(namespace),
    shortString(target),
    payload
  ])
}

export type ServerFrame =
  | { type: 'action'; namespace: string; peer: string; payload: Uint8Array }
  | { type: 'welcome'; selfId: string; peers: string[] }
  | { type: 'join' | 'leave'; peerId: string }

/** A frame from the server, or null for anything malformed. */
export function decodeFrame(bytes: Uint8Array): ServerFrame | null {
  let at = 0
  const byte = (): number => {
    if (at >= bytes.length) throw new RangeError('Truncated frame')
    const value = bytes[at]
    at += 1
    return value
  }
  const text = (): string => {
    const length = byte()
    if (at + length > bytes.length) throw new RangeError('Truncated frame')
    const value = decoder.decode(bytes.subarray(at, at + length))
    at += length
    return value
  }
  try {
    const type = byte()
    if (type === FRAME_ACTION) {
      const namespace = text()
      const peer = text()
      return { type: 'action', namespace, peer, payload: bytes.subarray(at) }
    }
    if (type === FRAME_WELCOME) {
      const selfId = text()
      const count = byte() * 256 + byte()
      const peers = Array.from({ length: count }, text)
      return { type: 'welcome', selfId, peers }
    }
    if (type === FRAME_JOIN || type === FRAME_LEAVE) {
      return { type: type === FRAME_JOIN ? 'join' : 'leave', peerId: text() }
    }
    return null
  } catch {
    return null
  }
}

export function encodeU32(value: number, rest: Uint8Array): Uint8Array {
  const out = new Uint8Array(4 + rest.length)
  new DataView(out.buffer).setUint32(0, value)
  out.set(rest, 4)
  return out
}

export function decodeU32(bytes: Uint8Array): number | null {
  return bytes.length < 4
    ? null
    : new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0)
}
