import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { getEditingTextId } from '#tests/helpers/store'

let page: Page
let canvas: CanvasHelper

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
})

test.afterAll(async () => {
  await page.close()
})

function selection() {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return [...store.state.selectedIds].map((id) => store.graph.getNode(id)?.type)
  })
}

test('the canvas still takes clicks after redoing a typed text layer', async () => {
  await canvas.clearCanvas()
  await canvas.selectTool('frame')
  await canvas.drag(60, 60, 360, 360)
  await canvas.waitForRender()
  await canvas.selectTool('frame')
  await canvas.drag(420, 60, 620, 260)
  await canvas.waitForRender()

  await canvas.selectTool('text')
  await canvas.click(120, 120)
  await canvas.waitForTextEditor()
  await page.keyboard.type('Essai')
  await canvas.pressKey('Escape')
  await canvas.waitForRender()

  await canvas.undo()
  await canvas.redo()
  expect(await getEditingTextId(page)).toBeNull()

  await canvas.click(130, 128)
  await canvas.waitForRender()
  expect(await selection()).toEqual(['TEXT'])
  await canvas.dblclick(130, 128)
  await canvas.pressKey('Escape')
  await canvas.waitForRender()

  await canvas.click(520, 160)
  await canvas.waitForRender()
  expect(await selection()).toEqual(['FRAME'])

  const box = await canvas.canvas.boundingBox()
  if (!box) throw new Error('no canvas')
  const before = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const id = [...(store?.state.selectedIds ?? [])][0]
    return id ? store?.graph.getNode(id)?.x : undefined
  })
  await canvas.drag(520, 160, 560, 160)
  await canvas.waitForRender()
  const after = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const id = [...(store?.state.selectedIds ?? [])][0]
    return id ? store?.graph.getNode(id)?.x : undefined
  })
  expect(after).not.toBe(before)
  canvas.assertNoErrors()
})
