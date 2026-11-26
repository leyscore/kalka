import { expect, test, type Page } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'
import { propertySection } from '#tests/helpers/properties'

let page: Page
let canvas: CanvasHelper
let targetId = ''

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
  targetId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const fill = store.graph.createNode('RECTANGLE', pageId, {
      name: 'Brand/Primary',
      fills: [
        {
          type: 'SOLID',
          color: { r: 0.9, g: 0.2, b: 0.15, a: 1 },
          opacity: 1,
          visible: true
        }
      ],
      sharedStyleType: 'FILL',
      internalOnly: true
    })
    fill.source.id = '1:100'
    const text = store.graph.createNode('TEXT', pageId, {
      name: 'Type/Display',
      fontFamily: 'Inter',
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 38,
      sharedStyleType: 'TEXT',
      internalOnly: true
    })
    text.source.id = '1:101'
    const effect = store.graph.createNode('RECTANGLE', pageId, {
      name: 'Effects/Card',
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 6 },
          radius: 12,
          spread: 0,
          visible: true
        }
      ],
      sharedStyleType: 'EFFECT',
      internalOnly: true
    })
    effect.source.id = '1:102'
    const grid = store.graph.createNode('FRAME', pageId, {
      name: 'Grid/12 columns',
      layoutGrids: [{ pattern: 'COLUMNS', count: 12, gutterSize: 16, visible: true }],
      sharedStyleType: 'GRID',
      internalOnly: true
    })
    grid.source.id = '1:103'
    const target = store.graph.createNode('FRAME', pageId, {
      name: 'Style target',
      x: 120,
      y: 100,
      width: 240,
      height: 160
    })
    store.select([target.id])
    store.requestRender()
    return target.id
  })
  await canvas.waitForRender()
})

test.afterAll(async () => {
  await page.close()
})

/** Applies a style from a section's Style button, as Figma's style picker. */
async function chooseStyle(kind: string, option: string) {
  await page.getByTestId(`${kind}-style-picker`).click()
  await page
    .getByTestId(`${kind}-style-picker-content`)
    .locator(`[data-${kind}-style=${JSON.stringify(option)}]`)
    .click()
  await canvas.waitForRender()
}

async function targetStyles(id = targetId) {
  return page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.getNode(nodeId)
    return node
      ? {
          fillStyleId: node.fillStyleId,
          strokeStyleId: node.strokeStyleId,
          textStyleId: node.textStyleId,
          effectStyleId: node.effectStyleId,
          gridStyleId: node.gridStyleId,
          fillColor: node.fills[0]?.color,
          effects: node.effects.length,
          grids: node.layoutGrids.length,
          fontSize: node.fontSize
        }
      : null
  }, id)
}

test('unbound paint styles use one Style button in the section header', async () => {
  for (const [section, kind] of [
    ['Fill', 'fill'],
    ['Stroke', 'stroke'],
    ['Effects', 'effect']
  ]) {
    const panel = propertySection(page, section)
    await expect(panel.getByTestId(`${kind}-style-picker`)).toHaveCount(1)
    await expect(panel.getByTestId(`applied-${kind}-style`)).toHaveCount(0)
    await expect(panel).toHaveScreenshot(`${section.toLowerCase()}-unbound-style.png`)
  }
})

test('applies fill, stroke, effect, and grid styles from local definitions', async () => {
  await chooseStyle('fill', 'Brand/Primary')
  await chooseStyle('stroke', 'Brand/Primary')
  await chooseStyle('effect', 'Effects/Card')
  await chooseStyle('grid', 'Grid/12 columns')
  await expect(page.getByTestId('applied-fill-style')).toContainText('Primary')
  await expect(page.getByTestId('applied-grid-style')).toContainText('Grid/12 columns')
  await expect(propertySection(page, 'Fill')).toHaveScreenshot('fill-applied-style.png')
  await expect(propertySection(page, 'Effects')).toHaveScreenshot('effects-applied-style.png')

  expect(await targetStyles()).toMatchObject({
    fillStyleId: '1:100',
    strokeStyleId: '1:100',
    effectStyleId: '1:102',
    gridStyleId: '1:103',
    fillColor: { r: 0.9, g: 0.2, b: 0.15, a: 1 },
    effects: 1,
    grids: 1
  })
})

test('detaching keeps the values and undo restores the reference', async () => {
  await page.getByTestId('fill-style-detach').click()
  await canvas.waitForRender()
  expect(await targetStyles()).toMatchObject({ fillStyleId: null, fillColor: { r: 0.9 } })

  await canvas.pressKey('Meta+z')
  await canvas.waitForRender()
  expect(await targetStyles()).toMatchObject({ fillStyleId: '1:100', fillColor: { r: 0.9 } })
})

test('changing a stroke weight keeps its colour style', async () => {
  await page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    const node = store?.graph.getNode(nodeId)
    if (!store || !node) throw new Error('No target')
    store.updateNodeWithUndo(nodeId, {
      strokes: node.strokes.map((stroke) => ({ ...stroke, weight: 6 }))
    })
  }, targetId)
  expect((await targetStyles())?.strokeStyleId).toBe('1:100')
})

