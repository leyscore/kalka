import type { Page } from '@playwright/test'

export function probeParagraphBuilds(page: Page) {
  return page.evaluateHandle(() => {
    const renderers = window.openPencil?.getStore?.().canvasRenderers
    if (!renderers?.length) throw new Error('Renderer unavailable')
    const restores: Array<() => void> = []
    let count = 0
    let readiness = 0
    for (const builder of new Set(renderers.map((renderer) => renderer.ck.ParagraphBuilder))) {
      const original = builder.MakeFromFontProvider
      builder.MakeFromFontProvider = (...args) => {
        count++
        return original.apply(builder, args)
      }
      restores.push(() => {
        builder.MakeFromFontProvider = original
      })
    }
    for (const renderer of renderers) {
      const original = renderer.nodeFontReadiness
      renderer.nodeFontReadiness = (node) => {
        readiness++
        return original.call(renderer, node)
      }
      restores.push(() => {
        renderer.nodeFontReadiness = original
      })
    }
    return {
      count: () => count,
      readiness: () => readiness,
      restore: () => {
        for (const restore of restores) restore()
      }
    }
  })
}
