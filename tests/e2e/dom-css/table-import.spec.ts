import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

const TABLE = `<table style="border-collapse:collapse">
  <tr><th style="border:1px solid #ccc;padding:8px">Amount</th><th style="border:1px solid #ccc;padding:8px">Status</th></tr>
  <tr><td style="border:1px solid #ccc;padding:8px">80</td><td style="border:1px solid #ccc;padding:8px">Pending</td></tr>
</table>`

/** The drawn boxes of the cells in an artboard, by their text. */
function cellBoxes(page: Page) {
  return page.evaluate(() => {
    const boxes: Record<string, { x: number; width: number; textRight: number }> = {}
    for (const frame of document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]'))
      for (const text of frame.contentDocument?.querySelectorAll<HTMLElement>(
        '[data-kalka-text]'
      ) ?? []) {
        const cell = text.parentElement
        if (!cell) continue
        const { x, width } = cell.getBoundingClientRect()
        boxes[text.textContent ?? ''] = { x, width, textRight: text.getBoundingClientRect().right }
      }
    return boxes
  })
}

test('a longer cell of an imported table widens its column instead of running over the next', async ({
  page
}) => {
  await page.goto('/?test')
  const canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await page.evaluate(
    (html) => window.kalka?.test?.automation?.('tool', { name: 'write_html', args: { html } }),
    TABLE
  )
  await canvas.waitForRender()

  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    for (const node of store.graph.nodes.values())
      if (node.type === 'TEXT' && node.text === '80')
        store.updateNode(node.id, { text: '80 000 000 000' })
  })
  await canvas.waitForRender()

  await expect
    .poll(async () => {
      const boxes = await cellBoxes(page)
      const amount = boxes['80 000 000 000']
      const status = boxes.Pending
      if (!amount || !status) return 'missing'
      // The grown text stays in its cell, the next column starts after it, and the header above
      // widened with it.
      return (
        amount.textRight <= amount.x + amount.width &&
        status.x >= amount.x + amount.width - 1 &&
        boxes.Amount.width === amount.width
      )
    })
    .toBe(true)
  canvas.assertNoErrors()
})
