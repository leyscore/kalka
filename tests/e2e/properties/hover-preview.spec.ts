import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { propertySection } from '#tests/helpers/properties'

let page: Page
let canvas: CanvasHelper
let rectId = ''

async function state() {
  return page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.getNode(id)
    return {
      blendMode: node?.blendMode,
      fillBlend: node?.fills[0]?.blendMode ?? 'NORMAL',
      shader: node?.shader?.preset ?? null,
      undoLabel: store.undo.undoLabel
    }
  }, rectId)
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  rectId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const rect = store.graph.createNode('RECTANGLE', store.state.currentPageId, {
      name: 'Hover preview',
      x: 160,
      y: 160,
      width: 160,
      height: 100,
      fills: [
        {
          type: 'SOLID' as const,
          color: { r: 0.85, g: 0.2, b: 0.15, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL' as const
        }
      ],
      shader: {
        preset: 'mesh-gradient' as const,
        colors: [
          { r: 0.2, g: 0.3, b: 0.9, a: 1 },
          { r: 0.9, g: 0.4, b: 0.6, a: 1 }
        ],
        params: {},
        speed: 0.5
      }
    })
    store.select([rect.id])
    return rect.id
  })
  await canvas.waitForRender()
})

test.afterAll(async () => {
  await page.close()
})

test('hovering a blend mode previews it on the canvas and leaves no trace', async () => {
  const before = await state()
  const blend = propertySection(page, 'Appearance').getByRole('combobox', { name: 'Blend mode' })
  await blend.click()
  await page.getByRole('option', { name: 'Multiply', exact: true }).hover()
  await expect.poll(async () => (await state()).blendMode).toBe('MULTIPLY')
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await page.getByRole('option', { name: 'Screen', exact: true }).hover()
  await expect.poll(async () => (await state()).blendMode).toBe('SCREEN')

  await page.keyboard.press('Escape')
  await expect.poll(async () => (await state()).blendMode).toBe(before.blendMode)
  expect((await state()).undoLabel).toBe(before.undoLabel)
})

test('choosing a hovered blend mode commits it as one undoable change', async () => {
  const before = await state()
  const blend = propertySection(page, 'Appearance').getByRole('combobox', { name: 'Blend mode' })
  await blend.click()
  await page.getByRole('option', { name: 'Multiply', exact: true }).hover()
  await page.getByRole('option', { name: 'Overlay', exact: true }).click()
  await expect.poll(async () => (await state()).blendMode).toBe('OVERLAY')
  expect((await state()).undoLabel).toBe('Change blend mode')

  await canvas.pressKey('Meta+z')
  await canvas.waitForRender()
  expect((await state()).blendMode).toBe(before.blendMode)
})

test('fill blend modes and shader presets preview on hover and commit on choice', async () => {
  const fillBlend = propertySection(page, 'Fill').getByRole('combobox', { name: 'Blend mode' })
  await fillBlend.click()
  await page.getByRole('option', { name: 'Multiply', exact: true }).hover()
  await expect.poll(async () => (await state()).fillBlend).toBe('MULTIPLY')
  await page.getByRole('option', { name: 'Screen', exact: true }).click()
  await expect.poll(async () => (await state()).fillBlend).toBe('SCREEN')

  const shader = page.locator('[data-property="shader-preset"]')
  await shader.click()
  await page.getByRole('option', { name: 'Warp', exact: true }).hover()
  await expect.poll(async () => (await state()).shader).toBe('warp')
  await page.keyboard.press('Escape')
  await expect.poll(async () => (await state()).shader).toBe('mesh-gradient')

  await shader.click()
  await page.getByRole('option', { name: 'Warp', exact: true }).hover()
  await page.getByRole('option', { name: 'Grain gradient', exact: true }).click()
  await expect.poll(async () => (await state()).shader).toBe('grain-gradient')
  expect((await state()).undoLabel).toBe('Change shader')
})
