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
