import { sha1 } from '@noble/hashes/legacy.js'
import { bytesToHex } from '@noble/hashes/utils.js'

/**
 * The name an image's bytes are stored under: the hex SHA-1 of the bytes, as Figma names images,
 * so `.fig` files and the Figma clipboard can carry the name as it is. Documents saved before may
 * hold images under other names; anything that hands images to Figma still checks.
 */
export function computeImageHash(data: Uint8Array): string {
  return bytesToHex(sha1(data))
}
