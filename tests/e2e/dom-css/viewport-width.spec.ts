import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

// Headless Chromium hides scrollbars; with them shown, as on a desktop with a mouse, a scrollbar
// in the frame that measures pasted HTML took 15px from a page longer than the frame.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

test('a section pasted as HTML fills the artboard however long the page is', async ({ page }) => {
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await page.keyboard.press('ControlOrMeta+t')
  await page.getByTestId('home-paste-html').click()
  const dialog = page.getByRole('dialog', { name: 'Paste HTML' })
  await dialog
    .getByRole('textbox')
    .fill(
      '<section style="display:flex;flex-direction:column;padding:80px"><h1>Title</h1><p style="height:2000px">Body</p></section>'
    )
  await dialog.getByRole('button', { name: 'Import', exact: true }).click()

  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        const nodes = store ? [...store.graph.nodes.values()] : []
        const artboard = nodes.find((node) => node.type === 'FRAME' && node.name === 'Desktop')
        const section = nodes.find((node) => node.name === 'section')
        return artboard && section ? [artboard.width, section.width] : null
      })
    )
    .toEqual([1440, 1440])
})
