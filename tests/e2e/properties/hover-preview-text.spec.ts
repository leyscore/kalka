import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

let page: Page
let canvas: CanvasHelper
let textId = ''

async function state() {
  return page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.getNode(id)
    const color = node?.fills[0]?.color
    return {
      fontFamily: node?.fontFamily,
      align: node?.textAlignHorizontal,
      verticalAlign: node?.textAlignVertical,
      letterSpacing: node?.letterSpacing,
      fillRed: color ? Math.round(color.r * 100) / 100 : null,
      bound: { ...node?.boundVariables },
      undoLabel: store.undo.undoLabel
    }
  }, textId)
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 1200 })
  await page.goto('/?test')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  textId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('TEXT', 100, 100, 320, 80)
    store.updateNode(id, {
      text: 'Hover preview',
      fontSize: 24,
      letterSpacing: 0,
      fills: [
        {
          type: 'SOLID' as const,
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL' as const
        }
      ]
    })
    const collection = store.graph.createCollection('Tokens')
    store.graph.createVariable('Tracking/Wide', 'FLOAT', collection.id, 6)
    store.graph.createVariable('Paint/Brand', 'COLOR', collection.id, {
      r: 1,
      g: 0.2,
      b: 0.1,
      a: 1
    })
    store.select([id])
    return id
  })
  await canvas.waitForRender()
})

test.afterAll(async () => {
  await page.close()
})

const typography = () => page.getByRole('region', { name: 'Typography', exact: true })

test('hovering text alignment previews it, leaving reverts it and a click commits it', async () => {
  const before = await state()
  const center = typography().getByRole('button', { name: 'Align center horizontally', exact: true })
  await center.hover()
  await expect.poll(async () => (await state()).align).toBe('CENTER')
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await page.mouse.move(600, 600)
  await expect.poll(async () => (await state()).align).toBe(before.align)
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await typography().getByRole('button', { name: 'Align right', exact: true }).hover()
  await expect.poll(async () => (await state()).align).toBe('RIGHT')
  await typography().getByRole('button', { name: 'Align right', exact: true }).click()
  await page.mouse.move(600, 600)
  await expect.poll(async () => (await state()).align).toBe('RIGHT')
  expect((await state()).undoLabel).toBe('Change text alignment')

  await canvas.pressKey('Meta+z')
  await expect.poll(async () => (await state()).align).toBe(before.align)
})

test('hovering vertical alignment previews it without a change', async () => {
  const before = await state()
  await typography().getByRole('button', { name: 'Align bottom', exact: true }).hover()
  await expect.poll(async () => (await state()).verticalAlign).toBe('BOTTOM')
  await page.mouse.move(600, 600)
  await expect.poll(async () => (await state()).verticalAlign).toBe(before.verticalAlign)
  expect((await state()).undoLabel).toBe(before.undoLabel)
})

test('hovering a font family previews it and Escape reverts it', async () => {
  const before = await state()
  await page.getByTestId('font-picker-trigger').click()
  const items = page.getByTestId('font-picker-item')
  await expect(items.nth(2)).toBeVisible()
  const family = (await items.nth(2).locator('span.truncate').textContent())?.trim() ?? ''
  expect(family).not.toBe(before.fontFamily)
  await items.nth(2).hover()
  await expect.poll(async () => (await state()).fontFamily, { timeout: 15_000 }).toBe(family)
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await page.keyboard.press('Escape')
  await expect.poll(async () => (await state()).fontFamily).toBe(before.fontFamily)
  expect((await state()).undoLabel).toBe(before.undoLabel)
})

test('hovering a number variable previews its value and choosing one binds it', async () => {
  const before = await state()
  const field = typography().locator('[data-property="letterSpacing"]')
  await field.getByRole('button', { name: 'Apply variable' }).click()
  await page.getByRole('option', { name: 'Tracking/Wide' }).hover()
  await expect.poll(async () => (await state()).letterSpacing).toBe(6)
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await page.keyboard.press('Escape')
  await expect.poll(async () => (await state()).letterSpacing).toBe(before.letterSpacing)
  expect((await state()).bound.letterSpacing).toBeUndefined()

  await field.getByRole('button', { name: 'Apply variable' }).click()
  await page.getByRole('option', { name: 'Tracking/Wide' }).click()
  await expect(field).toContainText('Tracking/Wide')
  expect((await state()).letterSpacing).toBe(6)
})

test('hovering a color variable previews it on the fill and Escape reverts it', async () => {
  const before = await state()
  const fill = page.getByRole('region', { name: 'Fill', exact: true })
  await fill.getByRole('button', { name: 'Apply variable' }).click()
  await page.getByRole('option', { name: 'Paint/Brand' }).hover()
  await expect.poll(async () => (await state()).fillRed).toBe(1)
  expect((await state()).undoLabel).toBe(before.undoLabel)

  await page.keyboard.press('Escape')
  await expect.poll(async () => (await state()).fillRed).toBe(0)
  expect((await state()).bound['fills/0/color']).toBeUndefined()
})
