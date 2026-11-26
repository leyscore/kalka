import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** The `z-index` each child of the row draws with, first to last. */
async function childStacking(rowId: string, childIds: string[]) {
  return editor.page.evaluate(
    ({ row, children }) => {
      const doc = document.querySelector<HTMLIFrameElement>(
        `iframe[data-kalka-artboard="${row}"]`
      )?.contentDocument
      return children.map((id) => {
        const element = doc?.querySelector(`[data-kalka-id="${id}"]`)
        return element ? doc?.defaultView?.getComputedStyle(element).zIndex : undefined
      })
    },
    { row: rowId, children: childIds }
  )
}

test("Figma's advanced auto layout settings set strokes, stacking and baseline", async () => {
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const row = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Avatars',
      x: 40,
      y: 40,
      width: 200,
      height: 60,
      layoutMode: 'HORIZONTAL',
      itemSpacing: -16
    })
    const children = ['A', 'B', 'C'].map(
      (name) => store.graph.createNode('ELLIPSE', row.id, { name, width: 40, height: 40 }).id
    )
    store.select([row.id])
    store.requestRender()
    return { row: row.id, children }
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))

  await editor.page.getByRole('button', { name: 'Advanced layout settings' }).click()
  const settings = editor.page.getByRole('dialog', { name: 'Advanced layout settings' })
  await settings.getByRole('button', { name: 'First on top' }).click()
  await expect.poll(() => childStacking(ids.row, ids.children)).toEqual(['3', '2', '1'])

  await settings.getByRole('button', { name: 'Included in layout' }).click()
  await settings.getByRole('checkbox', { name: 'Align text baseline' }).check()
  const row = await editor.page.evaluate((id) => {
    const node = window.kalka?.getStore?.()?.graph.getNode(id)
    return (
      node && {
        itemReverseZIndex: node.itemReverseZIndex,
        strokesIncludedInLayout: node.strokesIncludedInLayout,
        counterAxisAlign: node.counterAxisAlign
      }
    )
  }, ids.row)
  expect(row).toEqual({
    itemReverseZIndex: true,
    strokesIncludedInLayout: true,
    counterAxisAlign: 'BASELINE'
  })

  // One undo step each.
  await editor.page.keyboard.press('Escape')
  await editor.page.keyboard.press('ControlOrMeta+z')
  await editor.page.keyboard.press('ControlOrMeta+z')
  await editor.page.keyboard.press('ControlOrMeta+z')
  await expect.poll(() => childStacking(ids.row, ids.children)).toEqual(['auto', 'auto', 'auto'])
})
