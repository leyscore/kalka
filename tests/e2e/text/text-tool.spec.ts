import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

function editedText(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.state.editingTextId
    return id ? (store.graph.getNode(id)?.text ?? null) : null
  })
}

// A click with no pause between press and release, as a trackpad tap sends, ends before the new
// layer's artboard has loaded; the edit must still open on it.
test('a quick click with the text tool opens the new text for typing', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  await canvas.selectTool('text')
  await canvas.click(300, 300)
  await canvas.waitForTextEditor()
  await page.keyboard.type('abc')

  await expect.poll(() => editedText(page)).toBe('abc')
  canvas.assertNoErrors()
})
