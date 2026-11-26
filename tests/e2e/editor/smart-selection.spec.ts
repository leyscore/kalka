import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma's smart selection: three evenly spaced layers show a handle in each gap and a dot at each
// centre; dragging a gap respaces them all, dragging a dot reorders the row, and an uneven
// selection shows the Tidy up button instead.

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** Three selected 40 × 40 squares on the page at 100% from (`xs`, 100). */
async function createRow(xs: number[]) {
  return editor.page.evaluate((positions) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.state.panX = 0
    store.state.panY = 0
    store.state.zoom = 1
    const ids = positions.map(
      (x, index) =>
        store.graph.createNode('RECTANGLE', store.state.currentPageId, {
          name: `Card ${index + 1}`,
          x,
          y: 100,
          width: 40,
          height: 40
        }).id
    )
    store.select(ids)
    store.requestRender()
    return ids
  }, xs)
}

async function xsOf(ids: string[]) {
  return editor.page.evaluate(
    (nodeIds) => nodeIds.map((id) => window.kalka?.getStore?.()?.graph.getNode(id)?.x),
    ids
  )
}

test('dragging a gap handle respaces every layer in one undo step', async () => {
  const ids = await createRow([100, 160, 220])
  await editor.canvas.waitForRender()
  await editor.canvas.drag(150, 120, 160, 120)
  await expect.poll(() => xsOf(ids)).toEqual([100, 170, 240])
  await editor.canvas.undo()
  await expect.poll(() => xsOf(ids)).toEqual([100, 160, 220])
  editor.canvas.assertNoErrors()
})

test('dragging a layer by its centre reorders the row', async () => {
  const ids = await createRow([100, 160, 220])
  await editor.canvas.waitForRender()
  await editor.canvas.drag(120, 120, 250, 122)
  await expect.poll(() => xsOf(ids)).toEqual([220, 100, 160])
  editor.canvas.assertNoErrors()
})

test('the Tidy up button tidies an uneven selection', async () => {
  const ids = await createRow([100, 150, 230])
  await editor.canvas.waitForRender()
  // 8px out of the selection's bottom right corner (270, 140), 20px wide.
  await editor.canvas.click(280, 158)
  await expect.poll(() => xsOf(ids)).toEqual([100, 165, 230])
  editor.canvas.assertNoErrors()
})
