import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { openAppMenu } from '#tests/helpers/menu'

const editor = useEditorSetup('/?test')

test.beforeAll(async () => {
  await editor.page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
})

test('browser menu copy writes rich and plain Kalka clipboard formats', async () => {
  await editor.canvas.clearCanvas()
  await editor.canvas.drawRect(100, 100, 120, 80)
  await editor.canvas.waitForRender()

  const copyMenu = await openAppMenu(editor.page, 'Edit')
  await copyMenu.getByRole('menuitem', { name: /^Copy\s+(?:⌘|Ctrl)/ }).click()

  // Copy writes once the document is encoded; until then the clipboard is empty, and a read that
  // overlaps the write fails because the data changed under it.
  const readClipboard = () =>
    editor.page.evaluate(async () => {
      try {
        const [item] = await navigator.clipboard.read()
        if (!item) return { types: [], html: '', plainText: '' }
        const html = item.types.includes('text/html')
          ? await (await item.getType('text/html')).text()
          : ''
        const plainText = item.types.includes('text/plain')
          ? await (await item.getType('text/plain')).text()
          : ''
        return { types: item.types, html, plainText }
      } catch {
        return { types: [], html: '', plainText: '' }
      }
    })
  await expect.poll(async () => (await readClipboard()).types).toContain('text/html')
  const clipboard = await readClipboard()

  expect(clipboard.types).toContain('text/html')
  expect(clipboard.types).toContain('text/plain')
  expect(clipboard.html).toContain('data-buffer="&lt;!--(figma)')
  expect(clipboard.plainText).not.toBe('')

  const before = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    return store.graph.getChildren(store.state.currentPageId).length
  })
  const pasteMenu = await openAppMenu(editor.page, 'Edit')
  await pasteMenu.getByRole('menuitem', { name: /^Paste\s+(?:⌘|Ctrl)/ }).click()
  await expect
    .poll(() =>
      editor.page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        if (!store) throw new Error('Kalka store not initialized')
        return store.graph.getChildren(store.state.currentPageId).length
      })
    )
    .toBe(before + 1)
})

test('properties copied here paste here after the system clipboard lost them', async () => {
  await editor.canvas.clearCanvas()
  const [source, target] = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const red = { r: 1, g: 0, b: 0, a: 1 }
    const a = store.createShape('RECTANGLE', 100, 100, 80, 80)
    store.updateNode(a, { fills: [{ type: 'SOLID', color: red, opacity: 1, visible: true }] })
    const b = store.createShape('RECTANGLE', 240, 100, 80, 80)
    store.select([a])
    return [a, b]
  })

  const edit = await openAppMenu(editor.page, 'Edit')
  await edit.getByRole('menuitem', { name: /^Copy properties/ }).click()
  await expect(editor.page.getByText('Copied properties.').first()).toBeVisible()
  // Something else takes the system clipboard, as another app or a blocked write would.
  await editor.page.evaluate(() => navigator.clipboard.writeText('plain words'))

  await editor.page.evaluate((id) => window.kalka?.getStore?.()?.select([id]), target)
  const paste = await openAppMenu(editor.page, 'Edit')
  await paste.getByRole('menuitem', { name: /^Paste properties/ }).click()
  await expect
    .poll(() =>
      editor.page.evaluate(
        ([a, b]) => {
          const store = window.kalka?.getStore?.()
          return (
            JSON.stringify(store?.graph.getNode(a)?.fills) ===
            JSON.stringify(store?.graph.getNode(b)?.fills)
          )
        },
        [source, target]
      )
    )
    .toBe(true)
})
