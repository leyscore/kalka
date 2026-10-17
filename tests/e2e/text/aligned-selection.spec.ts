import { expect, test, useEditorSetup } from '#tests/e2e/fixtures'
import { expectDefined } from '#tests/helpers/assert'

const editor = useEditorSetup()

// The DOM canvas edits text in the layer's own element, so the selection is the browser's,
// drawn over the text where the layer's alignment put it.
test('centered and bottom-aligned text selection follows the rendered text', async () => {
  for (const [textAlignHorizontal, textAlignVertical] of [
    ['CENTER', 'CENTER'],
    ['RIGHT', 'CENTER'],
    ['LEFT', 'BOTTOM']
  ] as const) {
    const id = await editor.page.evaluate(
      ({ horizontal, vertical }) => {
        const store = window.kalka?.getStore?.()
        if (!store) throw new Error('Kalka store not initialized')
        const id = store.createShape('TEXT', 300, 250, 220, 120)
        store.graph.updateNode(id, {
          text: 'Aligned text',
          fontSize: 24,
          textAlignHorizontal: horizontal,
          textAlignVertical: vertical
        })
        store.select([id])
        store.requestRender()
        return id
      },
      { horizontal: textAlignHorizontal, vertical: textAlignVertical }
    )
    await editor.canvas.waitForRender()
    // Editing starts with the whole text selected.
    await editor.page.evaluate((id) => window.kalka?.getStore?.()?.startTextEditing(id), id)
    await editor.canvas.waitForTextEditor()

    const rects = await editor.page.evaluate(() => {
      for (const frame of document.querySelectorAll<HTMLIFrameElement>(
        'iframe[data-kalka-artboard]'
      )) {
        const doc = frame.contentDocument
        const layer = doc?.activeElement
        const selection = doc?.getSelection()
        if (!layer || layer.getAttribute('contenteditable') !== 'true' || !selection?.rangeCount)
          continue
        const box = layer.getBoundingClientRect()
        return (
          [...selection.getRangeAt(0).getClientRects()]
            // The paragraph's own box spans the layer; the text's is where the highlight shows.
            .filter((rect) => rect.width > 0 && rect.width < box.width)
            .map((rect) => ({
              x: rect.x - box.x,
              y: rect.y - box.y,
              width: rect.width,
              height: rect.height
            }))
        )
      }
      return []
    })
    const selection = expectDefined(rects[0], `${textAlignVertical} selection rectangle`)
    expect(selection.y).toBeGreaterThan(textAlignVertical === 'BOTTOM' ? 80 : 35)
    expect(selection.y + selection.height).toBeLessThanOrEqual(120)
    if (textAlignHorizontal === 'CENTER') expect(selection.x).toBeGreaterThan(20)
    if (textAlignHorizontal === 'RIGHT') expect(selection.x).toBeGreaterThan(40)

    await editor.page.keyboard.press('Escape')
    await editor.page.evaluate(() => {
      const store = window.kalka?.getStore?.()
      const selectedId = store?.state.selectedIds.values().next().value
      if (selectedId) store?.graph.deleteNode(selectedId)
      store?.clearSelection()
    })
    await editor.canvas.waitForRender()
  }
})
