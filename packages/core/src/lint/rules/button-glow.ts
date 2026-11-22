import { rgbaToOkHCL } from '@kalka/scene-graph/color'

import { defineRule } from '#core/lint/rule'
import { nameWords } from '#core/lint/utils'

/** OKLCH chroma above which a shadow reads as a colour rather than a grey. */
const MIN_CHROMA = 0.05
/** A shadow fainter than this barely shows. */
const MIN_ALPHA = 0.1
/** A sharp offset shadow is a deliberate graphic device, not a glow. */
const MIN_BLUR = 4
/** A link taller than this is a card or a section, not a button. */
const MAX_LINK_HEIGHT = 80

function isButton(node: { tag: string; name: string; height: number }): boolean {
  if (node.tag === 'button') return true
  if (node.tag === 'a') return node.height <= MAX_LINK_HEIGHT
  return nameWords(node.name).some((word) => word === 'button' || word === 'btn' || word === 'cta')
}

export default defineRule({
  meta: {
    id: 'button-glow',
    category: 'design-tokens',
    description: 'Buttons should not float on a coloured shadow'
  },
  match: ['FRAME', 'COMPONENT', 'INSTANCE', 'RECTANGLE'],
  check(node, context) {
    if (!node.visible || !isButton(node)) return
    const glow = node.effects.find((effect) => {
      if (!effect.visible || effect.type !== 'DROP_SHADOW' || effect.radius < MIN_BLUR) return false
      if (!effect.color || effect.color.a < MIN_ALPHA) return false
      return rgbaToOkHCL(effect.color).c > MIN_CHROMA
    })
    if (!glow) return
    context.report({
      node,
      message: 'Button sits on a coloured shadow',
      suggest:
        'Keep the button flat: remove the shadow, or use a neutral one that only lifts it off the page',
      data: { radius: glow.radius }
    })
  }
})
