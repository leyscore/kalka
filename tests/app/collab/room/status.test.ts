import { describe, expect, test } from 'bun:test'

import { deriveRoomStatus, type RoomStatusInput } from '@/app/collab/room/status'

const DISCOVERY_MS = 12_000
const UNREACHABLE_MS = 20_000

const base: RoomStatusInput = {
  hasDocument: false,
  savedCopyLoaded: true,
  openFor: 0,
  connectedFor: null,
  discoveryMs: DISCOVERY_MS,
  unreachableMs: UNREACHABLE_MS,
  peerCount: 0,
  peersWithFile: 0
}

describe('room tab status', () => {
  test('connects while the saved copy loads and until the signaling service answers', () => {
    expect(deriveRoomStatus({ ...base, savedCopyLoaded: false, connectedFor: 30_000 })).toBe(
      'connecting'
    )
    expect(deriveRoomStatus({ ...base, openFor: UNREACHABLE_MS - 1 })).toBe('connecting')
  })

  test('says the room cannot be reached when the signaling service never answers', () => {
    expect(deriveRoomStatus({ ...base, openFor: UNREACHABLE_MS })).toBe('unreachable')
  })

  test('looks for people until everyone already in the room has had time to meet this peer', () => {
    expect(deriveRoomStatus({ ...base, openFor: 30_000, connectedFor: 0 })).toBe('looking')
    expect(deriveRoomStatus({ ...base, connectedFor: DISCOVERY_MS - 1 })).toBe('looking')
  })

  test('waits once nobody who has the file showed up, even with other guests here', () => {
    expect(deriveRoomStatus({ ...base, connectedFor: DISCOVERY_MS })).toBe('waiting')
    expect(deriveRoomStatus({ ...base, connectedFor: DISCOVERY_MS, peerCount: 2 })).toBe('waiting')
  })

  test('receives the file as soon as someone who has it is here, however long it takes', () => {
    const withSharer = { ...base, peerCount: 1, peersWithFile: 1 }
    expect(deriveRoomStatus({ ...withSharer, connectedFor: 0 })).toBe('receiving')
    expect(deriveRoomStatus({ ...withSharer, connectedFor: DISCOVERY_MS * 3 })).toBe('receiving')
  })

  test('shows the file live with others, and alone from the saved copy', () => {
    expect(deriveRoomStatus({ ...base, hasDocument: true, peerCount: 2 })).toBe('live')
    expect(deriveRoomStatus({ ...base, hasDocument: true })).toBe('alone')
  })
})

describe('server room status', () => {
  const server = { loaded: false, settling: false, gone: false, signInNeeded: false }

  test('opens from the server without waiting for anyone, however long the load takes', () => {
    const connected = { ...base, connectedFor: DISCOVERY_MS * 3, server }
    expect(deriveRoomStatus(connected)).toBe('connecting')
    expect(deriveRoomStatus({ ...base, openFor: UNREACHABLE_MS, server })).toBe('unreachable')
  })

  test('is empty once loaded with nothing, unless a version is being applied', () => {
    const loaded = { ...base, connectedFor: 0, server: { ...server, loaded: true } }
    expect(deriveRoomStatus(loaded)).toBe('empty')
    expect(deriveRoomStatus({ ...loaded, server: { ...loaded.server, settling: true } })).toBe(
      'connecting'
    )
  })

  test('says the file is missing once the server says so, even after it was open', () => {
    const gone = { ...server, gone: true }
    expect(deriveRoomStatus({ ...base, server: gone })).toBe('missing')
    expect(deriveRoomStatus({ ...base, hasDocument: true, peerCount: 1, server: gone })).toBe(
      'missing'
    )
  })
})
