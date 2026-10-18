import { sha1 } from '@noble/hashes/legacy.js'
import { bytesToHex } from '@noble/hashes/utils.js'

import type { Fill } from './types'

/**
 * The name an image's bytes are stored under: the hex SHA-1 of the bytes, as Figma names images,
 * so `.fig` files and the Figma clipboard can carry the name as it is. Documents saved before may
 * hold images under other names; anything that hands images to Figma still checks.
 */
export function computeImageHash(data: Uint8Array): string {
  return bytesToHex(sha1(data))
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

const ASCII = (text: string) => Array.from(new TextEncoder().encode(text))

/**
 * The extension an image's bytes call for, so a file of them opens in other tools: `bin` for
 * bytes no image format recognises.
 */
export function imageExtension(bytes: Uint8Array): string {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'png'
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith(bytes, ASCII('GIF8'))) return 'gif'
  if (startsWith(bytes, ASCII('RIFF')) && startsWith(bytes, ASCII('WEBP'), 8)) return 'webp'
  if (startsWith(bytes, ASCII('ftypavif'), 4)) return 'avif'
  const head = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart()
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) return 'svg'
  return 'bin'
}

/** An image's size in pixels. */
export interface ImageDimensions {
  width: number
  height: number
}

function uint16(data: Uint8Array, at: number, littleEndian: boolean): number {
  return littleEndian ? data[at] | (data[at + 1] << 8) : (data[at] << 8) | data[at + 1]
}

function uint32(data: Uint8Array, at: number): number {
  return ((data[at] << 24) | (data[at + 1] << 16) | (data[at + 2] << 8) | data[at + 3]) >>> 0
}

function jpegDimensions(data: Uint8Array): ImageDimensions | null {
  let at = 2
  while (at + 9 < data.length) {
    if (data[at] !== 0xff) return null
    const marker = data[at + 1]
    // Start-of-frame markers, except the DHT, JPG, and DAC markers that share the range.
    const frame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
    if (frame) return { height: uint16(data, at + 5, false), width: uint16(data, at + 7, false) }
    at += 2 + uint16(data, at + 2, false)
  }
  return null
}

function webpDimensions(data: Uint8Array): ImageDimensions | null {
  const chunk = String.fromCharCode(...data.subarray(12, 16))
  if (chunk === 'VP8 ' && data.length >= 30) {
    return { width: uint16(data, 26, true) & 0x3fff, height: uint16(data, 28, true) & 0x3fff }
  }
  if (chunk === 'VP8L' && data.length >= 25) {
    const bits = data[21] | (data[22] << 8) | (data[23] << 16) | (data[24] << 24)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X' && data.length >= 30) {
    const width = 1 + (data[24] | (data[25] << 8) | (data[26] << 16))
    const height = 1 + (data[27] | (data[28] << 8) | (data[29] << 16))
    return { width, height }
  }
  return null
}

/**
 * The size a PNG, JPEG, GIF, or WebP image's header gives, without decoding it; null for other
 * formats and for bytes too short to hold one.
 */
export function imageDimensions(data: Uint8Array): ImageDimensions | null {
  if (data.length >= 24 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e) {
    return { width: uint32(data, 16), height: uint32(data, 20) }
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) return jpegDimensions(data)
  if (data.length >= 10 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    return { width: uint16(data, 6, true), height: uint16(data, 8, true) }
  }
  const riff = String.fromCharCode(...data.subarray(0, 4))
  const webp = String.fromCharCode(...data.subarray(8, 12))
  if (data.length >= 16 && riff === 'RIFF' && webp === 'WEBP') return webpDimensions(data)
  return null
}

/**
 * The size each tile of a tiled image fill draws at: the image's own size times the paint's
 * scale, Figma's `scalingFactor`. As in Figma, a tiled image ignores `imageTransform`, which only
 * a cropped image uses.
 */
export function imageTileSize(fill: Pick<Fill, 'scale'>, data: Uint8Array): ImageDimensions | null {
  const size = imageDimensions(data)
  if (!size || size.width <= 0 || size.height <= 0) return null
  const scale = fill.scale && fill.scale > 0 ? fill.scale : 1
  return { width: size.width * scale, height: size.height * scale }
}
