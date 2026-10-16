import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { testPath } from '#tests/helpers/paths'

/**
 * Every page of real `.fig` files as the canvas draws it, compared with captures taken before
 * the CSS model's migration (PLAN.md, section 12). The fingerprints in
 * `tests/integration/fig-import` say what changed; these say whether anyone would see it.
 * The large files run on CI only: a laptop running the editor cannot spare the memory.
 */
const FIXTURES = [
  { file: 'gold-preview.fig', large: false },
  { file: 'slots.fig', large: false },
  { file: 'circle-text.fig', large: false },
  { file: 'positivus.fig', large: true },
  { file: 'material3.fig', large: true }
] as const

test.use({ viewport: { width: 1440, height: 900 } })

async function openFixture(page: Page, file: string): Promise<string[]> {
  await page.route(`**/__fixtures/${file}`, (route) =>
    route.fulfill({ path: testPath('fixtures', file), contentType: 'application/octet-stream' })
  )
  return page.evaluate(async (file) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Editor unavailable')
    const response = await fetch(`/__fixtures/${file}`)
    await store.openFigFile(new File([await response.arrayBuffer()], file))
    return store.graph.getPages().map((page) => page.id)
  }, file)
}

/** Waits until every artboard's frame has loaded and its fonts are in, then for two frames. */
async function settle(page: Page, canvas: CanvasHelper): Promise<void> {
  await page.waitForLoadState('networkidle')
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue
    await frame.waitForLoadState('load')
    await frame.evaluate(() => document.fonts.ready.then(() => undefined))
  }
  await canvas.waitForRender()
  await canvas.waitForRender()
}

for (const { file, large } of FIXTURES) {
  test(`${file} pages draw as before`, async ({ page }) => {
    test.skip(large && !process.env.CI, 'Large fixtures run on CI only')
    test.setTimeout(large ? 600_000 : 120_000)
    const canvas = new CanvasHelper(page)
    await page.goto('/?test&no-chrome&no-rulers')
    await canvas.waitForInit()
    const pages = await openFixture(page, file)

    for (const [index, pageId] of pages.entries()) {
      await page.evaluate(async (pageId) => {
        const store = window.kalka?.getStore?.()
        if (!store) throw new Error('Editor unavailable')
        await store.switchPage(pageId)
        store.zoomToFit()
      }, pageId)
      await settle(page, canvas)
      await expect(page.getByTestId('dom-scene')).toHaveScreenshot(
        `${file.replace(/\.fig$/, '')}-${index + 1}.png`,
        { maxDiffPixelRatio: 0.001, timeout: 30_000 }
      )
    }
    canvas.assertNoErrors()
  })
}
