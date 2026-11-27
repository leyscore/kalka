import { readFileSync } from 'node:fs'

import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'
import { repoPath } from '#tests/helpers/paths'

// Panel labels follow the chosen language, which loads after the panels' modules.

const Catalog = v.record(v.string(), v.unknown())

/** A French catalog's top-level strings. */
function french(catalog: string): Record<string, string> {
  const text = readFileSync(repoPath(`packages/vue/src/i18n/locales/fr/${catalog}.json`), 'utf8')
  const entries = Object.entries(v.parse(v.pipe(v.string(), v.parseJson(), Catalog), text))
  return Object.fromEntries(
    entries.flatMap(([key, value]) => (typeof value === 'string' ? [[key, value]] : []))
  )
}

async function openInFrench(page: Page) {
  await page.addInitScript(() => localStorage.setItem('kalka-locale', 'fr'))
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

test('effect types are named in the chosen language', async ({ page }) => {
  const panels = french('panels')
  await openInFrench(page)
  await page.evaluate(() => {
    const editor = window.kalka?.getStore?.()
    if (!editor) throw new Error('Editor unavailable')
    const id = editor.createShape('RECTANGLE', 100, 100, 180, 120)
    editor.updateNode(id, {
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 4 },
          radius: 12,
          spread: 0,
          visible: true
        }
      ]
    })
    editor.select([id])
  })
  const section = page.getByRole('region', { name: panels.effects, exact: true })
  await section.locator('[data-property="effect-type"]').click()
  await expect(page.getByRole('option', { name: panels.dropShadow, exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: panels.layerBlur, exact: true })).toBeVisible()
})

test('the image fill picker is named in the chosen language', async ({ page }) => {
  const effects = french('effects')
  await openInFrench(page)
  await page.evaluate(() => {
    const editor = window.kalka?.getStore?.()
    if (!editor) throw new Error('Editor unavailable')
    const id = editor.createShape('RECTANGLE', 100, 100, 180, 120)
    editor.select([id])
  })
  await page.getByTestId('fill-picker-swatch').first().click()
  await page.getByTestId('fill-picker-tab-image').click()
  const picker = page.locator('[data-picker-content]')
  await expect(picker.getByTestId('fill-picker-choose-image')).toHaveText(effects.chooseImage)
  await picker.getByRole('combobox').click()
  for (const key of ['imageFill', 'imageFit', 'imageCrop', 'imageTile'])
    await expect(page.getByRole('option', { name: effects[key], exact: true })).toBeVisible()
})
