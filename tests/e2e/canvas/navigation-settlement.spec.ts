import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-chrome&no-rulers&navigation-benchmark')

test('the navigation benchmark settles on the DOM canvas once its artboards show the page', async () => {
  const frameId = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Settled frame',
      x: 40,
      y: 40,
      width: 320,
      height: 200
    })
    store.graph.createNode('TEXT', frame.id, {
      x: 16,
      y: 16,
      width: 200,
      height: 24,
      text: 'Settles once drawn'
    })
    store.requestRender()
    return frame.id
  })

  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))

  // Settled means the artboard's document is loaded and draws the layers.
  const drawn = await editor.page.evaluate((id) => {
    const frame = document.querySelector<HTMLIFrameElement>(`iframe[data-kalka-artboard="${id}"]`)
    return frame?.contentDocument?.body.textContent ?? ''
  }, frameId)
  expect(drawn).toContain('Settles once drawn')

  // Navigation settles again after the view moves.
  await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.zoomToSelection()
    store.requestRepaint()
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))
})
