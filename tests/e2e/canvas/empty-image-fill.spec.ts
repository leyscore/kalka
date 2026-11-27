import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('an image fill with no image yet shows a checkerboard, not nothing', async ({ page }) => {
  await page.goto('/')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  const id = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Artboard',
      width: 300,
      height: 300
    })
    return store.graph.createNode('RECTANGLE', frame.id, {
      name: 'Photo',
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      fills: [
        {
          type: 'IMAGE',
          opacity: 1,
          visible: true,
          color: { r: 0, g: 0, b: 0, a: 1 },
          imageScaleMode: 'FILL'
        }
      ]
    }).id
  })
  await canvas.waitForRender()

  await expect
    .poll(() =>
      page.evaluate((layerId) => {
        for (const frame of document.querySelectorAll<HTMLIFrameElement>(
          'iframe[data-kalka-artboard]'
        )) {
          const element = frame.contentDocument?.querySelector(`[data-kalka-id="${layerId}"]`)
          if (element) return frame.contentWindow?.getComputedStyle(element).backgroundImage ?? ''
        }
        return ''
      }, id)
    )
    .toContain('conic-gradient')
})
