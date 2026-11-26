import { BLACK } from '@kalka/core/constants'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma's Scale tool (K): dragging a handle scales the layer with its radius and stroke.

const editor = useEditorSetupWithClear('/?test&no-chrome&no-rulers')

function selected() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.getNode([...store.state.selectedIds][0] ?? '')
    return node
      ? {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          cornerRadius: node.cornerRadius,
          stroke: node.strokes[0]?.weight
        }
      : null
  })
}

test('scales a rectangle with its radius and stroke about the opposite corner', async () => {
  const { canvas, page } = editor
  await canvas.drawRect(100, 100, 100, 50)
  await page.evaluate((black) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = [...store.state.selectedIds][0]
    store.updateNode(id, {
      cornerRadius: 10,
      strokes: [
        {
          type: 'SOLID',
          color: black,
          opacity: 1,
          visible: true,
          weight: 2,
          align: 'INSIDE'
        }
      ]
    })
  }, BLACK)
  await page.keyboard.press('k')
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.activeTool))
    .toBe('SCALE')

  await canvas.drag(200, 150, 300, 200)
  await canvas.waitForRender()
  const scaled = await selected()
  expect(scaled?.x).toBeCloseTo(100, 0)
  expect(scaled?.y).toBeCloseTo(100, 0)
  expect(scaled?.width).toBeCloseTo(200, 0)
  expect(scaled?.height).toBeCloseTo(100, 0)
  expect(scaled?.cornerRadius).toBeCloseTo(20, 0)
  expect(scaled?.stroke).toBeCloseTo(4, 0)

  await canvas.undo()
  expect((await selected())?.width).toBeCloseTo(100, 0)
  canvas.assertNoErrors()
})
