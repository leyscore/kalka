import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test')

function paints() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const [id] = store.state.selectedIds
    const node = id ? store.graph.getNode(id) : undefined
    return { fills: node?.fills.length ?? -1, strokes: node?.strokes.length ?? -1 }
  })
}

function layoutGridsShown() {
  return editor.page.evaluate(() => window.kalka?.getStore?.().state.showLayoutGrids !== false)
}

test('Shift+X swaps fill and stroke, Shift+/ and Alt+/ remove them', async () => {
  await editor.canvas.drawRect(120, 120, 120, 90)
  await expect.poll(paints).toEqual({ fills: 1, strokes: 0 })

  await editor.page.keyboard.press('Shift+KeyX')
  await expect.poll(paints).toEqual({ fills: 0, strokes: 1 })

  await editor.page.keyboard.press('Shift+Slash')
  await expect.poll(paints).toEqual({ fills: 0, strokes: 0 })

  await editor.canvas.undo()
  await editor.canvas.undo()
  await expect.poll(paints).toEqual({ fills: 1, strokes: 0 })

  await editor.page.keyboard.press('Alt+Slash')
  await expect.poll(paints).toEqual({ fills: 0, strokes: 0 })
})

test('text shortcuts step the size and toggle strikethrough on a selected text layer', async () => {
  await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const { id } = store.graph.createNode('TEXT', store.state.currentPageId, {
      name: 'Title',
      text: 'Hello',
      fontSize: 16,
      x: 100,
      y: 100,
      width: 200,
      height: 24
    })
    store.select([id])
  })
  const text = () =>
    editor.page.evaluate(() => {
      const store = window.kalka?.getStore?.()
      const [id] = store?.state.selectedIds ?? []
      const node = id ? store?.graph.getNode(id) : undefined
      return { fontSize: node?.fontSize, decoration: node?.textDecoration }
    })

  await editor.page.keyboard.press('Meta+Shift+Period')
  await expect.poll(text).toMatchObject({ fontSize: 17 })
  await editor.page.keyboard.press('Meta+Shift+Comma')
  await editor.page.keyboard.press('Meta+Shift+Comma')
  await expect.poll(text).toMatchObject({ fontSize: 15 })

  await editor.page.keyboard.press('Meta+Shift+KeyX')
  await expect.poll(text).toMatchObject({ decoration: 'STRIKETHROUGH' })
})

test('Ctrl+Shift+4 hides and shows layout grids', async () => {
  await expect.poll(layoutGridsShown).toBe(true)
  await editor.page.keyboard.press('Control+Shift+Digit4')
  await expect.poll(layoutGridsShown).toBe(false)
  await editor.page.keyboard.press('Control+Shift+Digit4')
  await expect.poll(layoutGridsShown).toBe(true)
})

test('N and Shift+N select the next and previous top-level frame', async () => {
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    const a = store.graph.createNode('FRAME', pageId, { name: 'A', x: 0, y: 0 })
    const b = store.graph.createNode('FRAME', pageId, { name: 'B', x: 300, y: 0 })
    store.select([a.id])
    return { a: a.id, b: b.id }
  })
  const selected = () =>
    editor.page.evaluate(() => [...(window.kalka?.getStore?.().state.selectedIds ?? [])])

  await editor.page.keyboard.press('Shift+KeyN')
  await expect.poll(selected).toEqual([ids.b])
  await editor.page.keyboard.press('KeyN')
  await expect.poll(selected).toEqual([ids.a])
})
