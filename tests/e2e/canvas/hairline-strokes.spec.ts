import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-chrome&no-rulers&navigation-benchmark')

/** The alpha of the outline colour of the one outlined layer the artboard draws. */
async function outlineAlpha(frameId: string): Promise<number> {
  return editor.page.evaluate((frame) => {
    const doc = document.querySelector<HTMLIFrameElement>(
      `iframe[data-kalka-artboard="${frame}"]`
    )?.contentDocument
    const view = doc?.defaultView
    const element = [...(doc?.querySelectorAll<HTMLElement>('body *') ?? [])].find(
      (candidate) => view?.getComputedStyle(candidate).outlineStyle === 'solid'
    )
    if (!doc || !element) throw new Error('No outlined layer')
    // The browser resolves the colour to `color(srgb r g b / a)` or `rgba(...)`.
    const color = doc.defaultView?.getComputedStyle(element).outlineColor ?? ''
    const alpha = /\/\s*([\d.]+)\)$/.exec(color) ?? /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/.exec(color)
    return alpha ? Number(alpha[1]) : 1
  }, frameId)
}

test('a stroke thinner than a device pixel draws the colour it covers at the zoom shown', async () => {
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Orders',
      x: 40,
      y: 40,
      width: 320,
      height: 200
    })
    store.graph.createNode('RECTANGLE', frame.id, {
      name: 'Card',
      x: 20,
      y: 20,
      width: 200,
      height: 80,
      strokes: [
        {
          type: 'SOLID',
          color: { r: 0.5, g: 0.32, b: 0.51, a: 1 },
          opacity: 1,
          visible: true,
          weight: 0.25,
          align: 'INSIDE'
        }
      ],
      strokeWeight: 0.25
    })
    store.state.zoom = 1
    store.requestRender()
    return { frame: frame.id }
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))
  const ratio = await editor.page.evaluate(() => window.devicePixelRatio)
  await expect.poll(() => outlineAlpha(ids.frame)).toBeCloseTo(0.25 * ratio, 1)

  await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.state.zoom = 4
    store.requestRepaint()
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))
  await expect.poll(() => outlineAlpha(ids.frame)).toBe(1)
})