test('applies text styles and batches mixed selection binding', async () => {
  const textId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const text = store.graph.createNode('TEXT', store.state.currentPageId, {
      name: 'Text target',
      text: 'Shared style',
      x: 420,
      y: 120
    })
    store.select([text.id])
    return text.id
  })
  await canvas.waitForRender()
  // Typography picks text styles from Figma's Style button rather than a select.
  await page.getByTestId('text-style-picker').click()
  await page
    .getByTestId('text-style-picker-content')
    .locator('[data-text-style="Type/Display"]')
    .click()
  await canvas.waitForRender()
  expect(await targetStyles(textId)).toMatchObject({
    textStyleId: '1:101',
    fontSize: 30
  })

  const secondId = await page.evaluate((firstId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const second = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Second style target',
      x: 120,
      y: 320,
      width: 240,
      height: 120
    })
    store.select([firstId, second.id])
    return second.id
  }, targetId)
  await canvas.waitForRender()
  await chooseStyle('fill', 'Brand/Primary')
  expect((await targetStyles(targetId))?.fillStyleId).toBe('1:100')
  expect((await targetStyles(secondId))?.fillStyleId).toBe('1:100')

  await canvas.pressKey('Meta+z')
  await canvas.waitForRender()
  expect((await targetStyles(targetId))?.fillStyleId).toBe('1:100')
  expect((await targetStyles(secondId))?.fillStyleId).toBeNull()
})

test('creates a colour style from a fill and edits every layer using it', async () => {
  const [sourceId, otherId] = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const make = (y: number, r: number) =>
      store.graph.createNode('RECTANGLE', store.state.currentPageId, {
        x: 640,
        y,
        width: 120,
        height: 80,
        fills: [{ type: 'SOLID', color: { r, g: 0.4, b: 0.4, a: 1 }, opacity: 1, visible: true }]
      }).id
    const ids = [make(100, 0.2), make(240, 0.8)]
    store.select([ids[0] ?? ''])
    return ids
  })
  await canvas.waitForRender()
  await page.getByTestId('fill-style-picker').click()
  await page.getByTestId('fill-style-create').click()
  await page.getByTestId('fill-style-name').fill('Brand/Accent')
  await page.getByTestId('fill-style-create-submit').click()
  await expect(page.getByTestId('applied-fill-style')).toContainText('Accent')

  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), otherId)
  await chooseStyle('fill', 'Brand/Accent')
  const fills = (ids: string[]) =>
    page.evaluate(
      (nodeIds) =>
        nodeIds.map((id) => {
          const node = window.kalka?.getStore?.().graph.getNode(id)
          return { color: node?.fills[0]?.color, styled: !!node?.fillStyleId }
        }),
      ids
    )
  expect(await fills([sourceId ?? '', otherId ?? ''])).toEqual([
    { color: { r: 0.2, g: 0.4, b: 0.4, a: 1 }, styled: true },
    { color: { r: 0.2, g: 0.4, b: 0.4, a: 1 }, styled: true }
  ])

  await page.getByTestId('fill-style-edit').click()
  const hex = page.getByTestId('fill-style-editor').locator('[data-property="color-hex"]')
  await hex.fill('0000FF')
  await hex.press('Enter')
  await expect
    .poll(async () => (await fills([sourceId ?? '', otherId ?? ''])).map((fill) => fill.color))
    .toEqual([
      { r: 0, g: 0, b: 1, a: 1 },
      { r: 0, g: 0, b: 1, a: 1 }
    ])

  await page.keyboard.press('Escape')
  await page.evaluate(() => window.kalka?.getStore?.().undo.undo())
  expect((await fills([sourceId ?? '', otherId ?? ''])).map((fill) => fill.color?.b)).toEqual([
    0.4, 0.4
  ])
})

test('lists colour, effect and grid styles in Local styles when nothing is selected', async () => {
  await page.evaluate(() => window.kalka?.getStore?.().clearSelection())
  const local = page.getByTestId('local-styles')
  await expect(local.locator('[data-local-styles="FILL"]')).toContainText('Primary')
  await expect(local.locator('[data-local-fill-style="Brand/Accent"]')).toBeVisible()
  await expect(local.locator('[data-local-effect-style="Effects/Card"]')).toBeVisible()
  await expect(local.locator('[data-local-grid-style="Grid/12 columns"]')).toBeVisible()
  await local.locator('[data-local-effect-style="Effects/Card"]').click()
  await expect(page.getByTestId('effect-style-editor')).toBeVisible()
})

test('describes a style in its editor and duplicates it from Local styles', async () => {
  await page.keyboard.press('Escape')
  await page.evaluate(() => window.kalka?.getStore?.().clearSelection())
  const local = page.getByTestId('local-styles')
  const accent = local.locator('[data-local-fill-style="Brand/Accent"]')
  await accent.click()
  const description = page
    .getByTestId('fill-style-editor')
    .locator('[data-property="style-description"]')
  await description.fill('Links and focus rings')
  await description.blur()
  const described = () =>
    page.evaluate(() => {
      const store = window.kalka?.getStore?.()
      return [...(store?.graph.getAllNodes() ?? [])]
        .filter((node) => node.name === 'Brand/Accent' && node.sharedStyleType === 'FILL')
        .map((node) => node.symbolDescription)
    })
  await expect.poll(described).toEqual(['Links and focus rings'])
  await page.keyboard.press('Escape')

  await accent.hover()
  await accent.locator('xpath=..').getByTestId('fill-style-actions').click()
  await page.getByTestId('fill-style-duplicate').click()
  await expect(local.locator('[data-local-fill-style="Brand/Accent"]')).toHaveCount(2)
  await expect.poll(described).toEqual(['Links and focus rings', 'Links and focus rings'])
})
