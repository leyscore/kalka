import type { SceneNode } from '@open-pencil/scene-graph'

import { expect, test } from '#tests/e2e/fixtures'
import { expectDefined } from '#tests/helpers/assert'
import { CanvasHelper } from '#tests/helpers/canvas'

test.use({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })

for (const rotation of [-145, -40, 50]) {
  test(`frame titles and dimensions remain readable at ${rotation} degrees`, async ({ page }) => {
    await page.goto('/?test&no-rulers')
    const canvas = new CanvasHelper(page)
    await canvas.waitForInit()
    await page.evaluate((angle) => {
      const store = window.openPencil?.getStore?.()
      if (!store) throw new Error('Editor unavailable')
      const id = store.createShape('FRAME', 250, 250, 300, 180)
      store.updateNode(id, { name: 'Frame', rotation: angle })
      store.select([id])
    }, rotation)
    const box = expectDefined(await canvas.canvas.boundingBox(), 'canvas bounds')
    await expect(page).toHaveScreenshot(`readable-frame-${rotation}.png`, {
      clip: { x: box.x + 150, y: box.y + 100, width: 500, height: 500 },
      maxDiffPixels: 0,
      threshold: 0,
      scale: 'device'
    })
    canvas.assertNoErrors()
  })
}

for (const zoom of [0.5, 1, 2]) {
  test(`section pills retain their size and hover target at ${zoom} zoom`, async ({ page }) => {
    await page.goto('/?test&no-rulers')
    const canvas = new CanvasHelper(page)
    await canvas.waitForInit()
    const lightId = await page.evaluate((scale) => {
      const store = window.openPencil?.getStore?.()
      if (!store) throw new Error('Editor unavailable')
      const sectionPaint = {
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
        strokes: [
          {
            color: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
            weight: 1,
            opacity: 1,
            visible: true,
            align: 'INSIDE'
          }
        ]
      } satisfies Pick<SceneNode, 'fills' | 'strokes'>
      const color = store.graph.createNode('SECTION', store.state.currentPageId, {
        name: 'Color',
        x: 60,
        y: 100,
        width: 280,
        height: 150,
        ...structuredClone(sectionPaint)
      })
      const light = store.graph.createNode('SECTION', color.id, {
        name: 'Light',
        x: 16,
        y: 30,
        width: 248,
        height: 100,
        ...structuredClone(sectionPaint)
      })
      store.graph.createNode('RECTANGLE', light.id, {
        x: 20,
        y: 60,
        width: 60,
        height: 24,
        fills: [
          { type: 'SOLID', color: { r: 0.05, g: 0.05, b: 0.05, a: 1 }, opacity: 1, visible: true }
        ]
      })
      store.clearSelection()
      store.setZoomAroundPoint(scale, 0, 0)
      store.requestRender()
      return light.id
    }, zoom)
    const box = expectDefined(await canvas.canvas.boundingBox(), 'canvas bounds')
    const clip = { x: box.x + 10, y: box.y + 10, width: 700, height: 560 }
    await expect(page).toHaveScreenshot(`section-pills-${zoom}.png`, {
      clip,
      maxDiffPixels: 0,
      threshold: 0,
      scale: 'device'
    })
    // Nested titles have a fixed six-pixel inset and a screen-sized pill.
    await page.mouse.move(box.x + 76 * zoom + 18, box.y + 130 * zoom + 18)
    await expect
      .poll(() => page.evaluate(() => window.openPencil?.getStore?.().state.hoveredNodeId))
      .toBe(lightId)
    await expect(page).toHaveScreenshot(`section-pills-hover-${zoom}.png`, {
      clip,
      maxDiffPixels: 0,
      threshold: 0,
      scale: 'device'
    })
    canvas.assertNoErrors()
  })
}
