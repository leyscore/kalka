import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'

const editor = useEditorSetup()

test('⌘E rasterizes the selection into one image layer, and undo brings the layers back', async () => {
  const page = editor.page
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const fill = { type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
    const a = store.createShape('RECTANGLE', 200, 200, 80, 60, undefined, undefined, {
      fills: [fill]
    })
    const b = store.createShape('ELLIPSE', 300, 220, 40, 40, undefined, undefined, {
      fills: [fill]
    })
    store.select([a, b])
    return [a, b]
  })
  await page.keyboard.press('ControlOrMeta+KeyE')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        const id = [...(store?.state.selectedIds ?? [])][0]
        const node = id ? store?.graph.getNode(id) : undefined
        return { name: node?.name, fill: node?.fills[0]?.type, width: node?.width }
      })
    )
    .toEqual({ name: 'Image', fill: 'IMAGE', width: 140 })
  await page.keyboard.press('ControlOrMeta+KeyZ')
  await expect
    .poll(() =>
      page.evaluate((layers) => {
        const store = window.kalka?.getStore?.()
        return layers.every((id) => store?.graph.getNode(id) !== undefined)
      }, ids)
    )
    .toBe(true)
})
