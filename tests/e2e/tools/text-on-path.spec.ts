import { BLACK } from '@kalka/core/constants'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma Draw's text on a path: the Text tool pressed on a path writes along it.

const editor = useEditorSetupWithClear('/?test')

async function setup() {
  return editor.page.evaluate((black) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Board',
      x: 40,
      y: 40,
      width: 400,
      height: 240
    })
    const path = store.graph.createNode('VECTOR', frame.id, {
      name: 'Curve',
      x: 40,
      y: 100,
      width: 300,
      height: 60,
      strokes: [
        {
          type: 'SOLID',
          color: black,
          opacity: 1,
          visible: true,
          weight: 2,
          align: 'CENTER'
        }
      ],
      vectorNetwork: {
        vertices: [
          { x: 0, y: 60 },
          { x: 300, y: 60 }
        ],
        segments: [
          { start: 0, end: 1, tangentStart: { x: 100, y: -80 }, tangentEnd: { x: -100, y: -80 } }
        ],
        regions: []
      }
    })
    return { frame: frame.id, path: path.id }
  }, BLACK)
}

function layers(frame: string) {
  return editor.page.evaluate((frame) => {
    const store = window.kalka?.getStore?.()
    return (store?.graph.getChildren(frame) ?? []).map((node) => ({
      type: node.type,
      name: node.name,
      text: node.text,
      onPath: node.textPathData !== null,
      glyphs: node.derivedTextGlyphs?.length ?? 0
    }))
  }, frame)
}

async function toScreen(x: number, y: number) {
  const box = await editor.canvas.canvas.boundingBox()
  const view = await editor.page.evaluate(() => {
    const state = window.kalka?.getStore?.().state
    if (!state) throw new Error('Kalka store not initialized')
    return { zoom: state.zoom, panX: state.panX, panY: state.panY }
  })
  return {
    x: (box?.x ?? 0) + x * view.zoom + view.panX,
    y: (box?.y ?? 0) + y * view.zoom + view.panY
  }
}

test('the Text tool pressed on a path writes along it', async () => {
  const { page } = editor
  const { frame } = await setup()
  await page.keyboard.press('t')
  // The curve starts at (80, 200) on the page; its peak is near (230, 140).
  const point = await toScreen(230, 140)
  await page.mouse.click(point.x, point.y)
  // Typed at once, while the text is still being laid on the path: every key lands in it, over
  // the placeholder, and none picks a tool ("e" is the ellipse, "l" the line, "o" the ellipse).
  await page.keyboard.type('Hello')
  await expect.poll(async () => (await layers(frame))[0]?.text).toBe('Hello')
  expect(['TEXT', 'SELECT']).toContain(
    await page.evaluate(() => window.kalka?.getStore?.().state.activeTool)
  )
  // Once the editor has focus, keys type, delete and move the caret along the path too.
  await page.keyboard.type('!?')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Backspace')
  await expect.poll(async () => (await layers(frame))[0]?.text).toBe('Hello?')
  await page.keyboard.press('Delete')
  await expect.poll(async () => (await layers(frame))[0]?.text).toBe('Hello')
  await page.keyboard.press('Escape')
  await expect
    .poll(async () => (await layers(frame))[0])
    .toMatchObject({
      text: 'Hello',
      onPath: true,
      glyphs: 5
    })

  await editor.canvas.undo()
  await editor.canvas.undo()
  await expect
    .poll(async () => (await layers(frame)).map((layer) => layer.type))
    .toEqual(['VECTOR'])
  editor.canvas.assertNoErrors()
})

test('the Text tool shows its path cursor over a path and the text names its layer', async () => {
  const { page } = editor
  const { frame } = await setup()
  await page.keyboard.press('t')
  const cursor = () =>
    page.getByTestId('canvas-element').evaluate((element) => element.style.cursor)
  const point = await toScreen(230, 140)
  await page.mouse.move(point.x, point.y)
  await expect.poll(cursor).toContain('data:image/svg+xml')
  const empty = await toScreen(60, 260)
  await page.mouse.move(empty.x, empty.y)
  await expect.poll(cursor).not.toContain('data:image/svg+xml')

  await page.mouse.click(point.x, point.y)
  await expect
    .poll(async () => (await layers(frame))[0])
    .toMatchObject({
      name: 'Type something',
      onPath: true
    })
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('W')
  await expect.poll(async () => (await layers(frame))[0]?.text).toBe('W')
  await page.keyboard.press('Escape')
  await expect.poll(async () => (await layers(frame))[0]?.name).toBe('W')
  editor.canvas.assertNoErrors()
})
