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

test('Compare changes lists the layers and variables a version differs by', async ({ page }) => {
  const id = await open(page)
  await page.getByTestId('left-panel-history-tab').click()
  const history = page.getByTestId('checkpoint-history')
  await history.getByTestId('checkpoint-name').fill('First draft')
  await history.getByTestId('checkpoint-save').click()
  const version = history.locator('[data-slot="checkpoint"]').first()
  await expect(version).toContainText('First draft')

  await page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    store?.graph.updateNode(nodeId, { name: 'Card', width: 320 })
    const colors = store?.graph.createCollection('Colors')
    if (colors) store?.graph.createVariable('brand', 'COLOR', colors.id)
  }, id)

  await version.getByTestId('checkpoint-compare').click()
  const dialog = page.getByTestId('compare-changes')
  await expect(dialog).toBeVisible()
  const change = dialog.locator('[data-slot="compare-change"]')
  await expect(change).toHaveCount(1)
  await expect(change).toHaveAttribute('data-kind', 'changed')
  await expect(change).toContainText('Card')
  await expect(change).toContainText(/Nom|Name/)
  // Variables are listed after the layers, a collection with the variables it brings.
  const variable = dialog.locator('[data-slot="compare-variable"]')
  await expect(variable).toHaveCount(1)
  await expect(variable).toHaveAttribute('data-kind', 'added')
  await expect(variable).toContainText('Colors')
  await expect(variable).toContainText(/: 1/)
  await change.click()
  await expect(dialog.locator('[data-slot="compare-side"] img')).toHaveCount(2)
  await dialog.getByTestId('compare-overlay').click()
  await expect(dialog.locator('[data-slot="compare-overlay"] img')).toHaveCount(2)

  await dialog.getByTestId('compare-show').click()
  await expect(dialog).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => [...(window.kalka?.getStore?.()?.state.selectedIds ?? [])]))
    .toEqual([id])
})

test('a version shows its name and time, and restoring it asks first', async ({ page }) => {
  const id = await open(page)
  await page.evaluate((nodeId) => {
    window.kalka?.getStore?.()?.graph.updateNode(nodeId, { name: 'Hero' })
  }, id)

  await page.getByTestId('left-panel-history-tab').click()
  const history = page.getByTestId('checkpoint-history')
  const name = history.getByTestId('checkpoint-name')
  // The name field keeps room to type in, beside its button.
  expect((await name.boundingBox())?.width ?? 0).toBeGreaterThan(100)
  await name.fill('Before test')
  await history.getByTestId('checkpoint-save').click()
  const version = history.locator('[data-slot="checkpoint"]').first()
  const label = version.getByText('Before test')
  await expect(label).toBeVisible()
  expect((await label.boundingBox())?.width ?? 0).toBeGreaterThan(40)

  await page.evaluate((nodeId) => {
    window.kalka?.getStore?.()?.graph.updateNode(nodeId, { name: 'Changed' })
  }, id)
  await version.getByTestId('checkpoint-restore').click()
  const confirm = page.getByRole('alertdialog')
  await expect(confirm).toBeVisible()
  await confirm.getByRole('button', { name: 'Cancel' }).click()
  expect(await layerName(page, id)).toBe('Changed')

  await version.getByTestId('checkpoint-restore').click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Restore' }).click()
  await expect.poll(() => layerName(page, id)).toBe('Hero')
})
