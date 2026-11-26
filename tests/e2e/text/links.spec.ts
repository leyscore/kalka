import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { openAppMenu } from '#tests/helpers/menu'

const editor = useEditorSetup()

function textRuns() {
  return editor.page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    const id = [...(store?.state.selectedIds ?? [])][0]
    const node = id ? store?.graph.getNode(id) : undefined
    return { runs: node?.styleRuns ?? [], decoration: node?.textDecoration }
  })
}

test('⌘K in a text being edited links the selected characters, and the link can be removed', async () => {
  const page = editor.page
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const id = store.createShape('TEXT', 300, 250, 260, 60)
    store.graph.updateNode(id, { text: 'Read the docs', fontSize: 24 })
    store.select([id])
    store.startTextEditing(id)
  })
  // Editing selects every character, which the link then covers.
  await page.keyboard.press('ControlOrMeta+KeyK')
  const address = page.getByTestId('text-link-url')
  await expect(address).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveCount(0)
  await address.fill('kalka.design')
  await page.getByTestId('text-link-apply').click()

  await expect
    .poll(async () => (await textRuns()).runs)
    .toEqual([
      {
        start: 0,
        length: 13,
        style: {
          hyperlink: { type: 'URL', value: 'https://kalka.design' },
          textDecoration: 'UNDERLINE'
        }
      }
    ])

  await page.keyboard.press('ControlOrMeta+KeyK')
  await expect(address).toHaveValue('https://kalka.design')
  await page.getByTestId('text-link-remove').click()
  await expect.poll(async () => (await textRuns()).runs).toEqual([])
  // The text being edited has the keyboard again: Escape ends the edit.
  await expect(address).toBeHidden()
  await page.keyboard.press('Escape')
  await expect
    .poll(() => page.evaluate(() => window.kalka?.getStore?.().state.editingTextId))
    .toBeNull()
})

test('Create link in the Text menu links a whole text layer, which the artboard draws as a link', async () => {
  const page = editor.page
  const ids = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const frame = store.createShape('FRAME', 100, 100, 400, 200)
    const text = store.createShape('TEXT', 20, 20, 200, 40, frame)
    store.graph.updateNode(text, { text: 'Docs', fontSize: 24 })
    store.select([text])
    return { frame, text }
  })
  const menu = await openAppMenu(page, 'Text')
  await menu.getByRole('menuitem', { name: /^Create link/ }).click()
  const address = page.getByTestId('text-link-url')
  await expect(address).toBeVisible()
  await address.fill('https://kalka.design/docs')
  await address.press('Enter')
  await expect
    .poll(async () => textRuns())
    .toEqual({
      runs: [
        {
          start: 0,
          length: 4,
          style: { hyperlink: { type: 'URL', value: 'https://kalka.design/docs' } }
        }
      ],
      decoration: 'UNDERLINE'
    })
  await expect
    .poll(() =>
      page.evaluate(({ frame, text }) => {
        const doc = document.querySelector<HTMLIFrameElement>(
          `iframe[data-kalka-artboard="${frame}"]`
        )?.contentDocument
        const link = doc?.querySelector(`[data-kalka-id="${text}"] a`)
        return link?.getAttribute('href') ?? null
      }, ids)
    )
    .toBe('https://kalka.design/docs')
})
