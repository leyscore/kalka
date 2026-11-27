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
    return store.graph
      .getChildren(store.state.currentPageId)
      .map((node) => ({ id: node.id, x: node.x }))
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

test('a double-click stops at an icon, and the next one goes into its paths', async () => {
  await canvas.clearCanvas()
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const card = store.graph.createNode('FRAME', pageId, {
      name: 'Card',
      x: 100,
      y: 100,
      width: 300,
      height: 200
    })
    const icon = store.graph.createNode('FRAME', card.id, {
      name: 'home',
      x: 40,
      y: 40,
      width: 96,
      height: 96,
      pluginData: [{ pluginId: 'kalka', key: 'icon', value: '{"name":"lucide:home"}' }]
    })
    const path = store.graph.createNode('RECTANGLE', icon.id, {
      name: 'path',
      x: 0,
      y: 0,
      width: 96,
      height: 96,
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    store.select([card.id])
    const point = { x: 100 + 40 + 48, y: 100 + 40 + 48 }
    const { panX, panY, zoom } = store.state
    return {
      icon: icon.id,
      path: path.id,
      at: { x: point.x * zoom + panX, y: point.y * zoom + panY }
    }
  })
  await canvas.waitForRender()
  const selection = () =>
    page.evaluate(() => [...(window.kalka?.getStore?.()?.state.selectedIds ?? [])])

  await canvas.dblclick(ids.at.x, ids.at.y)
  expect(await selection()).toEqual([ids.icon])
  // A double-click of its own, a little apart, so it does not continue the first one.
  await canvas.dblclick(ids.at.x + 12, ids.at.y)
  expect(await selection()).toEqual([ids.path])
})
