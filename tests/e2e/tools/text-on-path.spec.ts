import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma Draw's text on a path: the Text tool pressed on a path writes along it.

const editor = useEditorSetupWithClear('/?test')

async function setup() {
  return editor.page.evaluate(() => {
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
          color: { r: 0, g: 0, b: 0, a: 1 },
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
  })
}

function layers(frame: string) {
  return editor.page.evaluate((frame) => {
    const store = window.kalka?.getStore?.()
    return (store?.graph.getChildren(frame) ?? []).map((node) => ({
      type: node.type,
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
  await expect.poll(async () => (await layers(frame)).map((layer) => layer.type)).toEqual(['TEXT'])
  expect((await layers(frame))[0]).toMatchObject({ onPath: true })
  expect((await layers(frame))[0].glyphs).toBeGreaterThan(0)

  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('Hello')
  await page.keyboard.press('Escape')
  await expect.poll(async () => (await layers(frame))[0]).toMatchObject({
    text: 'Hello',
    onPath: true,
    glyphs: 5
  })

  await editor.canvas.undo()
  await editor.canvas.undo()
  await expect.poll(async () => (await layers(frame)).map((layer) => layer.type)).toEqual(['VECTOR'])
  editor.canvas.assertNoErrors()
})
