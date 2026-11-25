import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

function scene() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const board = editor.graph.createNode('FRAME', page, { name: 'Board' })
  const card = editor.graph.createNode('FRAME', board.id, { name: 'Card' })
  const image = editor.graph.createNode('RECTANGLE', card.id, { name: 'Image' })
  const title = editor.graph.createNode('TEXT', card.id, { name: 'Title' })
  const button = editor.graph.createNode('RECTANGLE', card.id, { name: 'Button' })
  return { editor, board, card, image, title, button }
}

// Figma: Enter selects the children, Shift+Enter the parent, Tab and Shift+Tab move between
// siblings in the order of the layers panel, whose first row is the topmost layer.
describe('keyboard selection navigation', () => {
  test('Enter selects the children of the selection', () => {
    const { editor, card, image, title, button } = scene()
    editor.select([card.id])
    expect(editor.selectChildren()).toBe(true)
    expect(editor.state.selectedIds).toEqual(new Set([image.id, title.id, button.id]))
    editor.select([image.id])
    expect(editor.selectChildren()).toBe(false)
    expect(editor.state.selectedIds).toEqual(new Set([image.id]))
  })

  test('Shift+Enter selects the parent, up to the top-level layer', () => {
    const { editor, board, card, title } = scene()
    editor.select([title.id])
    expect(editor.selectParent()).toBe(true)
    expect(editor.state.selectedIds).toEqual(new Set([card.id]))
    expect(editor.selectParent()).toBe(true)
    expect(editor.state.selectedIds).toEqual(new Set([board.id]))
    expect(editor.selectParent()).toBe(false)
    expect(editor.state.selectedIds).toEqual(new Set([board.id]))
  })

  test('selecting a parent leaves the container the canvas had entered', () => {
    const { editor, board, card, title } = scene()
    editor.enterContainer(card.id)
    editor.select([title.id])
    editor.selectParent()
    expect(editor.state.enteredContainerId).toBe(board.id)
  })

  test('Tab and Shift+Tab move down and up the layers panel, wrapping around', () => {
    const { editor, image, title, button } = scene()
    editor.select([button.id])
    expect(editor.selectSibling(1)).toBe(true)
    expect(editor.state.selectedIds).toEqual(new Set([title.id]))
    editor.selectSibling(1)
    expect(editor.state.selectedIds).toEqual(new Set([image.id]))
    editor.selectSibling(1)
    expect(editor.state.selectedIds).toEqual(new Set([button.id]))
    editor.selectSibling(-1)
    expect(editor.state.selectedIds).toEqual(new Set([image.id]))
  })

  test('skips locked layers', () => {
    const { editor, card, image, title, button } = scene()
    editor.graph.updateNode(title.id, { locked: true })
    editor.select([button.id])
    editor.selectSibling(1)
    expect(editor.state.selectedIds).toEqual(new Set([image.id]))
    editor.select([card.id])
    editor.selectChildren()
    expect(editor.state.selectedIds).toEqual(new Set([image.id, button.id]))
  })
})
