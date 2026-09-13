import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { selectDemoReferencePage } from '#tests/helpers/demo'

const editor = useEditorSetup('/demo?no-chrome&no-rulers')

async function expectCanvas(name: string) {
  editor.canvas.assertNoErrors()
  const buffer = await editor.canvas.screenshotCanvasRegion(1000, 1050)
  expect(buffer).toMatchSnapshot(`${name}.png`)
}

test('demo effects section showcases renderer features', async () => {
  await selectDemoReferencePage(editor.page)
  await editor.page.setViewportSize({ width: 1000, height: 1050 })
  await editor.canvas.waitForRender()
  await editor.page.evaluate(() => {
    const store = window.openPencil?.getStore?.()
    if (!store) throw new Error('OpenPencil store not initialized')
    const effects = store.graph
      .getChildren(store.state.currentPageId)
      .find((node) => node.name === 'Effects')
    if (!effects) throw new Error('Demo effects section not found')
    store.select([effects.id])
    store.zoomToSelection()
    store.clearSelection()
    store.requestRender()
  })
  await editor.canvas.waitForRender()
  await expectCanvas('demo-effects-section')
})
