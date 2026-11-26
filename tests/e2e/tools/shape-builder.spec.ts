import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma's Shape builder (Shift+M): dragging across regions of overlapping shapes merges them.

const editor = useEditorSetupWithClear('/?test&no-chrome&no-rulers')

function pageLayers() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph
      .getChildren(store.state.currentPageId)
      .map((node) => ({ type: node.type, x: Math.round(node.x), width: Math.round(node.width) }))
  })
}

test('merges the regions dragged across into one shape', async () => {
  const { canvas, page } = editor
  await canvas.drawRect(100, 100, 100, 100)
  await canvas.drawRect(150, 100, 100, 100)
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.select(store.graph.getChildren(store.state.currentPageId).map((node) => node.id))
  })
  await page.keyboard.press('Shift+M')
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.shapeBuilder?.outlines.length))
    .toBe(3)

  // From the left square's own region into the overlap.
  await canvas.drag(125, 150, 175, 150)
  await canvas.waitForRender()
  const layers = await pageLayers()
  expect(layers.map((layer) => layer.type)).toEqual(['VECTOR', 'VECTOR'])
  expect(layers.map((layer) => [layer.x, layer.width]).sort()).toEqual([
    [100, 100],
    [200, 50]
  ])

  await canvas.undo()
  expect((await pageLayers()).map((layer) => layer.type)).toEqual(['RECTANGLE', 'RECTANGLE'])
  canvas.assertNoErrors()
})

test('a stroke cuts the shapes it crosses, and a drag shows the merged shape first', async () => {
  const { canvas, page } = editor
  await canvas.drawRect(100, 100, 100, 100)
  const grey = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const [rect] = store.graph.getChildren(pageId)
    // An unfilled path across the square, top to bottom.
    const path = store.graph.createNode('VECTOR', pageId, {
      name: 'Cut',
      x: 140,
      y: 80,
      width: 20,
      height: 140,
      fills: [],
      strokes: [
        {
          type: 'SOLID',
          color: { r: 1, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          weight: 4,
          align: 'CENTER'
        }
      ],
      vectorNetwork: {
        vertices: [
          { x: 0, y: 0 },
          { x: 20, y: 140 }
        ],
        segments: [{ start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }],
        regions: []
      }
    })
    store.select([rect.id, path.id])
    return rect.fills[0].color.r
  })
  await page.keyboard.press('Shift+M')
  // The square's two halves, the stroke inside it, and the stroke's two ends outside it.
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.shapeBuilder?.outlines.length))
    .toBe(5)

  // Across the left half and the stroke: the preview is the merged shape in the square's grey.
  const box = await canvas.canvas.boundingBox()
  if (!box) throw new Error('Canvas has no bounding box')
  await page.mouse.move(box.x + 115, box.y + 150)
  await page.mouse.down()
  await page.mouse.move(box.x + 150, box.y + 150, { steps: 10 })
  const preview = await page.evaluate(() => window.kalka?.getStore?.().state.shapeBuilder?.preview)
  expect(preview?.d).toBeTruthy()
  expect(preview?.color?.r).toBeCloseTo(grey, 3)
  await page.mouse.up()
  await canvas.waitForRender()

  // The merged shape, what is left of the square, and what is left of the stroke as a filled vector.
  const layers = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph.getChildren(store.state.currentPageId).map((node) => ({
      type: node.type,
      fill: node.fills[0]?.color.r ?? null,
      strokes: node.strokes.length
    }))
  })
  expect(layers.map((layer) => layer.type)).toEqual(['VECTOR', 'VECTOR', 'VECTOR'])
  expect(layers.every((layer) => layer.strokes === 0)).toBe(true)
  expect(layers.some((layer) => layer.fill === 1)).toBe(true)

  await canvas.undo()
  expect((await pageLayers()).map((layer) => layer.type)).toEqual(['RECTANGLE', 'VECTOR'])
  canvas.assertNoErrors()
})
