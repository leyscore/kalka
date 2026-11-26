import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

let page: Page
let canvas: CanvasHelper
let titleId = ''
let otherId = ''

test.describe.configure({ mode: 'serial' })

function textState(id: string) {
  return page.evaluate((nodeId) => {
    const node = window.kalka?.getStore?.().graph.getNode(nodeId)
    if (!node) throw new Error('No text layer')
    return { fontSize: node.fontSize, textStyleId: node.textStyleId }
  }, id)
}

function select(id: string) {
  return page.evaluate((nodeId) => window.kalka?.getStore?.().select([nodeId]), id)
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await canvas.clearCanvas()
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const board = store.graph.createNode('FRAME', store.state.currentPageId, {
      width: 600,
      height: 400
    })
    const make = (y: number, fontSize: number, text: string) =>
      store.graph.createNode('TEXT', board.id, {
        x: 40,
        y,
        width: 400,
        textAutoResize: 'HEIGHT',
        fontSize,
        text
      })
    const title = make(40, 48, 'Title')
    const other = make(160, 16, 'Another title')
    store.runLayoutForNode(title.id)
    store.runLayoutForNode(other.id)
    return [title.id, other.id]
  })
  titleId = ids[0] ?? ''
  otherId = ids[1] ?? ''
  await canvas.waitForRender()
})

test.afterAll(async () => {
  await page.close()
})

test('creates a text style from a heading and applies it to another text', async () => {
  await select(titleId)
  await page.getByTestId('text-style-picker').click()
  await page.getByTestId('text-style-create').click()
  await page.getByTestId('text-style-name').fill('Heading/H1')
  await page.getByTestId('text-style-create-submit').click()
  await expect(page.getByTestId('applied-text-style')).toContainText('Heading/H1')
  const styleId = (await textState(titleId)).textStyleId
  expect(styleId).toBeTruthy()

  await select(otherId)
  await page.getByTestId('text-style-picker').click()
  const content = page.getByTestId('text-style-picker-content')
  await expect(content).toContainText('Heading')
  await content.locator('[data-text-style="Heading/H1"]').click()
  expect(await textState(otherId)).toEqual({ fontSize: 48, textStyleId: styleId })
})

test('editing the style updates every text that uses it, in one undo step', async () => {
  await page.getByTestId('text-style-edit').click()
  const size = page.getByTestId('text-style-editor').getByRole('spinbutton', { name: 'Font size' })
  await size.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('64')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await textState(titleId)).fontSize).toBe(64)
  expect((await textState(otherId)).fontSize).toBe(64)

  await page.keyboard.press('Escape')
  await page.evaluate(() => window.kalka?.getStore?.().undo.undo())
  expect((await textState(titleId)).fontSize).toBe(48)
  expect((await textState(otherId)).fontSize).toBe(48)
})

test('lists the style in Local styles when nothing is selected, and deletes it', async () => {
  await page.evaluate(() => window.kalka?.getStore?.().clearSelection())
  const local = page.getByTestId('local-styles')
  await expect(local.locator('[data-local-text-style="Heading/H1"]')).toBeVisible()
  await local.locator('[data-local-text-style="Heading/H1"]').hover()
  await local.getByTestId('text-style-actions').click()
  await page.getByRole('menuitem', { name: 'Delete style' }).click()
  await expect(local.locator('[data-local-text-style="Heading/H1"]')).toHaveCount(0)
  expect(await textState(titleId)).toEqual({ fontSize: 48, textStyleId: null })
})
