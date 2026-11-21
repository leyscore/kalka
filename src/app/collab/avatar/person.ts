import { colorToCSS } from '@kalka/scene-graph/color'

import { PEER_COLORS } from '@/constants'

import { pixelAvatarURL, seedIndex } from './pixel'

/** Someone else's pixel creature, drawn from their account id in one of the room colors. */
export function personPicture(seed: string): string {
  return pixelAvatarURL(seed, colorToCSS(PEER_COLORS[seedIndex(seed, PEER_COLORS.length)]))
}
