import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

const green = { r: 0, g: 0.66, b: 0.42, a: 1 }

test('a duplicated layer keeps a colour style edited over a variable', async () => {
  const {
    frame: frameId,
    collection,
    dark
  } = await editor.page.evaluate((styleColor) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    const blue = { r: 0.12, g: 0.42, b: 1, a: 1 }
    const collection = store.graph.createCollection('Theme')
    const brand = store.graph.createVariable('brand/primary', 'COLOR', collection.id, blue)
    const frame = store.createShape('FRAME', 100, 100, 300, 200)
    const rect = store.createShape('RECTANGLE', 20, 20, 120, 80, frame)
    store.updateNodeWithUndo(rect, {
      fills: [{ type: 'SOLID', color: blue, opacity: 1, visible: true }]
    })
    store.bindVariable(rect, 'fills/0/color', brand.id)
    const style = store.createSharedStyle('fill', 'Brand/Primary', [rect])
    if (!style) throw new Error('No style')
    store.updateSharedStyle(style.nodeId, {
      fills: [{ type: 'SOLID', color: styleColor, opacity: 1, visible: true }]
    })
    const dark = store.graph.createMode(collection.id, 'Dark')
    if (!dark) throw new Error('No mode')
    store.updateVariableValue(brand.id, dark, { r: 1, g: 0.5, b: 0, a: 1 })
    store.select([frame])
    return { frame, collection: collection.id, dark }
  }, green)
  await editor.canvas.waitForRender()

  await editor.canvas.duplicate()
  await editor.canvas.waitForRender()
  // The copy shown in another mode, as a dark version of the screen.
  await editor.page.evaluate(
    ({ collectionId, modeId }) => {
      const store = window.kalka?.getStore?.()
      if (!store) throw new Error('kalka store not available')
      store.setNodeVariableMode([...store.state.selectedIds], collectionId, modeId)
    },
    { collectionId: collection, modeId: dark }
  )
  await editor.canvas.waitForRender()

  const copies = await editor.page.evaluate((originalId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    return store.graph
      .getChildren(store.state.currentPageId)
      .filter((node) => node.type === 'FRAME')
      .map((frame) => {
        const rect = store.graph.getChildren(frame.id)[0]
        return {
          original: frame.id === originalId,
          styled: Boolean(rect?.fillStyleId),
          color: rect?.fills[0]?.color
        }
      })
  }, frameId)
  expect(copies).toHaveLength(2)
  for (const copy of copies) expect(copy).toMatchObject({ styled: true, color: green })
})
