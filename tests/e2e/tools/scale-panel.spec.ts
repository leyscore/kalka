import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

// Figma's Scale tool (K) in the Design panel: a factor in percent about a chosen anchor.

const editor = useEditorSetupWithClear('/?test')

function box(id: string) {
  return editor.page.evaluate((id) => {
    const node = window.kalka?.getStore?.().graph.getNode(id)
    return node ? { x: node.x, y: node.y, width: node.width, height: node.height } : null
  }, id)
}

test('scales the selection by a percentage about the chosen anchor', async () => {
  const { page } = editor
  const id = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.createNode('RECTANGLE', store.state.currentPageId, {
      name: 'Card',
      x: 100,
      y: 100,
      width: 100,
      height: 50
    })
    store.select([node.id])
    return node.id
  })
  await page.keyboard.press('k')
  const section = page.locator('[data-property="scale-tool"]')
  await expect(section).toBeVisible()
  await section.getByRole('radio', { name: 'Center', exact: true }).click()
  const factor = section.locator('[data-property="scale-factor"]')
  await factor.click()
  await factor.getByRole('spinbutton').fill('200')
  await page.keyboard.press('Enter')
  await expect.poll(() => box(id)).toEqual({ x: 50, y: 75, width: 200, height: 100 })
  await expect(factor).toHaveAttribute('aria-valuenow', '100')

  await page.keyboard.press('Escape')
  await editor.canvas.undo()
  await expect.poll(() => box(id)).toEqual({ x: 100, y: 100, width: 100, height: 50 })
  editor.canvas.assertNoErrors()
})
