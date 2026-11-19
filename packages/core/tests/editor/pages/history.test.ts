import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

function pageNames(editor: ReturnType<typeof createEditor>): string[] {
  return editor.graph.getPages().map((page) => page.name)
}

describe('page history', () => {
  test('undo brings back a deleted page with its layers, where it was', () => {
    const editor = createEditor()
    const first = editor.state.currentPageId
    const second = editor.addPage('Second')
    editor.addPage('Third')
    const card = editor.graph.createNode('FRAME', second, { name: 'Card' })
    editor.graph.createNode('TEXT', card.id, { name: 'Title', text: 'Hello' })

    editor.deletePage(second)
    expect(pageNames(editor)).toEqual(['Page 1', 'Third'])

    editor.undoAction()
    expect(pageNames(editor)).toEqual(['Page 1', 'Second', 'Third'])
    expect(getNodeOrThrow(editor.graph, second).childIds).toEqual([card.id])
    expect(getNodeOrThrow(editor.graph, card.id).childIds).toHaveLength(1)

    editor.redoAction()
    expect(pageNames(editor)).toEqual(['Page 1', 'Third'])
    expect(editor.graph.getNode(card.id)).toBeUndefined()
    expect(editor.graph.getNode(first)).toBeDefined()
  })

  test('adding, renaming and moving a page are undo steps', () => {
    const editor = createEditor()
    const added = editor.addPage('Draft')
    editor.renamePage(added, 'Final')
    editor.movePage(added, 0)
    expect(pageNames(editor)).toEqual(['Final', 'Page 1'])

    editor.undoAction()
    expect(pageNames(editor)).toEqual(['Page 1', 'Final'])
    editor.undoAction()
    expect(pageNames(editor)).toEqual(['Page 1', 'Draft'])
    editor.undoAction()
    expect(pageNames(editor)).toEqual(['Page 1'])

    editor.redoAction()
    editor.redoAction()
    editor.redoAction()
    expect(pageNames(editor)).toEqual(['Final', 'Page 1'])
  })
})
