import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

function texts(ids: string[]) {
  return editor.page.evaluate(
    (nodeIds) =>
      nodeIds.map((id) => {
        const node = window.kalka?.getStore?.().graph.getNode(id)
        return { fontSize: node?.fontSize, styled: Boolean(node?.textStyleId) }
      }),
    ids
  )
}

test('several selected texts take a text style and a size together', async () => {
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('kalka store not available')
    const pageId = store.state.currentPageId
    const make = (y: number, fontSize: number, text: string) =>
      store.graph.createNode('TEXT', pageId, { x: 40, y, width: 300, fontSize, text }).id
    const heading = make(40, 48, 'Heading')
    const first = make(160, 16, 'First title')
    const second = make(240, 20, 'Second title')
    if (!store.createTextStyle('Heading/H1', [heading])) throw new Error('No style')
    store.select([first, second])
    return [first, second]
  })
  await editor.canvas.waitForRender()

  const panel = editor.page.getByTestId('design-panel-multi')
  const size = panel.getByRole('spinbutton', { name: 'Font size' })
  await size.click()
  await editor.page.keyboard.type('24')
  await editor.page.keyboard.press('Enter')
  await expect
    .poll(() => texts(ids))
    .toEqual([
      { fontSize: 24, styled: false },
      { fontSize: 24, styled: false }
    ])

  await panel.getByTestId('text-style-picker').click()
  await editor.page.locator('[data-text-style="Heading/H1"]').click()
  await expect
    .poll(() => texts(ids))
    .toEqual([
      { fontSize: 48, styled: true },
      { fontSize: 48, styled: true }
    ])
})
