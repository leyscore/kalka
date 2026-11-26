import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('binds a shadow’s blur and colour to variables, which follow the mode', async ({ page }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const { id, collectionId, dark } = await page.evaluate(() => {
    const editor = window.kalka?.getStore?.()
    if (!editor) throw new Error('Editor unavailable')
    const collection = editor.graph.createCollection('Elevation')
    const dark = 'dark'
    editor.graph.addMode(collection.id, dark, 'Dark')
    const blur = editor.graph.createVariable('Blur/Md', 'FLOAT', collection.id, 24)
    editor.graph.variables.set(blur.id, {
      ...blur,
      valuesByMode: { ...blur.valuesByMode, [dark]: 40 }
    })
    editor.graph.createVariable('Shadow/Soft', 'COLOR', collection.id, {
      r: 0.1,
      g: 0.2,
      b: 0.6,
      a: 0.5
    })
    const id = editor.createShape('RECTANGLE', 100, 100, 180, 120)
    editor.updateNode(id, {
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 4 },
          radius: 4,
          spread: 0,
          visible: true
        }
      ]
    })
    editor.select([id])
    return { id, collectionId: collection.id, dark }
  })
  const effect = () =>
    page.evaluate((nodeId) => {
      const node = window.kalka?.getStore?.().graph.getNode(nodeId)
      return { effect: node?.effects[0], bound: Object.keys(node?.boundVariables ?? {}) }
    }, id)

  const section = page.getByRole('region', { name: 'Effects', exact: true })
  await section.locator('[data-property="effect-expand"]').click()
  const radius = section.locator('[data-property="effects/0/radius"]')
  await radius.getByRole('button', { name: 'Apply variable' }).click()
  await page.getByRole('option', { name: 'Blur/Md' }).click()
  await expect(radius).toHaveAttribute('data-bound')
  await expect.poll(async () => (await effect()).effect?.radius).toBe(24)

  await section
    .locator('[data-slot="effect-settings"]')
    .getByRole('button', { name: 'Apply variable' })
    .last()
    .click()
  await page.getByRole('option', { name: 'Shadow/Soft' }).click()
  await expect(section).toContainText('Shadow/Soft')
  await expect
    .poll(async () => (await effect()).effect?.color)
    .toEqual({ r: 0.1, g: 0.2, b: 0.6, a: 0.5 })
  expect((await effect()).bound.sort()).toEqual(['effects/0/color', 'effects/0/radius'])

  await page.evaluate(
    ({ collection, mode }) => window.kalka?.getStore?.().setActiveMode(collection, mode),
    { collection: collectionId, mode: dark }
  )
  await expect.poll(async () => (await effect()).effect?.radius).toBe(40)
})
