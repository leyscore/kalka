import { describe, expect, test } from 'bun:test'

import {
  addressPath,
  documentSlug,
  parseAddressPath,
  sameDocument,
  tabAddress
} from '@/app/shell/address/path'

const ROOM = 'abcdefghijklmnopqrstuvwxyz012345'
const OTHER = '012345abcdefghijklmnopqrstuvwxyz'

describe('documentSlug', () => {
  test('writes a name as plain lower-case words joined by dashes', () => {
    expect(documentSlug('Mynto landing')).toBe('mynto-landing')
    expect(documentSlug('  Café — Été 2027!  ')).toBe('cafe-ete-2027')
  })

  test('falls back to untitled for a name with nothing to keep', () => {
    expect(documentSlug('')).toBe('untitled')
    expect(documentSlug('日本語')).toBe('untitled')
  })

  test('keeps addresses short without a trailing dash', () => {
    const slug = documentSlug(`${'a'.repeat(59)} b`)
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('tabAddress', () => {
  test('gives a server document its own design address', () => {
    const address = tabAddress({
      isHome: false,
      name: 'Mynto landing',
      room: { roomId: ROOM, onServer: true }
    })
    expect(addressPath(address)).toBe(`/design/${ROOM}/mynto-landing`)
  })

  test('keeps the share link for a peer-to-peer room', () => {
    const address = tabAddress({
      isHome: false,
      name: 'X',
      room: { roomId: ROOM, onServer: false }
    })
    expect(addressPath(address)).toBe(`/share/${ROOM}`)
  })

  test('puts Home and documents without a room at the root', () => {
    expect(addressPath(tabAddress({ isHome: true, name: '', room: null }))).toBe('/')
    expect(addressPath(tabAddress({ isHome: false, name: 'Local', room: null }))).toBe('/')
  })
})

describe('parseAddressPath', () => {
  test('reads design, share and home addresses', () => {
    expect(parseAddressPath(`/design/${ROOM}/mynto-landing`)).toEqual({
      kind: 'design',
      id: ROOM,
      slug: 'mynto-landing'
    })
    expect(parseAddressPath(`/design/${ROOM}`)).toEqual({
      kind: 'design',
      id: ROOM,
      slug: 'untitled'
    })
    expect(parseAddressPath(`/share/${ROOM}`)).toEqual({ kind: 'share', id: ROOM })
    expect(parseAddressPath('/')).toEqual({ kind: 'home' })
  })

  test('refuses ids that are not rooms and paths that are not addresses', () => {
    expect(parseAddressPath('/design/../etc')).toBeNull()
    expect(parseAddressPath('/share/not-a-room')).toBeNull()
    expect(parseAddressPath('/demo')).toBeNull()
  })
})

describe('sameDocument', () => {
  test('matches a document whatever name its address carries', () => {
    expect(
      sameDocument(
        { kind: 'design', id: ROOM, slug: 'old-name' },
        { kind: 'design', id: ROOM, slug: 'new-name' }
      )
    ).toBe(true)
  })

  test('tells different documents and kinds apart', () => {
    expect(
      sameDocument(
        { kind: 'design', id: ROOM, slug: 'a' },
        { kind: 'design', id: OTHER, slug: 'a' }
      )
    ).toBe(false)
    expect(sameDocument({ kind: 'share', id: ROOM }, { kind: 'design', id: ROOM, slug: 'a' })).toBe(
      false
    )
    expect(sameDocument(null, { kind: 'home' })).toBe(false)
  })
})
