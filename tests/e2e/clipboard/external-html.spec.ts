import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

async function paste(type: 'text/html' | 'text/plain', content: string) {
  await editor.page.evaluate(
    ([type, content]) => {
      const data = new DataTransfer()
      data.setData(type, content)
      window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }))
    },
    [type, content] as const
  )
}

function pageLayers() {
  return editor.page.evaluate(() => {
    const store = window.openPencil?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const page = store.graph.getNode(store.state.currentPageId)
    return (page?.childIds ?? []).map((id) => store.graph.getNode(id)?.name ?? '')
  })
}

test('HTML copied from a page pastes as editable layers and runs nothing', async () => {
  const before = (await pageLayers()).length
  await paste(
    'text/html',
    '<section style="display:flex;gap:8px;padding:16px;background:#2f5bea"><h1 style="color:white">Hello</h1><img src="x" onerror="window.__pasteRan = true"></section>'
  )
  await expect.poll(async () => (await pageLayers()).length).toBe(before + 1)
  expect(
    await editor.page.evaluate(() => (window as { __pasteRan?: boolean }).__pasteRan)
  ).toBeUndefined()
  const texts = await editor.page.evaluate(() => {
    const store = window.openPencil?.getStore?.()
    const found: string[] = []
    for (const node of store?.graph.nodes.values() ?? [])
      if (node.type === 'TEXT') found.push(node.text)
    return found
  })
  expect(texts).toContain('Hello')
})

test('HTML source copied as text pastes as layers too', async () => {
  // Pasted onto the page rather than into the section the last paste selected.
  await editor.page.evaluate(() => window.openPencil?.getStore?.().clearSelection())
  const before = (await pageLayers()).length
  await paste('text/plain', '<div style="width:120px;height:40px;background:#121214"></div>')
  await expect.poll(async () => (await pageLayers()).length).toBe(before + 1)
})
