import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma Draw's Pencil: Shift+P, a freehand stroke smoothed into a vector, the tool kept on.

const editor = useEditorSetupWithClear('/?test')

function pageState() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const vectors = store.graph
      .getChildren(store.state.currentPageId)
      .filter((node) => node.type === 'VECTOR')
    return {
      tool: store.state.activeTool,
      vectors: vectors.map((node) => ({
        segments: node.vectorNetwork?.segments.length ?? 0,
        strokes: node.strokes.length,
        width: node.width
      }))
    }
  })
}

test('draws a smooth stroke with the pencil and keeps the tool', async () => {
  const { canvas, page } = editor
  await page.keyboard.press('Shift+p')
  expect((await pageState()).tool).toBe('PENCIL')

  const box = await page.getByTestId('canvas-area').boundingBox()
  if (!box) throw new Error('No canvas')
  await page.mouse.move(box.x + 200, box.y + 300)
  await page.mouse.down()
  for (let i = 1; i <= 60; i++) {
    await page.mouse.move(box.x + 200 + i * 5, box.y + 300 + 40 * Math.sin(i / 6))
  }
  await page.mouse.up()
  await canvas.waitForRender()

  const state = await pageState()
  expect(state.tool).toBe('PENCIL')
  expect(state.vectors).toHaveLength(1)
  expect(state.vectors[0].strokes).toBe(1)
  expect(state.vectors[0].segments).toBeGreaterThan(0)
  expect(state.vectors[0].segments).toBeLessThan(15)
  canvas.assertNoErrors()
})
