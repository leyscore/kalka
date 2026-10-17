import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { getMobileDrawerSnap } from '#tests/helpers/code-panel'

const editor = useEditorSetup()

test.use({ viewport: { width: 390, height: 844 } })

test('mobile Code drawer mounts one live editor only while open', async () => {
  await editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frameId = store.createShape('FRAME', 0, 0, 100, 100)
    store.select([frameId])
  })

  await editor.page.getByTestId('mobile-ribbon-code').click()
  const panel = editor.page.getByTestId('code-panel-root')
  await expect(panel).toBeVisible()
  await expect(panel.locator('[data-slot="code-editor"]')).toHaveCount(1)
  // The selected frame's code, in whichever source the drawer opens on.
  await expect(panel.locator('.cm-content')).toContainText('100px')
  await expect(panel.locator('.cm-lineNumbers')).toBeVisible()

  await editor.page.getByTestId('mobile-ribbon-code').click()
  await expect.poll(() => getMobileDrawerSnap(editor.page)).toBe('closed')
})
