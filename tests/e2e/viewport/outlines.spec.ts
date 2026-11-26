import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'
import { openAppMenu } from '#tests/helpers/menu'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** How the artboard draws a layer: its outline style and its background colour. */
async function drawnAs(frameId: string, layerId: string) {
  return editor.page.evaluate(
    ({ frame, layer }) => {
      const doc = document.querySelector<HTMLIFrameElement>(
        `iframe[data-kalka-artboard="${frame}"]`
      )?.contentDocument
      const element = doc?.querySelector(`[data-kalka-id="${layer}"]`)
      const style = element ? doc?.defaultView?.getComputedStyle(element) : undefined
      return { outline: style?.outlineStyle, background: style?.backgroundColor }
    },
    { frame: frameId, layer: layerId }
  )
}

async function chooseOutlineItem(name: string) {
  const view = await openAppMenu(editor.page, 'View')
  await view.getByRole('menuitem', { name: 'Outlines', exact: true }).click()
  await editor.page.getByRole('menuitemcheckbox', { name, exact: true }).click()
  await editor.page.keyboard.press('Escape')
  await expect(editor.page.getByRole('menu')).toHaveCount(0)
}

test('outline mode draws every layer as an outline and back', async () => {
  const ids = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Card',
      x: 40,
      y: 40,
      width: 320,
      height: 200
    })
    const swatch = store.graph.createNode('RECTANGLE', frame.id, {
      name: 'Swatch',
      x: 20,
      y: 20,
      width: 100,
      height: 80,
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    store.requestRender()
    return { frame: frame.id, swatch: swatch.id }
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))
  await expect.poll(() => drawnAs(ids.frame, ids.swatch)).toMatchObject({ outline: 'none' })

  await chooseOutlineItem('Show outlines')
  await expect
    .poll(() => drawnAs(ids.frame, ids.swatch))
    .toEqual({ outline: 'solid', background: 'rgba(0, 0, 0, 0)' })

  await chooseOutlineItem('Show outlines')
  await expect.poll(() => drawnAs(ids.frame, ids.swatch)).toMatchObject({ outline: 'none' })
})

test('pixel preview pictures a zoomed-in artboard at 1x and stops when disabled', async () => {
  const frameId = await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Icon',
      x: 0,
      y: 0,
      width: 48,
      height: 48,
      fills: [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 1, a: 1 }, opacity: 1, visible: true }]
    })
    store.state.zoom = 4
    store.state.panX = 40
    store.state.panY = 40
    store.requestRender()
    return frame.id
  })
  await editor.page.evaluate(() => window.kalka?.test?.navigation?.waitForSettlement(10_000))

  const choose = async (name: string) => {
    const view = await openAppMenu(editor.page, 'View')
    await view.getByRole('menuitem', { name: 'Pixel preview', exact: true }).click()
    await editor.page.getByRole('menuitemcheckbox', { name, exact: true }).click()
    await editor.page.keyboard.press('Escape')
    await expect(editor.page.getByRole('menu')).toHaveCount(0)
  }
  const picture = editor.page.locator(`canvas[data-kalka-pixel-preview="${frameId}"]`)

  await choose('1x')
  await expect(picture).toHaveCount(1)
  // One device pixel per canvas pixel: the picture is the artboard's size, enlarged on screen.
  await expect.poll(() => picture.evaluate((c: HTMLCanvasElement) => c.width)).toBe(48)

  await choose('Disabled')
  await expect(picture).toHaveCount(0)
})
