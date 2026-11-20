import { randomIndex } from '@kalka/scene-graph/random'

/** The name Kalka's agent goes by: the first agent in a document is always Pebble. */
export const DEFAULT_CALLSIGN = 'Pebble'

/** Short, distinct names for the agents beside it, easy to say: "ask Fern to align the cards". */
const CALLSIGNS = [
  'Fern',
  'Orbit',
  'Pixel',
  'Juniper',
  'Comet',
  'Maple',
  'Nova',
  'Quill',
  'Sable',
  'Tango',
  'Willow',
  'Echo',
  'Indigo',
  'Kite',
  'Lumen',
  'Mosaic',
  'Nimbus',
  'Opal',
  'Pico',
  'Rune',
  'Sorrel',
  'Tidal',
  'Vesper',
  'Wren',
  'Zephyr',
  'Atlas',
  'Basil',
  'Cinder',
  'Dune',
  'Ember',
  'Flint'
] as const

/**
 * Pebble while no visible agent goes by it, then a callsign not in `taken`, picked at random so
 * peers rarely choose the same one.
 */
export function pickCallsign(taken: ReadonlySet<string>): string {
  if (!taken.has(DEFAULT_CALLSIGN)) return DEFAULT_CALLSIGN
  const free = CALLSIGNS.filter((name) => !taken.has(name))
  if (free.length > 0) return free[randomIndex(free.length)] ?? CALLSIGNS[0]
  // Every callsign is taken: number the first one that is still unique.
  for (let n = 2; ; n++) {
    const name = `${CALLSIGNS[0]} ${n}`
    if (!taken.has(name)) return name
  }
}
