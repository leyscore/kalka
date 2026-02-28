import { test, expect } from '@playwright/test'

import { CanvasHelper } from '../helpers/canvas'

test.describe('create shapes', () => {
  let canvas: CanvasHelper

  test.beforeEach(async ({ page }) => {
    await page.goto('/?test')
    canvas = new CanvasHelper(page)
    await canvas.waitForInit()
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
})
