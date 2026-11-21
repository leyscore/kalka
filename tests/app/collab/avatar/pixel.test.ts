import { describe, expect, test } from 'bun:test'

import { PIXEL_AVATAR_SIZE, pixelAvatarGrid, pixelAvatarURL } from '@/app/collab/avatar'

describe('pixelAvatarGrid', () => {
  test('draws the same creature from the same seed, and another from another seed', () => {
    expect(pixelAvatarGrid('a1b2c3')).toEqual(pixelAvatarGrid('a1b2c3'))
    expect(pixelAvatarGrid('a1b2c3')).not.toEqual(pixelAvatarGrid('ffee00'))
  })

  test('mirrors left and right, with a face and two eyes', () => {
    const grid = pixelAvatarGrid('seed')
    expect(grid).toHaveLength(PIXEL_AVATAR_SIZE)
    for (const row of grid) expect(row).toEqual(row.toReversed())
    expect(grid[3]?.[2]).toBe(false)
    expect(grid[3]?.[1]).toBe(true)
    expect(grid[2]?.[2]).toBe(true)
  })
})

test('pixelAvatarURL is an SVG image in the given color', () => {
  const url = pixelAvatarURL('seed', 'rgb(33, 150, 243)')
  expect(url.startsWith('data:image/svg+xml,')).toBe(true)
  expect(decodeURIComponent(url)).toContain('fill="rgb(33, 150, 243)"')
})
