import { defineRule } from '#core/lint/rule'

/** Sources a design can load without the document's own image files. */
const LOADABLE_SOURCE = /^(?:https?:|data:|blob:)/i

export default defineRule({
  meta: {
    id: 'broken-image',
    category: 'structure',
    description: 'Images should show a picture, not an empty box'
  },
  check(node, context) {
    if (node.tag !== 'img' || !node.visible) return
    if (node.fills.some((fill) => fill.type === 'IMAGE' || fill.type === 'VIDEO')) return
    const source = node.imageSource?.trim()
    if (source && LOADABLE_SOURCE.test(source)) return
    context.report({
      node,
      message: source ? `Image source "${source}" does not load` : 'Image has no source',
      suggest:
        'Place a real image, draw the visual in CSS, or recompose the section without it; never leave a placeholder box',
      data: source ? { source } : undefined
    })
  }
})
