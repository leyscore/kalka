import { describe, expect, test } from 'bun:test'

import { roomPicture } from '@/app/collab/avatar'

const color = { r: 1, g: 0.4, b: 0.1, a: 1 }

describe('roomPicture', () => {
  test('draws the creature of the seed a person shares', () => {
    const shared = roomPicture({ name: 'Ana', color, avatarSeed: 'c0ffee12' })
    expect(shared).toBe(roomPicture({ name: 'Renamed', color, avatarSeed: 'c0ffee12' }))
    expect(shared).not.toBe(roomPicture({ name: 'Ana', color, avatarSeed: 'deadbeef' }))
  })

  test('falls back to the creature of their name', () => {
    expect(roomPicture({ name: 'Ana', color })).toBe(roomPicture({ name: 'Ana', color }))
    expect(roomPicture({ name: 'Ana', color })).not.toBe(roomPicture({ name: 'Ben', color }))
  })
})
