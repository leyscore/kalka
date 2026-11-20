import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('the rail opens variables as a page over the editor and gives the canvas back', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const rectId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const collection = store.graph.createCollection('Brand')
    store.graph.createVariable('Color/Primary', 'COLOR', collection.id, {
      r: 0.1,
      g: 0.3,
      b: 0.9,
      a: 1
    })
    const id = store.createShape('RECTANGLE', 100, 100, 200, 120)
    store.select([id])
    return id
  })

  const rail = page.getByTestId('panel-rail-variables')
  const variablesPage = page.getByTestId('variables-page')
  await rail.click()
  await expect(variablesPage).toBeVisible()
  await expect(variablesPage.getByTestId('variable-row')).toHaveCount(1)
  await expect(rail).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('left-panel-layers-tab')).not.toHaveAttribute('data-active')
  await expect(page.getByTestId('variables-dialog')).toHaveCount(0)

  // The selected layer is under the page: its keys do not reach it.
  await page.keyboard.press('Delete')
  expect(await page.evaluate((id) => !!window.kalka?.getStore?.().graph.getNode(id), rectId)).toBe(
    true
  )

  // Another press of the rail button closes the page, as does choosing a panel.
  await rail.click()
  await expect(variablesPage).toBeHidden()
  await rail.click()
  await expect(variablesPage).toBeVisible()
  await page.getByTestId('left-panel-layers-tab').click()
  await expect(variablesPage).toBeHidden()
  await expect(page.getByTestId('left-panel-layers-tab')).toHaveAttribute('data-active', 'true')

  await rail.click()
  await page.keyboard.press('Escape')
  await expect(variablesPage).toBeHidden()
})
