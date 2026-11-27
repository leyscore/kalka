import { expect, test } from '#tests/e2e/fixtures'
import { CanvasHelper } from '#tests/helpers/canvas'
import { testPath } from '#tests/helpers/paths'

test('Import from Figma on Home opens a .fig file chosen on disk', async ({ page }) => {
  // Playwright answers the file input that browsers without the File System Access API use;
  // it cannot answer Chromium's own file picker.
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'showOpenFilePicker')
  })
  await page.goto('/')
  await new CanvasHelper(page).waitForInit()
  await page.keyboard.press('ControlOrMeta+t')

  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Import from Figma…' }).click()
  await (await chooser).setFiles(testPath('fixtures', 'gold-preview.fig'))

  await expect(
    page.locator('[data-slot="tab-item"]').filter({ hasText: 'gold-preview' })
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        return store ? store.graph.getChildren(store.state.currentPageId).length : 0
      })
    )
    .toBeGreaterThan(0)
})
