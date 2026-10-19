import { readFile } from 'node:fs/promises'

import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'
import { artboardDrawing, showArtboard } from '#tests/helpers/canvas/artboard-tiers'

const editor = useEditorSetupWithClear('/?test')

interface Board {
  /** On screen when the view shows the near card. */
  near: string
  /** A few screens away: it sleeps and shows a snapshot. */
  mid: string
  /** Far away: it sleeps behind a placeholder. An auto layout stack that hugs its children. */
  far: string
  top: string
  bottom: string
  label: string
}

/** Three artboards in a row, the view on the first. */
async function createBoard(page: Page): Promise<Board> {
  const board = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const near = store.graph.createNode('FRAME', pageId, {
      name: 'Near card',
      x: 0,
      y: 0,
      width: 480,
      height: 320,
      fills: solid(1, 1, 1)
    })
    store.graph.createNode('TEXT', near.id, {
      x: 24,
      y: 24,
      width: 300,
      height: 30,
      text: 'Near label',
      fontSize: 20
    })
    const mid = store.graph.createNode('FRAME', pageId, {
      name: 'Mid card',
      x: 2400,
      y: 0,
      width: 480,
      height: 320,
      fills: solid(0.9, 0.95, 1)
    })
    store.graph.createNode('RECTANGLE', mid.id, {
      x: 40,
      y: 40,
      width: 200,
      height: 120,
      fills: solid(0.2, 0.4, 0.9)
    })
    const far = store.graph.createNode('FRAME', pageId, {
      name: 'Far stack',
      x: 9000,
      y: 0,
      width: 400,
      height: 400,
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'FIXED',
      itemSpacing: 10,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      fills: solid(1, 0.95, 0.9)
    })
    const top = store.graph.createNode('RECTANGLE', far.id, {
      name: 'Top',
      width: 360,
      height: 100,
      fills: solid(0.9, 0.3, 0.2)
    })
    const bottom = store.graph.createNode('RECTANGLE', far.id, {
      name: 'Bottom',
      width: 360,
      height: 100,
      fills: solid(0.2, 0.6, 0.3)
    })
    const label = store.graph.createNode('TEXT', far.id, {
      name: 'Far label',
      width: 360,
      height: 30,
      text: 'Far label',
      fontSize: 20
    })
    store.clearSelection()
    store.requestRender()
    return {
      near: near.id,
      mid: mid.id,
      far: far.id,
      top: top.id,
      bottom: bottom.id,
      label: label.id
    }
  })
  // Artboards wake as the view rests near them, and sleep far from it.
  await showArtboard(page, board.near)
  await expect.poll(async () => (await artboardDrawing(page, board.near)).painted).toBe(true)
  await expect.poll(async () => (await artboardDrawing(page, board.far)).live).toBe(false)
  await expect.poll(async () => (await artboardDrawing(page, board.mid)).live).toBe(false)
  return board
}

function nodeGeometry(page: Page, id: string) {
  return page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    const node = store?.graph.getNode(nodeId)
    if (!store || !node) throw new Error(`Missing node ${nodeId}`)
    return { visible: node.visible, width: node.width, height: node.height, text: node.text }
  }, id)
}

/** Where a layer's centre is on the canvas, in the canvas area's own pixels. */
function screenCenter(page: Page, id: string) {
  return page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    const node = store?.graph.getNode(nodeId)
    if (!store || !node) throw new Error(`Missing node ${nodeId}`)
    const position = store.graph.getAbsolutePosition(nodeId)
    const { zoom, panX, panY } = store.state
    return {
      x: (position.x + node.width / 2) * zoom + panX,
      y: (position.y + node.height / 2) * zoom + panY
    }
  }, id)
}

async function wake(page: Page, id: string) {
  await showArtboard(page, id)
  await expect.poll(async () => (await artboardDrawing(page, id)).painted).toBe(true)
}

test('artboards far from the view sleep behind a snapshot or a placeholder and wake as it reaches them', async () => {
  const { page } = editor
  const board = await createBoard(page)
  expect(await artboardDrawing(page, board.near)).toMatchObject({
    tier: 'visible',
    live: true,
    painted: true,
    standIn: null
  })
  // A few screens away it shows a snapshot; farther, a placeholder of its fill.
  await expect.poll(async () => (await artboardDrawing(page, board.mid)).standIn).toBe('canvas')
  expect(await artboardDrawing(page, board.far)).toMatchObject({
    tier: 'dormant',
    live: false,
    standIn: 'div'
  })

  await wake(page, board.far)
  const far = await artboardDrawing(page, board.far)
  expect(far).toMatchObject({ tier: 'visible', standIn: null })
  expect(far.text).toContain('Far label')
  // The artboard the view left goes to sleep in turn.
  await expect.poll(async () => (await artboardDrawing(page, board.near)).live).toBe(false)
  editor.canvas.assertNoErrors()
})

