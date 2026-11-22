import { defineRule } from '#core/lint/rule'
import type { LintNode, RuleContext } from '#core/lint/types'

interface Options {
  /** Largest label size, in px, that reads as an eyebrow. */
  maxSize?: number
  /** Smallest letter spacing, as a fraction of the font size, that reads as tracked. */
  minTracking?: number
  /** How much larger than the label the text after it must be to count as its heading. */
  headingRatio?: number
}

function isCapitals(node: LintNode): boolean {
  if (node.textCase === 'UPPER') return true
  const letters = node.text.replace(/[^\p{L}]/gu, '')
  return (
    letters.length >= 2 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()
  )
}

/** The first visible text inside `node`, in reading order. */
function firstText(node: LintNode, context: RuleContext): LintNode | null {
  if (!node.visible) return null
  if (node.type === 'TEXT') return node
  for (const child of context.getChildren(node)) {
    const text = firstText(child, context)
    if (text) return text
  }
  return null
}

/**
 * The text that follows `node` in a vertical flow: its next sibling's first text, or, when
 * `node` is alone in a wrapper, what follows the wrapper.
 */
function textAfter(node: LintNode, context: RuleContext): LintNode | null {
  const parent = context.getParent(node)
  if (!parent || parent.layoutMode === 'HORIZONTAL' || parent.layoutMode === 'GRID') return null
  const siblings = context.getChildren(parent).filter((sibling) => sibling.visible)
  const index = siblings.findIndex((sibling) => sibling.id === node.id)
  if (index + 1 < siblings.length) return firstText(siblings[index + 1], context)
  return siblings.length === 1 ? textAfter(parent, context) : null
}

export default defineRule({
  meta: {
    id: 'tracked-caps-eyebrow',
    category: 'typography',
    description: 'A small tracked capitals label above a heading reads as a template'
  },
  match: ['TEXT'],
  check(node, context) {
    const config = context.getConfig() as Options | undefined
    const maxSize = config?.maxSize ?? 14
    const minTracking = config?.minTracking ?? 0.05
    const headingRatio = config?.headingRatio ?? 1.6
    if (!node.visible || node.fontSize > maxSize || node.text.length > 48) return
    if (node.letterSpacing / node.fontSize < minTracking || !isCapitals(node)) return
    const heading = textAfter(node, context)
    if (!heading || heading.fontSize < node.fontSize * headingRatio) return
    context.report({
      node,
      message: `Tracked capitals label "${node.text.trim()}" above the heading "${heading.text.trim().slice(0, 40)}"`,
      suggest:
        'Remove the label, or say it as a sentence-case subtitle under the heading; keep capitals for real labels such as table headers',
      data: { headingId: heading.id, fontSize: node.fontSize, letterSpacing: node.letterSpacing }
    })
  }
})
