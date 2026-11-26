import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

test('On drag with Smart animate moves the layer with the pointer and plays on release', async () => {
  const { page } = editor
  const { homeId, nextId } = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const home = store.graph.createNode('FRAME', pageId, {
      name: 'Home',
      width: 300,
      height: 400,
      fills: solid(1, 1, 1)
    })
    store.graph.createNode('RECTANGLE', home.id, {
      name: 'Card',
      x: 40,
      y: 40,
      width: 120,
      height: 80,
      fills: solid(0.1, 0.4, 1)
    })
    const next = store.graph.createNode('FRAME', pageId, {
      name: 'Next',
      x: 400,
      width: 300,
      height: 400,
      fills: solid(1, 1, 1)
    })
    store.graph.createNode('RECTANGLE', next.id, {
      name: 'Card',
      x: 160,
      y: 280,
      width: 120,
      height: 80,
      fills: solid(0.1, 0.4, 1)
    })
    const card = store.graph.getChildren(home.id)[0]
    store.setReactions(card.id, [
      {
        trigger: { type: 'ON_DRAG', delay: 0, keyCodes: [] },
        actions: [
          {
            type: 'NODE',
            destinationId: next.id,
            navigation: 'NAVIGATE',
            transition: {
              type: 'SMART_ANIMATE',
              direction: 'LEFT',
              matchLayers: false,
              duration: 0.2,
              easing: { type: 'EASE_OUT', bezier: null, spring: null }
            },
            preserveScrollPosition: false,
            resetScrollPosition: false,
            overlayRelativePosition: null
          }
        ]
      }
    ])
    return { homeId: home.id, nextId: next.id }
  })

  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const card = page.locator(`[data-present-frame="${homeId}"]`).locator('[data-layer="Card"]')
  await expect(card).toHaveCount(1)
  const box = await card.boundingBox()
  if (!box) throw new Error('The presented card has no box')

  await page.mouse.move(box.x + 20, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(box.x + 50, box.y + 40, { steps: 4 })
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 4 })
  // Still on Home, with the card following the pointer.
  await expect(page.locator(`[data-present-frame="${nextId}"]`)).toHaveCount(0)
  const dragged = await card.boundingBox()
  expect((dragged?.x ?? 0) - box.x).toBeGreaterThan(40)
  expect((dragged?.y ?? 0) - box.y).toBeGreaterThan(25)

  await page.mouse.up()
  await expect(page.locator(`[data-present-frame="${nextId}"]`)).toHaveCount(1)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})
