import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test')

test('draw section in full editor without browser errors', async () => {
  await editor.canvas.drawSection(100, 100, 240, 160)

  // A section's type is a menu in the design panel, beside its name.
  await expect(editor.page.getByRole('button', { name: 'Layer type' })).toBeVisible()
  await expect(editor.page.getByRole('heading', { name: 'Section 1' })).toBeVisible()
  await expect
    .poll(async () => {
      return editor.page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        if (!store) throw new Error('Kalka store not initialized')
        const selectedId = [...store.state.selectedIds][0]
        return selectedId ? store.graph.getNode(selectedId)?.type : null
      })
    })
    .toBe('SECTION')

  editor.canvas.assertNoErrors()
})