/** The height the browser draws an artboard's own element at, in its live document. */
function drawnHeight(page: Page, id: string) {
  return page.evaluate((artboardId) => {
    const frame = document.querySelector<HTMLIFrameElement>(
      `iframe[data-kalka-artboard="${artboardId}"]`
    )
    const root = frame?.contentDocument?.body.firstElementChild
    return root ? Math.round(root.getBoundingClientRect().height) : 0
  }, id)
}

/** Never shown, the stack is laid out offscreen while the canvas idles: it hugs its layers. */
const HUGGED = 20 + 100 + 10 + 100 + 10 + 30 + 20

test('hiding a layer of a sleeping artboard from the layers panel lays it out offscreen', async () => {
  const { page, canvas } = editor
  const board = await createBoard(page)
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED)

  // The layers panel shows the layer once it is selected.
  await page.evaluate((id) => window.kalka?.getStore?.().select([id]), board.top)
  const row = page.locator(`[data-node-id="${board.top}"]`)
  await row.hover()
  await row.getByRole('button', { name: 'Hide' }).click()
  // Shortcuts go to the canvas again, not the layer tree.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

  // The stack hugs what is left, laid out without ever waking.
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED - 110)
  expect(await artboardDrawing(page, board.far)).toMatchObject({ live: false })

  // Woken, it draws the edit.
  await wake(page, board.far)
  await expect.poll(() => drawnHeight(page, board.far)).toBe(HUGGED - 110)
  canvas.assertNoErrors()
})

test('undo and redo apply to an artboard whether it sleeps or woke since the edit', async () => {
  const { page, canvas } = editor
  const board = await createBoard(page)
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED)

  // Edited while it sleeps.
  await page.evaluate(
    (id) => window.kalka?.getStore?.().updateNodeWithUndo(id, { height: 150 }),
    board.bottom
  )
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED + 50)
  expect(await artboardDrawing(page, board.far)).toMatchObject({ live: false })

  // Undone once awake: the graph and its document both go back.
  await wake(page, board.far)
  await expect.poll(() => drawnHeight(page, board.far)).toBe(HUGGED + 50)
  await page.evaluate(() => window.kalka?.getStore?.().undoAction())
  await expect.poll(async () => (await nodeGeometry(page, board.bottom)).height).toBe(100)
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED)
  await expect.poll(() => drawnHeight(page, board.far)).toBe(HUGGED)

  // Redone asleep again, it is laid out offscreen and draws the edit when it wakes.
  await showArtboard(page, board.near)
  await expect.poll(async () => (await artboardDrawing(page, board.far)).live).toBe(false)
  await page.evaluate(() => window.kalka?.getStore?.().redoAction())
  await expect.poll(async () => (await nodeGeometry(page, board.far)).height).toBe(HUGGED + 50)
  await wake(page, board.far)
  await expect.poll(() => drawnHeight(page, board.far)).toBe(HUGGED + 50)
  canvas.assertNoErrors()
})

test('selecting, hovering and editing text work in an artboard that woke', async () => {
  const { page, canvas } = editor
  const board = await createBoard(page)
  await wake(page, board.far)
  await canvas.waitForRender()

  const bottom = await screenCenter(page, board.bottom)
  await canvas.click(bottom.x, bottom.y)
  // A layer of a top-level frame is selected at once, as in Figma.
  await expect
    .poll(() => page.evaluate(() => [...(window.kalka?.getStore?.().state.selectedIds ?? [])]))
    .toEqual([board.bottom])

  const top = await screenCenter(page, board.top)
  const area = await canvas.canvas.boundingBox()
  if (!area) throw new Error('The canvas has no box')
  await page.mouse.move(area.x + top.x, area.y + top.y)
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.hoveredNodeId))
    .toBe(board.top)

  const label = await screenCenter(page, board.label)
  await canvas.dblclick(label.x, label.y)
  await canvas.waitForTextEditor()
  await canvas.pressKey('ControlOrMeta+a')
  await page.keyboard.type('Far label woke')
  await canvas.pressKey('Escape')
  await expect.poll(async () => (await nodeGeometry(page, board.label)).text).toBe('Far label woke')
  await expect
    .poll(async () => (await artboardDrawing(page, board.far)).text)
    .toContain('Far label woke')
  canvas.assertNoErrors()
})

test('a sleeping artboard exports as it draws', async () => {
  const { page, canvas } = editor
  const board = await createBoard(page)
  await page.evaluate((id) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.graph.updateNode(id, { exportSettings: [{ scale: 1, format: 'png' }] })
    store.select([id])
    // The export falls back to a download Playwright can capture.
    window.showSaveFilePicker = undefined
  }, board.far)
  expect(await artboardDrawing(page, board.far)).toMatchObject({ live: false })

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-button').click()
  ])
  expect(download.suggestedFilename()).toBe('Far stack@1x.png')
  const path = await download.path()
  const png = await readFile(path)
  // The PNG header holds its size: the stack's, laid out with all three layers.
  const { width, height } = await nodeGeometry(page, board.far)
  expect(png.readUInt32BE(16)).toBe(width)
  expect(png.readUInt32BE(20)).toBe(height)
  expect(await artboardDrawing(page, board.far)).toMatchObject({ live: false })
  canvas.assertNoErrors()
})
