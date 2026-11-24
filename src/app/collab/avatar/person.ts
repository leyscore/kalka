import { colorToCSS } from '@kalka/scene-graph/color'
import type { Color } from '@kalka/scene-graph/primitives'

import { PEER_COLORS } from '@/constants'

import { pixelAvatarURL, seedIndex } from './pixel'

/** Someone else's pixel creature, drawn from their account id in one of the room colors. */
export function personPicture(seed: string): string {
  return pixelAvatarURL(seed, colorToCSS(PEER_COLORS[seedIndex(seed, PEER_COLORS.length)]))
}

/**
 * Someone in a room as others see them: the pixel creature of the seed they share, in their
 * color. A person whose build shares no seed gets the creature of their name.
 */
export function roomPicture(person: { name: string; color: Color; avatarSeed?: string }): string {
  return pixelAvatarURL(person.avatarSeed ?? person.name, colorToCSS(person.color))
}
