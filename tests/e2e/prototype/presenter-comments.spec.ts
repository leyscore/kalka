import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

test('comments pin onto the presented screen and a click in comment mode adds one', async () => {
  const { page } = editor
  const { homeId, buttonId } = await page.evaluate(() => {
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
    const button = store.graph.createNode('RECTANGLE', home.id, {
      name: 'Button',
      x: 40,
      y: 40,
      width: 120,
      height: 40,
      fills: solid(0.1, 0.4, 1)
    })
    return { homeId: home.id, buttonId: button.id }
  })

  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const button = page.locator(`[data-present-frame="${homeId}"]`).locator('[data-layer="Button"]')
  await expect(button).toHaveCount(1)
  const pins = page.locator('[data-slot="presenter-comments"] [data-slot="comment-pin"]')
  await expect(pins).toHaveCount(0)

  // Comment mode from the presenter's button; a click on the button layer starts a thread there.
  await page.locator('[data-slot="presenter-comment-mode"]').click()
  await expect(page.locator('[data-slot="comment-placement"]')).toBeVisible()
  const box = await button.boundingBox()
  if (!box) throw new Error('The presented button has no box')
  await page.mouse.click(box.x + 20, box.y + 10)
  const thread = page.locator('[data-slot="comment-thread"]')
  await thread.getByRole('textbox').fill('Make the label bigger')
  await thread.getByRole('textbox').press('Enter')

  await expect(pins).toHaveCount(1)
  const anchor = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const comments = store?.graph.getNode(store.graph.rootId)?.comments ?? []
    return comments[0]?.anchor
  })
  expect(anchor?.nodeId).toBe(buttonId)
  expect(anchor?.x).toBeCloseTo(20, 0)
  expect(anchor?.y).toBeCloseTo(10, 0)

  // The pin sits where the comment was placed on the drawn layer.
  const pin = await pins.boundingBox()
  expect(Math.abs((pin?.x ?? 0) - (box.x + 20))).toBeLessThan(3)
  expect(Math.abs((pin?.y ?? 0) + (pin?.height ?? 0) - (box.y + 10))).toBeLessThan(3)

  // Comment mode stays on after posting; Escape closes the thread, then leaves the mode.
  await expect(page.locator('[data-slot="comment-placement"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-slot="comment-placement"]')).toHaveCount(0)

  // C turns comment mode on in the presenter as on the canvas.
  await page.keyboard.press('c')
  await expect(page.locator('[data-slot="comment-placement"]')).toBeVisible()
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})
