import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

test('document shortcuts work while text is edited, and canvas shortcuts stay with the text', async () => {
  const page = editor.page
  await page.evaluate(() => {
    const store = window.openPencil?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('TEXT', 300, 250, 220, 60)
    store.graph.updateNode(id, { text: 'Hello', fontSize: 24 })
    store.select([id])
    store.startTextEditing(id)
  })
  const tabs = page.getByTestId('tabbar-tab')
  const before = await tabs.count()

  // A canvas shortcut is a letter of the text.
  await page.keyboard.press('KeyR')
  await expect
    .poll(() => page.evaluate(() => window.openPencil?.getStore?.().state.activeTool))
    .not.toBe('RECTANGLE')

  // A document shortcut still reaches the app.
  await page.keyboard.press('ControlOrMeta+KeyT')
  await expect(tabs).toHaveCount(before + 1)
})
