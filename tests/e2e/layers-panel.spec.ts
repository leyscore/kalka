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
    return nodeTree(graph.rootId)
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
  expect(names).toEqual(
    expect.arrayContaining(['Desktop', 'Blue card', 'Green circle', 'Orange rect', 'Purple pill'])
  )
  expect(names).toHaveLength(5)
})

test('clicking a node inside a frame does not reparent it', async () => {
  // Blue card is visually inside Desktop but is a root sibling
  // Clicking it should NOT reparent it under Desktop
  const beforeTree = await getSceneTree()
  const rootChildNames = beforeTree.children.map((c: any) => c.name)
  expect(rootChildNames).toContain('Blue card')

  // Click on Blue card (at ~270, 220 in canvas coords — center of 150,140 + 240,160)
  await canvas.click(270, 220)
  await canvas.waitForRender()

  // Blue card should still be a root child, not reparented under Desktop
  const afterTree = await getSceneTree()
  const afterRootChildNames = afterTree.children.map((c: any) => c.name)
  expect(afterRootChildNames).toContain('Blue card')

  // Desktop should still have no children
  const desktop = afterTree.children.find((c: any) => c.name === 'Desktop')
  expect(desktop.children).toHaveLength(0)

  canvas.assertNoErrors()
})

test('creating a shape updates layers', async () => {
  await canvas.drawRect(600, 500, 50, 50)
  const names = await getLayerNames()
  expect(names).toContain('Rectangle')
  expect(names).toHaveLength(6)

  await canvas.undo()
  const after = await getLayerNames()
  expect(after).toHaveLength(5)
  expect(after).not.toContain('Rectangle')
})

test('Shift+A wraps selection in auto-layout frame', async () => {
  await canvas.click(400, 300)
  await canvas.selectAll()
  expect(await getSelectedCount()).toBe(5)

  // Snapshot layer names before
  const before = await getLayerNames()

  await page.keyboard.press('Shift+A')
  await canvas.waitForRender()

  // Scene graph has the frame
  const tree = await getSceneTree()
  expect(tree.children).toHaveLength(1)
  expect(tree.children[0].name).toBe('Frame')
  expect(tree.children[0].type).toBe('FRAME')
  expect(tree.children[0].children.length).toBe(5)

  // Layers panel MUST have changed — old names should be gone
  const after = await getLayerNames()
  expect(after).not.toEqual(before)
  expect(after).toContain('Frame')

  // Old root-level items should NOT be visible (they're children of collapsed Frame)
  expect(after).not.toContain('Desktop')

  canvas.assertNoErrors()
})

test('grouping updates layers', async () => {
  // Undo the auto-layout to restore flat structure
  await canvas.undo()
  await canvas.waitForRender()

  await canvas.click(400, 300)
  await canvas.selectAll()
  expect(await getSelectedCount()).toBe(5)

  await page.keyboard.press('Meta+g')
  await canvas.waitForRender()

  const tree = await getSceneTree()
  expect(tree.children).toHaveLength(1)
  expect(tree.children[0].name).toBe('Group')
  expect(tree.children[0].type).toBe('GROUP')

  const names = await getLayerNames()
  expect(names).toContain('Group')

  canvas.assertNoErrors()
})

test('ungrouping updates layers', async () => {
  await page.keyboard.press('Shift+Meta+g')
  await canvas.waitForRender()

  const names = await getLayerNames()
  expect(names).not.toContain('Group')
  expect(names).toHaveLength(5)
  expect(names).toContain('Desktop')

  canvas.assertNoErrors()
})
