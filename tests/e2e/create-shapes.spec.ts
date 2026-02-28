import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '../helpers/canvas'

let page: Page
let canvas: CanvasHelper

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/?test')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
})

test.afterAll(async () => {
  await page.close()
})

test.beforeEach(async () => {
  await canvas.clearCanvas()
})

test('empty canvas', async () => {
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})

test('draw rectangle', async () => {
  await canvas.drawRect(100, 100, 200, 150)
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})

test('draw ellipse', async () => {
  await canvas.drawEllipse(100, 100, 200, 150)
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})

test('draw rectangle then move it', async () => {
  await canvas.drawRect(100, 100, 200, 150)
  await canvas.selectTool('select')
  await canvas.drag(200, 175, 400, 300)
  await canvas.waitForRender()
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})

test('draw and delete', async () => {
  await canvas.drawRect(100, 100, 200, 150)
  await canvas.deleteSelection()
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})

test('draw and undo', async () => {
  await canvas.drawRect(100, 100, 200, 150)
  await canvas.undo()
  await expect(canvas.canvas).toHaveScreenshot({ timeout: 3000 })
})
