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

function pageTexts(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageNode = store.graph.getNode(store.state.currentPageId)
    return (pageNode?.childIds ?? []).flatMap((id) => {
      const node = store.graph.getNode(id)
      return node?.type === 'TEXT' ? [{ text: node.text, width: node.width }] : []
    })
  })
}

function activeTool(page: Page) {
  return page.evaluate(() => window.kalka?.getStore?.().state.activeTool ?? null)
}

// The new text's artboard loads after the click; keys pressed meanwhile must reach the text, and
// none may pick a tool ("o" is the ellipse, "h" the hand).
test('keys typed right after the click land in the new text', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  await canvas.selectTool('text')
  await canvas.click(300, 300)
  await page.keyboard.type('Hello')

  await expect.poll(() => editedText(page)).toBe('Hello')
  expect(await activeTool(page)).toBe('SELECT')
  canvas.assertNoErrors()
})

test('text made on the page outside any frame is measured as it is typed', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  await canvas.selectTool('text')
  await canvas.click(300, 300)
  await canvas.waitForTextEditor()
  await page.keyboard.type('Hello')
  await expect.poll(async () => (await pageTexts(page))[0]?.width ?? 0).toBeGreaterThan(1)

  await page.keyboard.press('Escape')
  await expect.poll(() => editedText(page)).toBeNull()
  const [text] = await pageTexts(page)
  expect(text?.text).toBe('Hello')
  expect(text?.width).toBeGreaterThan(1)
  canvas.assertNoErrors()
})

test('Escape right after a click with the text tool leaves no empty text', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  await canvas.selectTool('text')
  await canvas.click(300, 300)
  await page.keyboard.press('Escape')
  await expect.poll(() => editedText(page)).toBeNull()
  await expect.poll(() => pageTexts(page)).toEqual([])

  await canvas.selectTool('text')
  await canvas.click(400, 300)
  await canvas.waitForTextEditor()
  await page.keyboard.press('Escape')
  await expect.poll(() => editedText(page)).toBeNull()
  await expect.poll(() => pageTexts(page)).toEqual([])
  canvas.assertNoErrors()
})

// A panel change, such as the font size typed while the text is still being edited, shows at once.
test('the text being edited takes a new font size', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  await canvas.selectTool('text')
  await canvas.click(300, 300)
  await canvas.waitForTextEditor()
  await page.keyboard.type('Hello')
  await expect.poll(async () => (await pageTexts(page))[0]?.width ?? 0).toBeGreaterThan(1)
  const before = (await pageTexts(page))[0]?.width ?? 0

  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const id = store?.state.editingTextId
    if (store && id) store.updateNodeWithUndo(id, { fontSize: 48 })
  })

  await expect.poll(async () => (await pageTexts(page))[0]?.width ?? 0).toBeGreaterThan(before * 2)
  expect(await editedText(page)).toBe('Hello')
  canvas.assertNoErrors()
})
