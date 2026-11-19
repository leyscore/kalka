import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'
import { autoFrame, rect } from '#core-tests/helpers/layout'

import { createEditor } from '@kalka/core/editor'
import { computeAllLayouts } from '@kalka/core/layout'

describe('deleteSelected', () => {
  test('reflows fixed vertical auto-layout siblings', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const frame = autoFrame(editor.graph, page, {
      layoutMode: 'VERTICAL',
      width: 300,
      height: 300,
      itemSpacing: 0
    })
    rect(editor.graph, frame.id, 300, 40)
    const body = rect(editor.graph, frame.id, 300, 100, { layoutGrow: 1 })
    const footerA = rect(editor.graph, frame.id, 300, 40)
    const footerB = rect(editor.graph, frame.id, 300, 40)
    computeAllLayouts(editor.graph, page)

    editor.select([footerB.id])
    editor.deleteSelected()

    expect(getNodeOrThrow(editor.graph, body.id).height).toBe(220)
    expect(getNodeOrThrow(editor.graph, footerA.id).y).toBe(260)
  })

  test('undo puts several deleted layers back in their stacking order, whatever the selection order', () => {
    for (const picked of [
      [1, 3],
      [3, 1],
      [0, 2, 3],
      [1, 2]
    ]) {
      const editor = createEditor()
      const page = editor.state.currentPageId
      const ids = ['A', 'B', 'C', 'D', 'E'].map(
        (name) => editor.graph.createNode('RECTANGLE', page, { name }).id
      )
      editor.select(picked.map((index) => ids[index]))
      editor.deleteSelected()
      editor.undoAction()
      expect(getNodeOrThrow(editor.graph, page).childIds).toEqual(ids)
    }
  })

  test('undo puts back a deleted layer together with a deleted child of it', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const card = editor.graph.createNode('FRAME', page, { name: 'Card' })
    const title = editor.graph.createNode('TEXT', card.id, { name: 'Title' })
    const after = editor.graph.createNode('RECTANGLE', page, { name: 'After' })
    editor.select([title.id, card.id])
    editor.deleteSelected()
    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, page).childIds).toEqual([card.id, after.id])
    expect(getNodeOrThrow(editor.graph, card.id).childIds).toEqual([title.id])
  })
})
