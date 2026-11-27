import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

/** The names of a layer's children, or null once the layer is gone. */
function childNames(id: string) {
  return editor.page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    if (!store.graph.getNode(nodeId)) return null
    return store.graph.getChildren(nodeId).map((node) => node.name)
  }, id)
}

function artboardNamed(name: string) {
  return editor.page.evaluate((artboardName) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    return (
      store.graph.getChildren(store.state.currentPageId).find((node) => node.name === artboardName)
        ?.id ?? null
    )
  }, name)
}

test('deleting a breakpoint leaves the other artboards whole, and undo brings it back', async () => {
  const desktopId = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    const frame = store.createShape('FRAME', 100, 100, 1440, 600)
    const rect = store.createShape('RECTANGLE', 40, 40, 200, 100, frame)
    store.updateNode(rect, { name: 'Card' })
    store.select([frame])
    return frame
  })
  await editor.canvas.waitForRender()

  await editor.page.getByTestId('breakpoint-add-tablet').click()
  await editor.canvas.waitForRender()
  const tabletId = await artboardNamed('Tablet')
  expect(tabletId).not.toBeNull()
  expect(await childNames(tabletId ?? '')).toEqual(['Card'])

  const row = editor.page.locator(`[data-node-id="${tabletId}"]`).first()
  await row.click({ button: 'right' })
  await editor.page.getByTestId('context-delete').click()
  await editor.canvas.waitForRender()

  expect(await artboardNamed('Tablet')).toBeNull()
  await expect.poll(() => childNames(desktopId)).toEqual(['Card'])

  await editor.canvas.undo()
  await editor.canvas.waitForRender()
  const restored = await artboardNamed('Tablet')
  expect(restored).not.toBeNull()
  await expect.poll(() => childNames(restored ?? '')).toEqual(['Card'])
  expect(await childNames(desktopId)).toEqual(['Card'])
})
