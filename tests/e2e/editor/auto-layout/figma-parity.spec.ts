import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { propertySection } from '#tests/helpers/properties'
import { getNodeById } from '#tests/helpers/store'

/** A row of three 80 x 50 rectangles at zoom 1, or the same rectangles loose on the page. */
async function setup(page: Page, inRow: boolean) {
  return page.evaluate((row) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.state.panX = 0
    store.state.panY = 0
    store.state.zoom = 1
    const pageId = store.state.currentPageId
    const frame = row
      ? store.graph.createNode('FRAME', pageId, {
          name: 'Row',
          x: 100,
          y: 100,
          width: 300,
          height: 100,
          layoutMode: 'HORIZONTAL',
          primaryAxisSizing: 'HUG',
          counterAxisSizing: 'HUG',
          itemSpacing: 16,
          paddingTop: 20,
          paddingRight: 20,
          paddingBottom: 20,
          paddingLeft: 20
        })
      : null
    // Loose, they sit 24 apart in a row, the last one first in the layer stack.
    const ids = [2, 0, 1].map(
      (i) =>
        store.graph.createNode('RECTANGLE', frame?.id ?? pageId, {
          name: `R${i}`,
          x: 100 + i * 104,
          y: 100 + i,
          width: 80,
          height: 50
        }).id
    )
    if (frame) store.runLayoutForNode(frame.id)
    store.select(frame ? [frame.id] : ids)
    store.requestRender()
    return { frameId: frame?.id ?? '', ids }
  }, inRow)
}

async function start(page: Page) {
  await page.goto('/')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await canvas.clearCanvas()
  return canvas
}

test('Shift+A keeps the gap, the flow and the order of the layers it wraps', async ({ page }) => {
  const canvas = await start(page)
  const { ids } = await setup(page, false)
  await canvas.waitForRender()

  await canvas.pressKey('Shift+A')
  await canvas.waitForRender()

  const frameId = await page.evaluate(
    () => [...(window.kalka?.getStore?.().state.selectedIds ?? [])][0]
  )
  const frame = await getNodeById(page, frameId)
  expect(frame?.layoutMode).toBe('HORIZONTAL')
  expect(frame?.itemSpacing).toBe(24)
  expect(frame?.childIds).toEqual([ids[1], ids[2], ids[0]])
  canvas.assertNoErrors()
})

test('Absolute position takes a layer out of the flow where it is, in one undo step', async ({
  page
}) => {
  const canvas = await start(page)
  const { frameId, ids } = await setup(page, true)
  // The row lays the layers out in stack order, so the middle one is the second made.
  const [middle, last] = [ids[1], ids[2]]
  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), middle)
  await canvas.waitForRender()
  const before = await getNodeById(page, middle)
  const lastBefore = await getNodeById(page, last)

  const toggle = propertySection(page, 'Position').getByRole('button', {
    name: 'Absolute position'
  })
  await toggle.click()
  await canvas.waitForRender()

  const placed = await getNodeById(page, middle)
  expect(placed?.layoutPositioning).toBe('ABSOLUTE')
  expect([placed?.x, placed?.y]).toEqual([before?.x, before?.y])
  // The next layer takes its place in the flow, and constraints apply to the absolute layer.
  expect((await getNodeById(page, last))?.x).toBe(before?.x)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(propertySection(page, 'Constraints')).toBeVisible()

  await canvas.undo()
  await canvas.waitForRender()
  expect((await getNodeById(page, middle))?.layoutPositioning).toBe('AUTO')
  expect((await getNodeById(page, last))?.x).toBe(lastBefore?.x)
  expect((await getNodeById(page, frameId))?.layoutMode).toBe('HORIZONTAL')
  canvas.assertNoErrors()
})

test('dragging a gap or a padding of the selected frame changes it, in one undo step', async ({
  page
}) => {
  const canvas = await start(page)
  const { frameId } = await setup(page, true)
  await canvas.waitForRender()

  // The first gap: the frame's left padding, an 80 px layer, then 8 px into the 16 px gap.
  const gapX = 100 + 20 + 80 + 8
  await canvas.hover(gapX, 150)
  await canvas.drag(gapX, 150, gapX + 10, 150)
  await canvas.waitForRender()
  expect((await getNodeById(page, frameId))?.itemSpacing).toBe(26)
  expect((await getNodeById(page, frameId))?.x).toBe(100)

  // The top padding grows as its band is dragged down.
  await canvas.hover(250, 110)
  await canvas.drag(250, 110, 250, 122)
  await canvas.waitForRender()
  expect((await getNodeById(page, frameId))?.paddingTop).toBe(32)

  await canvas.undo()
  expect((await getNodeById(page, frameId))?.paddingTop).toBe(20)
  await canvas.undo()
  expect((await getNodeById(page, frameId))?.itemSpacing).toBe(16)
  canvas.assertNoErrors()
})
