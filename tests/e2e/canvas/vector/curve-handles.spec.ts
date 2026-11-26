import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma's vector edit mode: double-clicking a point toggles it between sharp and smooth, the
// smooth point's handles mirror each other, and Option breaks the mirroring.

const editor = useEditorSetupWithClear('/?test&no-chrome&no-rulers')

/** A path with a sharp top: (200, 400) → (300, 200) → (400, 400) on the canvas. */
async function addPeak() {
  await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const straight = { tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
    const node = store.graph.createNode('VECTOR', store.state.currentPageId, {
      name: 'Peak',
      x: 200,
      y: 200,
      width: 200,
      height: 200,
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
          { x: 0, y: 200 },
          { x: 100, y: 0 },
          { x: 200, y: 200 }
        ],
        segments: [
          { start: 0, end: 1, ...straight },
          { start: 1, end: 2, ...straight }
        ],
        regions: []
      }
    })
    store.select([node.id])
  })
  await editor.canvas.waitForRender()
}

/** The tangents at the top point in the edit session; the path is not rotated, so on screen too. */
function peakTangents() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const network = store.state.nodeEditState
    if (!network) return null
    const [left, right] = network.segments
    return {
      left: left.tangentEnd,
      right: right.tangentStart,
      mirroring: network.vertices[1].handleMirroring ?? 'NONE'
    }
  })
}

test('double-clicking a point makes it smooth with mirrored handles; Option breaks them', async () => {
  const { canvas } = editor
  await addPeak()
  await canvas.dblclick(250, 300)
  expect(await editor.page.evaluate(() => !!window.kalka?.getStore?.().state.nodeEditState)).toBe(
    true
  )

  await canvas.dblclick(300, 200)
  const smooth = await peakTangents()
  expect(smooth?.mirroring).toBe('ANGLE_AND_LENGTH')
  expect(smooth?.right.y).toBeCloseTo(0)
  expect(smooth?.right.x).toBeGreaterThan(0)
  expect(smooth?.left.x).toBeCloseTo(-(smooth?.right.x ?? 0))

  // Dragging the right handle down swings the left one up.
  const handleX = 300 + (smooth?.right.x ?? 0)
  await canvas.hover(handleX, 200)
  await canvas.drag(handleX, 200, handleX, 240)
  await canvas.waitForRender()
  const bent = await peakTangents()
  expect(bent?.right.y).toBeCloseTo(40)
  expect(bent?.left.y).toBeCloseTo(-40)

  // Option drags one handle alone.
  await canvas.hover(handleX, 240)
  await canvas.altDrag(handleX, 240, handleX, 280)
  const broken = await peakTangents()
  expect(broken?.mirroring).toBe('NONE')
  expect(broken?.right.y).toBeCloseTo(80)
  expect(broken?.left.y).toBeCloseTo(-40)

  // Double-clicking again makes it sharp; each change is its own undo step.
  await canvas.dblclick(300, 200)
  expect(await peakTangents()).toMatchObject({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } })
  await canvas.undo()
  expect((await peakTangents())?.right.y).toBeCloseTo(80)
  canvas.assertNoErrors()
})
