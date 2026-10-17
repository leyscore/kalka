import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

async function stubGoogleFonts(page: Page) {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window)
    // The page's `fetch` has no Bun namespace properties, so the stub is asserted, not widened.
    window.fetch = (async (input, init) => {
      let url: string
      if (typeof input === 'string') url = input
      else if (input instanceof URL) url = input.href
      else url = input.url
      if (url.startsWith('https://www.googleapis.com/webfonts/v1/webfonts')) {
        return new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      }
      return originalFetch(input, init)
    }) as typeof window.fetch
  })
}

/** Adds an empty text layer and, once its artboard has drawn it, starts editing it. */
async function startEmptyTextEdit(page: Page, canvas: CanvasHelper) {
  const id = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')

    const id = store.createShape('TEXT', 120, 120, 280, 36)
    store.graph.updateNode(id, {
      text: '',
      fontSize: 32,
      fontFamily: 'Inter',
      textAutoResize: 'HEIGHT',
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 }, visible: true, opacity: 1 }]
    })
    store.select([id])
    store.requestRender()
    return id
  })
  // The editor works in the layer's own element, which its new artboard holds once loaded.
  await canvas.waitForRender()
  await page.evaluate((id) => window.kalka?.getStore?.()?.startTextEditing(id), id)
  return id
}

function readEdit(page: Page, nodeId: string) {
  return page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.getNode(nodeId)
    return {
      editingTextId: store.state.editingTextId,
      height: node?.height ?? 0,
      text: node?.text ?? null
    }
  }, nodeId)
}

// The DOM canvas edits text in the layer's own element, so the browser's IME composes into it;
// the Chrome DevTools Protocol drives that IME as a keyboard layout would.
test('Hangul text input commits', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await stubGoogleFonts(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  const id = await startEmptyTextEdit(page, canvas)
  await canvas.waitForTextEditor()

  await page.keyboard.insertText('환경설정')
  await canvas.waitForRender()
  await canvas.click(20, 20)
  await canvas.waitForRender()

  const result = await readEdit(page, id)
  expect(result).toMatchObject({ editingTextId: null, text: '환경설정' })
  expect(result.height).toBeGreaterThan(0)
  canvas.assertNoErrors()
})

test('Hangul composition updates the layer before the IME commits', async ({ page }) => {
  const canvas = new CanvasHelper(page)
  await stubGoogleFonts(page)
  await page.goto('/?test&no-chrome&no-rulers')
  await canvas.waitForInit()

  const id = await startEmptyTextEdit(page, canvas)
  await canvas.waitForTextEditor()

  const cdp = await page.context().newCDPSession(page)
  try {
    for (const text of ['ㅎ', '하', '한']) {
      await cdp.send('Input.imeSetComposition', {
        text,
        selectionStart: text.length,
        selectionEnd: text.length
      })
      await expect.poll(async () => (await readEdit(page, id)).text).toBe(text)
    }
    await cdp.send('Input.insertText', { text: '한' })
  } finally {
    await cdp.detach()
  }
  await expect.poll(() => readEdit(page, id)).toMatchObject({ editingTextId: id, text: '한' })

  await canvas.click(20, 20)
  await expect.poll(() => readEdit(page, id)).toMatchObject({ editingTextId: null, text: '한' })
  canvas.assertNoErrors()
})
