import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

let page: Page
let canvas: CanvasHelper

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
})

test.afterAll(async () => {
  await page.close()
})

function selectedNames() {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return [...store.state.selectedIds].map((id) => store.graph.getNode(id)?.name ?? '').sort()
  })
}

/** An artboard holding a frame that fills most of it, which holds two rectangles. */
async function drawNestedFrames() {
  await canvas.clearCanvas()
  await canvas.selectTool('frame')
  await canvas.drag(60, 60, 560, 460)
  await canvas.waitForRender()
  await canvas.selectTool('frame')
  await canvas.drag(80, 80, 540, 440)
  await canvas.waitForRender()
  await canvas.drawRect(120, 120, 60, 60)
  await canvas.drawRect(240, 120, 60, 60)
  await canvas.pressKey('Escape')
  await canvas.waitForRender()
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const [artboard] = store.graph.getChildren(store.state.currentPageId)
    const [inner] = store.graph.getChildren(artboard.id)
    store.graph.updateNode(inner.id, { name: 'Inner' })
    const rects = store.graph.getChildren(inner.id)
    rects.forEach((rect, i) => store.graph.updateNode(rect.id, { name: `Rect ${i + 1}` }))
    return { inner: { x: inner.x, y: inner.y }, rects: rects.length }
  })
}

test('Cmd-dragging from the empty area of a nested frame draws a marquee inside it', async () => {
  const setup = await drawNestedFrames()
  expect(setup.rects).toBe(2)

  const box = await canvas.canvas.boundingBox()
  if (!box) throw new Error('no canvas')
  await page.keyboard.down('ControlOrMeta')
  await page.mouse.move(box.x + 100, box.y + 400)
  await page.mouse.down()
  await page.mouse.move(box.x + 320, box.y + 110, { steps: 10 })
  await page.mouse.up()
  await page.keyboard.up('ControlOrMeta')
  await canvas.waitForRender()

  expect(await selectedNames()).toEqual(['Rect 1', 'Rect 2'])
  const inner = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const [artboard] = store.graph.getChildren(store.state.currentPageId)
    const [frame] = store.graph.getChildren(artboard.id)
    return { x: frame.x, y: frame.y }
  })
  expect(inner).toEqual(setup.inner)
  canvas.assertNoErrors()
})

test('a Cmd-click on the empty area of a nested frame still selects it', async () => {
  await page.keyboard.down('ControlOrMeta')
  await canvas.click(400, 400)
  await page.keyboard.up('ControlOrMeta')
  await canvas.waitForRender()
  expect(await selectedNames()).toEqual(['Inner'])
})

test('dragging inside the selected layer moves it, even where another layer is drawn over it', async () => {
  await canvas.clearCanvas()
  await canvas.drawRect(100, 100, 160, 160)
  await canvas.drawRect(180, 180, 160, 160)
  await canvas.pressKey('Escape')
  const [under, over] = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph.getChildren(store.state.currentPageId).map((node) => ({ id: node.id, x: node.x }))
  })
  // Select the lower one where nothing covers it, then drag from where the upper one covers it.
  await canvas.click(120, 120)
  await canvas.drag(220, 220, 260, 220)
  await canvas.waitForRender()
  const after = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph.getChildren(store.state.currentPageId).map((node) => node.x)
  })
  expect(after[0]).not.toBe(under.x)
  expect(after[1]).toBe(over.x)

  // A click there without a drag selects the layer on top, as before.
  await canvas.click(220, 220)
  await canvas.waitForRender()
  expect(
    await page.evaluate(() => [...(window.kalka?.getStore?.()?.state.selectedIds ?? [])])
  ).toEqual([over.id])
})
