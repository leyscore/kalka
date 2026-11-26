import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

test('a frame switches the layers inside it to another variable mode', async ({ page }) => {
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
  const { screen, card } = await page.evaluate(() => {
    const editor = window.kalka?.getStore?.()
    if (!editor) throw new Error('Editor unavailable')
    const collection = editor.graph.createCollection('Theme')
    editor.renameMode(collection.id, collection.defaultModeId, 'Light')
    const surface = editor.graph.createVariable('Surface', 'COLOR', collection.id, {
      r: 1,
      g: 1,
      b: 1,
      a: 1
    })
    const dark = editor.addMode(collection.id, 'Dark')
    if (!dark) throw new Error('No mode')
    editor.updateVariableValue(surface.id, dark, { r: 0, g: 0, b: 0, a: 1 })
    const screen = editor.createShape('FRAME', 100, 100, 300, 400)
    const card = editor.createShape('RECTANGLE', 120, 120, 200, 100, screen)
    editor.bindVariable(card, 'fills/0/color', surface.id)
    editor.select([screen])
    return { screen, card }
  })
  const state = () =>
    page.evaluate(
      ({ screen, card }) => {
        const graph = window.kalka?.getStore?.().graph
        return {
          modes: Object.values(graph?.getNode(screen)?.variableModes ?? {}),
          red: graph?.getNode(card)?.fills[0]?.color.r
        }
      },
      { screen, card }
    )

  const appearance = page.getByRole('region', { name: 'Appearance', exact: true })
  await appearance.getByRole('button', { name: 'Apply variable mode' }).click()
  await page.getByRole('menuitem', { name: 'Dark' }).click()
  await expect.poll(state).toEqual({ modes: [expect.any(String)], red: 0 })

  const select = appearance.getByRole('combobox', { name: 'Change the mode of Theme' })
  await expect(select).toHaveText('Dark')

  // One undo step gives the frame back the mode around it.
  await appearance.getByRole('heading', { name: 'Appearance' }).click()
  await page.keyboard.press('ControlOrMeta+z')
  await expect.poll(state).toEqual({ modes: [], red: 1 })
  await expect(select).toBeHidden()

  await page.keyboard.press('ControlOrMeta+Shift+KeyZ')
  await expect.poll(state).toEqual({ modes: [expect.any(String)], red: 0 })
  await select.click()
  await page.getByRole('option', { name: 'Auto (Light)' }).click()
  await expect.poll(state).toEqual({ modes: [], red: 1 })
})
