import { test, expect, type Page } from '@playwright/test'

import { CanvasHelper } from '../helpers/canvas'

let page: Page
let canvas: CanvasHelper

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
  await page.goto('/')
  canvas = new CanvasHelper(page)
  await canvas.waitForInit()
})

test.afterAll(async () => {
  await page.close()
})

function layerRows() {
  return page.locator('[data-node-id]')
}

async function getLayerNames(): Promise<string[]> {
  const rows = layerRows()
  const count = await rows.count()
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).innerText()
    names.push(text.trim())
  }
  return names
}

async function getSceneTree() {
  return page.evaluate(() => {
    const store = (window as any).__OPEN_PENCIL_STORE__
    if (!store) return null
    const graph = store.graph

    function nodeTree(id: string): any {
      const node = graph.getNode(id)
      if (!node) return null
      return {
        name: node.name,
        type: node.type,
        children: node.childIds.map((cid: string) => nodeTree(cid)).filter(Boolean),
      }
    }
    return nodeTree(store.state.currentPageId)
  })
}

async function getSelectedCount(): Promise<number> {
  return page.evaluate(() => {
    const store = (window as any).__OPEN_PENCIL_STORE__
    return store.state.selectedIds.size
  })
}

test('demo layers visible in panel', async () => {
  const names = await getLayerNames()
  expect(names).toContain('Design System')
})

test('clicking a node inside a frame does not reparent it', async () => {
  // Hero card is inside Desktop frame — clicking it should select it, not reparent
  const beforeTree = await getSceneTree()
  const section = beforeTree.children.find((c: any) => c.name === 'Design System')
  const desktop = section.children.find((c: any) => c.name === 'Desktop')
  const heroCard = desktop.children.find((c: any) => c.name === 'Hero card')
  expect(heroCard).toBeTruthy()

  // Click on Hero card area (section at 60,60 + desktop at 20,40 + hero at 24,80 + center offset)
  await canvas.click(350, 310)
  await canvas.waitForRender()

  // Hero card should still be a child of Desktop
  const afterTree = await getSceneTree()
  const afterSection = afterTree.children.find((c: any) => c.name === 'Design System')
  const afterDesktop = afterSection.children.find((c: any) => c.name === 'Desktop')
  expect(afterDesktop.children.find((c: any) => c.name === 'Hero card')).toBeTruthy()

  canvas.assertNoErrors()
})

test('creating a shape updates layers', async () => {
  const before = await getLayerNames()
  await canvas.drawRect(600, 500, 50, 50)
  const names = await getLayerNames()
  expect(names).toContain('Rectangle')
  expect(names.length).toBe(before.length + 1)

  await canvas.undo()
  const after = await getLayerNames()
  expect(after.length).toBe(before.length)
  expect(after).not.toContain('Rectangle')
})

test('Shift+A wraps selection in auto-layout frame', async () => {
  // Draw two loose rectangles for this test
  await canvas.drawRect(700, 600, 60, 60)
  await canvas.drawRect(800, 600, 60, 60)
  await canvas.selectAll()
  const count = await getSelectedCount()
  expect(count).toBeGreaterThanOrEqual(2)

  const before = await getLayerNames()

  await page.keyboard.press('Shift+A')
  await canvas.waitForRender()

  const tree = await getSceneTree()
  const autoFrame = tree.children.find((c: any) => c.name === 'Frame' && c.type === 'FRAME')
  expect(autoFrame).toBeTruthy()

  const after = await getLayerNames()
  expect(after).not.toEqual(before)
  expect(after).toContain('Frame')

  canvas.assertNoErrors()
})

test('grouping updates layers', async () => {
  // Undo the auto-layout to restore flat structure
  await canvas.undo()
  await canvas.undo()
  await canvas.waitForRender()

  // Draw two rects and group them
  await canvas.drawRect(700, 600, 60, 60)
  await canvas.drawRect(800, 600, 60, 60)
  await canvas.selectAll()

  const beforeCount = await getSelectedCount()
  await page.keyboard.press('Meta+g')
  await canvas.waitForRender()

  const tree = await getSceneTree()
  const group = tree.children.find((c: any) => c.name === 'Group' && c.type === 'GROUP')
  expect(group).toBeTruthy()

  const names = await getLayerNames()
  expect(names).toContain('Group')

  canvas.assertNoErrors()
})

test('ungrouping updates layers', async () => {
  await page.keyboard.press('Shift+Meta+g')
  await canvas.waitForRender()

  const names = await getLayerNames()
  expect(names).not.toContain('Group')
  expect(names).toContain('Rectangle')

  canvas.assertNoErrors()
})
