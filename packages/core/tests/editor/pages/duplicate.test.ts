import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('Duplicate page', () => {
  test('copies the page and its layers right after it, as one undo step', () => {
    const editor = createEditor()
    const first = editor.state.currentPageId
    editor.addPage('Second')
    const card = editor.graph.createNode('FRAME', first, { name: 'Card' })
    editor.graph.createNode('TEXT', card.id, { name: 'Title', text: 'Hello' })

    const copyId = editor.duplicatePage(first)
    const names = () => editor.graph.getPages().map((page) => page.name)
    expect(names()).toEqual(['Page 1', 'Page 1 copy', 'Second'])
    const [copiedCard] = copyId ? editor.graph.getChildren(copyId) : []
    expect(copiedCard?.name).toBe('Card')
    expect(copiedCard?.id).not.toBe(card.id)
    expect(copiedCard ? editor.graph.getChildren(copiedCard.id)[0]?.text : null).toBe('Hello')

    editor.undoAction()
    expect(names()).toEqual(['Page 1', 'Second'])
    editor.redoAction()
    expect(names()).toEqual(['Page 1', 'Page 1 copy', 'Second'])
  })
})

describe('Zoom to next and previous frame', () => {
  test('selects the top-level frames in the layers panel’s order, wrapping around', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const bottom = editor.graph.createNode('FRAME', pageId, {
      name: 'Bottom',
      width: 100,
      height: 100
    })
    editor.graph.createNode('RECTANGLE', pageId, {})
    const top = editor.graph.createNode('FRAME', pageId, {
      name: 'Top',
      x: 400,
      width: 100,
      height: 100
    })

    expect(editor.zoomToAdjacentFrame(1)).toBe(top.id)
    expect(editor.zoomToAdjacentFrame(1)).toBe(bottom.id)
    expect(editor.zoomToAdjacentFrame(1)).toBe(top.id)
    expect(editor.zoomToAdjacentFrame(-1)).toBe(bottom.id)
    expect([...editor.state.selectedIds]).toEqual([bottom.id])
  })
})
