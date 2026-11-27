import { readFile } from 'node:fs/promises'

import type { Page } from '@playwright/test'

import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'
import { mockFontsource } from '#tests/helpers/fonts/fontsource'
import { testPath } from '#tests/helpers/paths'

const FAMILY = 'Kalka Fixture Sans'

async function openEditor(page: Page) {
  const data = await readFile(testPath('fixtures/fonts/InterVariable-Latin.ttf'))
  await mockFontsource(page, [{ family: FAMILY, subset: 'latin', data }])
  await page.goto('/?test&no-rulers')
  await new CanvasHelper(page).waitForInit()
}

async function pasteHTML(page: Page, html: string) {
  await page.evaluate((content) => {
    const data = new DataTransfer()
    data.setData('text/html', content)
    window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
  }, html)
}

function documentFonts(page: Page) {
  return page.evaluate(() => [...(window.kalka?.getStore?.().graph.fonts.keys() ?? [])])
}

test('a pasted design offers to keep the free fonts it names, and adds them in one click', async ({
  page
}) => {
  await openEditor(page)
  await pasteHTML(
    page,
    `<section style="padding:24px"><h1 style="font-family:'${FAMILY}';font-weight:700">Spring collection</h1></section>`
  )

  const prompt = page.getByRole('region', { name: '1 font isn’t saved with this document' })
  await expect(prompt).toBeVisible()
  await expect(prompt.getByText(FAMILY)).toBeVisible()
  await prompt.getByRole('button', { name: 'Add font' }).click()

  await expect(prompt).toBeHidden()
  await expect.poll(() => documentFonts(page)).toEqual([FAMILY])
})

test('a font the free catalogue lacks can be replaced from the font issues', async ({ page }) => {
  await openEditor(page)
  const canvasTop = async () => (await page.getByTestId('canvas-area').boundingBox())?.y
  const before = await canvasTop()
  await pasteHTML(
    page,
    `<p style="font-family:'Nowhere Grotesk';font-size:24px">Missing on every computer</p>`
  )

  const issues = page.getByTestId('font-status-banner')
  await expect(issues).toBeVisible()
  // The notice floats over the canvas: the canvas stays where it was.
  expect(await canvasTop()).toBe(before)
  await issues.getByRole('button', { name: 'Show font issues' }).click()
  await expect(issues.getByRole('button', { name: 'Replace Nowhere Grotesk with' })).toBeVisible()
  await expect(page.getByRole('region', { name: /saved with this document/ })).toBeHidden()
})

test('Add font in the font picker searches the free catalogue and keeps the family', async ({
  page
}) => {
  await openEditor(page)
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('TEXT', 120, 120, 240, 40)
    store.updateNode(id, { text: 'Spring collection' })
    store.select([id])
  })

  await page.getByTestId('font-picker-trigger').click()
  await page.getByRole('button', { name: 'Add font…' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a font' })
  await dialog.getByRole('searchbox', { name: 'Search free fonts' }).fill('fixture')
  // The preview is set in the selected text.
  await expect(dialog.getByText('Spring collection')).toBeVisible()
  await dialog.getByRole('button', { name: `Add: ${FAMILY}` }).click()

  await expect(dialog.getByRole('button', { name: `Added: ${FAMILY}` })).toBeVisible()
  await expect.poll(() => documentFonts(page)).toEqual([FAMILY])
  await expect(page.getByTestId('font-picker-trigger')).toContainText(FAMILY)
})
