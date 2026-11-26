import { DEFAULT_GRADIENT_TRANSFORM, gradientPoint } from '@kalka/scene-graph/gradient'
import type { Vector } from '@kalka/scene-graph/primitives'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma draws an open gradient picker's gradient on the layer: a handle at each end of the line
// and one per stop, dragged on the canvas, each drag one undo step.

const editor = useEditorSetupWithClear()

/** A 300 × 200 rectangle at (200, 200) with Figma's new linear gradient, top to bottom. */
async function addGradientRect() {
  await editor.page.evaluate((gradientTransform) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.createNode('RECTANGLE', store.state.currentPageId, {
      name: 'Gradient',
      x: 200,
      y: 200,
      width: 300,
      height: 200,
      fills: [
        {
          type: 'GRADIENT_LINEAR',
          color: { r: 1, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          gradientTransform,
          gradientStops: [
            { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
            { color: { r: 0, g: 0, b: 1, a: 1 }, position: 0.5 },
            { color: { r: 0, g: 1, b: 0, a: 1 }, position: 1 }
          ]
        }
      ]
    })
    store.select([node.id])
  }, DEFAULT_GRADIENT_TRANSFORM)
  await editor.canvas.waitForRender()
}

/** Where a point of the page lands on the canvas element. */
function onCanvas(point: Vector) {
  return editor.page.evaluate((p) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const { zoom, panX, panY } = store.state
    return { x: p.x * zoom + panX, y: p.y * zoom + panY }
  }, point)
}

/** Hovers a point of the page, which lights the handle there, then drags it to another. */
async function dragHandle(from: Vector, to: Vector) {
  const a = await onCanvas(from)
  const b = await onCanvas(to)
  await editor.canvas.hover(a.x - 3, a.y)
  await editor.canvas.hover(a.x, a.y)
  await editor.canvas.drag(a.x, a.y, b.x, b.y)
  await editor.canvas.waitForRender()
}

function gradientFill() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = [...store.state.selectedIds][0]
    return (id ? store.graph.getNode(id)?.fills[0] : undefined) ?? null
  })
}

test('dragging the handles of an open gradient moves its end and its stops', async () => {
  const { page, canvas } = editor
  await addGradientRect()
  await page.getByTestId('fill-picker-swatch').first().click()
  const picker = page.locator('[data-picker-content]')
  await expect(picker).toBeVisible()

  // The end of the line sits at the bottom middle; drag it to the right middle.
  await dragHandle({ x: 350, y: 400 }, { x: 500, y: 300 })
  await expect(picker).toBeVisible()
  const turned = await gradientFill()
  const transform = turned?.gradientTransform
  if (!transform) throw new Error('the fill lost its gradient')
  const end = gradientPoint(transform, { x: 1, y: 0.5 })
  expect(end.x).toBeCloseTo(1)
  expect(end.y).toBeCloseTo(0.5)

  // The middle stop now sits halfway along the new line; drag it a quarter of the way in.
  const start = gradientPoint(transform, { x: 0, y: 0.5 })
  const middle = { x: 200 + ((start.x + end.x) / 2) * 300, y: 200 + ((start.y + end.y) / 2) * 200 }
  const along = {
    x: 200 + (start.x + (end.x - start.x) * 0.25) * 300,
    y: 200 + (start.y + (end.y - start.y) * 0.25) * 200
  }
  await dragHandle(middle, along)
  expect((await gradientFill())?.gradientStops?.[1].position).toBeCloseTo(0.25, 1)

  // Escape closes the picker; then each drag undoes on its own.
  await page.keyboard.press('Escape')
  await expect(picker).toBeHidden()
  await canvas.undo()
  expect((await gradientFill())?.gradientStops?.[1].position).toBe(0.5)
  await canvas.undo()
  expect((await gradientFill())?.gradientTransform).toEqual(DEFAULT_GRADIENT_TRANSFORM)
  canvas.assertNoErrors()
})
