import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

let page: Page
let canvas: CanvasHelper
let textId = ''

test.describe.configure({ mode: 'serial' })

/** The text layer's spacing and paragraphs, as the panel and the editor leave them. */
function textState(id: string) {
  return page.evaluate((nodeId) => {
    const node = window.kalka?.getStore?.().graph.getNode(nodeId)
    if (!node) throw new Error('No text layer')
    return {
      text: node.text,
      fontSize: node.fontSize,
      lineHeight: node.lineHeight,
      lineHeightUnit: node.lineHeightUnit,
      letterSpacing: node.letterSpacing,
      letterSpacingUnit: node.letterSpacingUnit,
      paragraphSpacing: node.paragraphSpacing,
      lists: node.listLines.map((line) => line.type)
    }
  }, id)
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  await canvas.clearCanvas()
  textId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const board = store.graph.createNode('FRAME', pageId, { width: 600, height: 400 })
    const text = store.graph.createNode('TEXT', board.id, {
      x: 40,
      y: 40,
      width: 400,
      textAutoResize: 'HEIGHT',
      fontSize: 20,
      text: 'Intro\nOne\nTwo'
    })
    store.runLayoutForNode(text.id)
    store.select([text.id])
    return text.id
  })
  await canvas.waitForRender()
})

test.afterAll(async () => {
  await page.close()
})

test('line height and letter spacing take a percentage, and keep it with the font size', async () => {
  const typography = page.getByRole('region', { name: 'Typography' })
  const lineHeight = typography.getByRole('spinbutton', { name: 'Line height' })
  await lineHeight.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('150%')
  await page.keyboard.press('Enter')
  await expect
    .poll(() => textState(textId))
    .toMatchObject({
      lineHeight: 30,
      lineHeightUnit: 'PERCENT'
    })

  const letterSpacing = typography.getByRole('spinbutton', { name: 'Letter spacing' })
  await letterSpacing.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('5%')
  await page.keyboard.press('Enter')

  const fontSize = typography.getByRole('spinbutton', { name: 'Font size' })
  await fontSize.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('40')
  await page.keyboard.press('Enter')
  await expect
    .poll(() => textState(textId))
    .toMatchObject({
      fontSize: 40,
      lineHeight: 60,
      lineHeightUnit: 'PERCENT',
      letterSpacing: 2,
      letterSpacingUnit: 'PERCENT'
    })
  canvas.assertNoErrors()
})

test('paragraph spacing and the list buttons set the text apart as HTML paragraphs and lists', async () => {
  const typography = page.getByRole('region', { name: 'Typography' })
  const spacing = typography.getByRole('spinbutton', { name: 'Paragraph spacing' })
  await spacing.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('12')
  await page.keyboard.press('Enter')

  await typography
    .getByRole('group', { name: 'List' })
    .getByRole('button', { name: 'Numbered list' })
    .click()
  await expect
    .poll(() => textState(textId))
    .toMatchObject({
      paragraphSpacing: 12,
      lists: ['ORDERED', 'ORDERED', 'ORDERED']
    })
  await canvas.waitForRender()
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  await expect(artboard.locator('ol > li')).toHaveCount(3)

  await page.keyboard.press('ControlOrMeta+Z')
  await expect.poll(() => textState(textId)).toMatchObject({ lists: [] })
  canvas.assertNoErrors()
})

test('typing "- " starts a bulleted item, and Enter on an empty item leaves the list', async () => {
  await page.evaluate((id) => window.kalka?.getStore?.().startTextEditing(id), textId)
  await canvas.waitForTextEditor()
  // The edit starts with every character selected: typing replaces them.
  await page.keyboard.type('Intro')
  await page.keyboard.press('Enter')
  await page.keyboard.type('- Item')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Next')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('After')
  await expect
    .poll(() => textState(textId))
    .toMatchObject({
      text: 'Intro\nItem\nNext\nAfter',
      lists: ['NONE', 'UNORDERED', 'UNORDERED', 'NONE']
    })
  await page.keyboard.press('Escape')
  await canvas.waitForRender()
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  await expect(artboard.locator('ul > li')).toHaveCount(2)
  canvas.assertNoErrors()
})

test('list spacing sets the items of a list apart, and undoes in one step', async () => {
  const height = () =>
    page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.height ?? 0, textId)
  const before = await height()
  const typography = page.getByRole('region', { name: 'Typography' })
  const spacing = typography.getByRole('spinbutton', { name: 'List spacing' })
  await spacing.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('8')
  await page.keyboard.press('Enter')
  await expect
    .poll(() =>
      page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.listSpacing, textId)
    )
    .toBe(8)
  await canvas.waitForRender()
  const artboard = page.locator('iframe[data-kalka-artboard]').contentFrame()
  await expect(artboard.locator('ul > li').first()).toHaveCSS('margin-bottom', '8px')
  await expect(artboard.locator('ul > li').last()).toHaveCSS('margin-bottom', '0px')
  // The text hugs its height, so the space between the two items grows it.
  await expect.poll(height).toBeCloseTo(before + 8, 0)

  await page.keyboard.press('ControlOrMeta+Z')
  await expect
    .poll(() =>
      page.evaluate((id) => window.kalka?.getStore?.().graph.getNode(id)?.listSpacing, textId)
    )
    .toBe(0)
  canvas.assertNoErrors()
})
