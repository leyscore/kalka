/**
 * Pixel avatars: a small symmetric creature drawn on an 8 by 8 grid from a seed, so a person has a
 * picture of their own before they choose a photo, and keeps it on every launch. The same seed
 * always draws the same creature.
 */

export const PIXEL_AVATAR_SIZE = 8
const HALF = PIXEL_AVATAR_SIZE / 2
const FILL_CHANCE = 0.55
/** The face: a block the creature always has, with its two eyes cut out. */
const FACE_ROWS = new Set([2, 3, 4])
const FACE_COLUMNS = new Set([1, 2, 3])
const EYE = { row: 3, column: 2 }

function hash(seed: string): number {
  // FNV-1a: a stable 32-bit number from any seed.
  let value = 0x811c9dc5
  for (let index = 0; index < seed.length; index++) {
    value ^= seed.charCodeAt(index)
    value = Math.imul(value, 0x01000193)
  }
  return value >>> 0
}

function generator(seed: string): () => number {
  // Mulberry32: a small deterministic sequence, not for anything secret.
  let state = hash(seed)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let next = state
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 0x1_0000_0000
  }
}

/** The creature's pixels, row by row: true where it is drawn. Left and right halves mirror. */
export function pixelAvatarGrid(seed: string): boolean[][] {
  const next = generator(seed)
  return Array.from({ length: PIXEL_AVATAR_SIZE }, (_, row) => {
    const half = Array.from({ length: HALF }, (_, column) => {
      if (row === EYE.row && column === EYE.column) return false
      if (FACE_ROWS.has(row) && FACE_COLUMNS.has(column)) return true
      return next() < FILL_CHANCE
    })
    return [...half, ...half.toReversed()]
  })
}

/** The creature as an SVG image address, in the person's color on a pale tint of it. */
export function pixelAvatarURL(seed: string, color: string): string {
  const cells = pixelAvatarGrid(seed)
    .flatMap((row, y) =>
      row.flatMap((on, x) => (on ? [`<rect x="${x + 1}" y="${y + 1}" width="1" height="1"/>`] : []))
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges">` +
    `<rect width="10" height="10" fill="${color}" fill-opacity="0.16"/>` +
    `<g fill="${color}">${cells}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** A stable index into `length` choices for a seed, such as a person's color from their id. */
export function seedIndex(seed: string, length: number): number {
  return hash(seed) % length
}
