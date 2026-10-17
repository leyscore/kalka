import { describe, expect, test } from 'bun:test'

import { computeImageHash, imageDimensions, imageTileSize } from '@kalka/scene-graph'

describe('computeImageHash', () => {
  test('names bytes by their SHA-1, as Figma names images', () => {
    expect(computeImageHash(new TextEncoder().encode('abc'))).toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d'
    )
    expect(computeImageHash(new Uint8Array())).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709')
  })
})

/** The first bytes of an image file, up to and including its size. */
function header(bytes: number[], length = 32): Uint8Array {
  const data = new Uint8Array(length)
  data.set(bytes)
  return data
}

const GIF_20_BY_10 = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 20, 0, 10, 0]

describe('imageDimensions', () => {
  test('reads the size PNG, GIF, JPEG, and WebP headers give', () => {
    const png = header([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13])
    png.set([0, 0, 1, 44, 0, 0, 0, 32], 16)
    expect(imageDimensions(png)).toEqual({ width: 300, height: 32 })

    expect(imageDimensions(header(GIF_20_BY_10))).toEqual({ width: 20, height: 10 })

    // An APP0 segment, then a baseline frame of 40 × 30.
    const jpeg = header([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8, 0, 30, 0, 40])
    expect(imageDimensions(jpeg)).toEqual({ width: 40, height: 30 })

    const webp = header([...new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8X')])
    webp.set([99, 0, 0, 49, 0, 0], 24)
    expect(imageDimensions(webp)).toEqual({ width: 100, height: 50 })
  })

  test('is null for bytes it cannot read', () => {
    expect(imageDimensions(new TextEncoder().encode('<svg/>'))).toBeNull()
    expect(imageDimensions(new Uint8Array([0x89, 0x50]))).toBeNull()
  })
})

describe('imageTileSize', () => {
  test('is the image size times the paint scale, Figma’s scalingFactor', () => {
    const gif = header(GIF_20_BY_10)
    expect(imageTileSize({ scale: 0.5 }, gif)).toEqual({ width: 10, height: 5 })
    expect(imageTileSize({}, gif)).toEqual({ width: 20, height: 10 })
  })
})
