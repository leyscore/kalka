import { defineRule } from '#core/lint/rule'

interface Options {
  /** Font size, in px, from which text counts as a display heading. */
  minSize?: number
  /** Tightest letter spacing, as a fraction of the font size. */
  minTracking?: number
  /** Tightest line height, as a fraction of the font size, for headings that wrap. */
  minLineHeight?: number
}

const round = (value: number) => Math.round(value * 100) / 100
/** Keeps a value already on the limit, once rounded to the px the canvas stores, from reporting. */
const TOLERANCE = 0.002

export default defineRule({
  meta: {
    id: 'heading-tracking',
    category: 'typography',
    description:
      'Large headings should not be tracked or leaded so tightly that letters and lines collide'
  },
  match: ['TEXT'],
  check(node, context) {
    const config = context.getConfig() as Options | undefined
    const minSize = config?.minSize ?? 40
    const minTracking = config?.minTracking ?? -0.03
    const minLineHeight = config?.minLineHeight ?? 0.95
    if (!node.visible || node.fontSize < minSize) return
    const balance = 'Balance the lines with text-wrap: balance rather than squeezing them'
    const tracking = node.letterSpacing / node.fontSize
    if (tracking < minTracking - TOLERANCE)
      context.report({
        node,
        message: `${node.fontSize}px heading tracked to ${round(tracking)}em`,
        suggest: `Keep letter spacing at or above ${minTracking}em. ${balance}`,
        data: { fontSize: node.fontSize, property: 'letterSpacing', value: round(tracking) },
        suggestions: [
          { kind: 'set', changes: { letterSpacing: round(minTracking * node.fontSize) } }
        ]
      })
    const lineHeight = node.lineHeight
    // Line height only collides between lines: a single line keeps whatever it sets.
    if (lineHeight === null || node.height <= lineHeight * 1.5) return
    const leading = lineHeight / node.fontSize
    if (leading < minLineHeight - TOLERANCE)
      context.report({
        node,
        message: `${node.fontSize}px heading wraps with line height ${round(leading)}`,
        suggest: `Keep line height at or above ${minLineHeight}. ${balance}`,
        data: { fontSize: node.fontSize, property: 'lineHeight', value: round(leading) },
        suggestions: [
          { kind: 'set', changes: { lineHeight: Math.ceil(minLineHeight * node.fontSize) } }
        ]
      })
  }
})
