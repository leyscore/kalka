import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

test('Shift-click in the layers panel extends from a layer just drawn on the canvas', async () => {
  await editor.canvas.drawRect(100, 100, 60, 60)
  await editor.canvas.drawRect(200, 100, 60, 60)
  await editor.canvas.drawRect(300, 100, 60, 60)
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    return store.graph.getChildren(store.state.currentPageId).map((node) => node.id)
  })
  expect(ids).toHaveLength(3)

  await editor.page
    .locator(`[data-node-id="${ids[0]}"]`)
    .first()
    .click({ modifiers: ['Shift'] })
  await expect
    .poll(() =>
      editor.page.evaluate(() =>
        [...(window.kalka?.getStore?.().state.selectedIds ?? [])].toSorted((a, b) =>
          a.localeCompare(b)
        )
      )
    )
    .toEqual(ids.toSorted((a, b) => a.localeCompare(b)))
})
