import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

test('presenting, a list that scrolls vertically scrolls under the wheel, not the screen', async () => {
  const { page } = editor
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const screen = graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Phone',
      width: 390,
      height: 600,
      fills: solid(1, 1, 1),
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })
    graph.createNode('FRAME', screen.id, {
      name: 'Header',
      width: 390,
      height: 80,
      fills: solid(0.2, 0.2, 0.2)
    })
    const list = graph.createNode('FRAME', screen.id, {
      name: 'List',
      width: 390,
      height: 400,
      layoutMode: 'VERTICAL',
      itemSpacing: 8,
      layoutGrow: 1,
      layoutAlignSelf: 'STRETCH',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      clipsContent: true,
      overflowDirection: 'VERTICAL'
    })
    for (let i = 0; i < 10; i++)
      graph.createNode('RECTANGLE', list.id, {
        name: `Item ${i + 1}`,
        width: 390,
        height: 112,
        fills: solid(0.1 * i, 0.4, 1)
      })
    graph.createNode('FRAME', screen.id, {
      name: 'Tab bar',
      width: 390,
      height: 80,
      fills: solid(0.9, 0.9, 0.9)
    })
    store.runLayoutForNode?.(screen.id)
    store.zoomToFit()
    return { screen: screen.id, list: list.id }
  })
  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), ids.screen)
  const presented = page.locator(`[data-present-frame="${ids.screen}"]`)
  await expect(presented).toBeVisible()

  const header = presented.locator('[data-layer="Header"]')
  const headerTop = (await header.boundingBox())?.y
  const box = await presented.boundingBox()
  if (!box) throw new Error('no presented screen')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.wheel(0, 400)

  // The list moved under the pointer; the header above it stayed.
  await expect
    .poll(() => presented.locator('[data-layer="List"]').evaluate((list) => list.scrollTop))
    .toBeGreaterThan(0)
  expect((await header.boundingBox())?.y).toBe(headerTop)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})
