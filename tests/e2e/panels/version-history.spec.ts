import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'

/**
 * Version history for a file Git does not keep: a version named by hand, a preview of it in a
 * tab of its own that changes nothing, and restoring it from that preview.
 */

async function open(page: Page) {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const reply = await page.evaluate(() =>
    window.kalka?.test?.automation?.('tool', {
      name: 'write_html',
      args: {
        html: '<div style="width: 200px; height: 120px; background: #F4EFE6"></div>',
        x: 0,
        y: 0
      }
    })
  )
  return v.parse(
    v.object({ result: v.object({ layers: v.array(v.object({ id: v.string() })) }) }),
    reply
  ).result.layers[0].id
}

const layerName = (page: Page, id: string) =>
  page.evaluate((nodeId) => window.kalka?.getStore?.()?.graph.getNode(nodeId)?.name ?? null, id)

test('a named version is previewed in its own tab, then restored from there', async ({ page }) => {
  const id = await open(page)
  await page.evaluate((nodeId) => {
    window.kalka?.getStore?.()?.graph.updateNode(nodeId, { name: 'Hero' })
  }, id)

  await page.getByTestId('left-panel-history-tab').click()
  const history = page.getByTestId('checkpoint-history')
  await history.getByTestId('checkpoint-name').fill('Before the redesign')
  await history.getByTestId('checkpoint-save').click()
  const version = history.locator('[data-slot="checkpoint"]').first()
  await expect(version).toContainText('Before the redesign')

  await page.evaluate((nodeId) => {
    window.kalka?.getStore?.()?.graph.updateNode(nodeId, { name: 'Redesigned hero' })
  }, id)

  await version.getByTestId('checkpoint-preview').click()
  const banner = page.getByTestId('checkpoint-preview-banner')
  await expect(banner).toBeVisible()
  // The preview is the version, open to view only.
  expect(await layerName(page, id)).toBe('Hero')
  expect(await page.evaluate(() => window.kalka?.getStore?.()?.state.viewOnly)).toBe(true)

  await banner.getByTestId('checkpoint-preview-restore').click()
  await expect(banner).toHaveCount(0)
  await expect.poll(() => layerName(page, id)).toBe('Hero')
  expect(await page.evaluate(() => window.kalka?.getStore?.()?.state.viewOnly)).toBeFalsy()
})
