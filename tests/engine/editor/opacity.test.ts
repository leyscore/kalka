import { describe, test, expect } from 'bun:test'

import { createEditor } from '@open-pencil/core/editor'

import { getNodeOrThrow } from '#tests/helpers/assert'

describe('editor.setOpacity', () => {
  function setup() {
    const editor = createEditor()
    const pageId = editor.graph.getPages()[0].id
    const rect = editor.graph.createNode('RECTANGLE', pageId, {
      name: 'Rect',
      x: 0,
      y: 0,
      width: 50,
      height: 50
    })
    editor.select([rect.id])
    return { editor, rect }
  }

  test('sets opacity to 50%', () => {
    const { editor, rect } = setup()

    editor.setOpacity(0.5)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0.5)
  })

  test('sets opacity to 100% (digit 0)', () => {
    const { editor, rect } = setup()

    editor.setOpacity(0.5)
    editor.setOpacity(1)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
  })

  test('clamps opacity above 100%', () => {
    const { editor, rect } = setup()

    editor.setOpacity(1.5)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
  })

  test('clamps opacity below 0%', () => {
    const { editor, rect } = setup()

    editor.setOpacity(-0.3)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0)
  })

  test('opacity change is undoable as a single batch entry', () => {
    const { editor, rect } = setup()

    editor.setOpacity(0.3)
    expect(editor.undo.canUndo).toBe(true)

    editor.undo.undo()
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)

    editor.undo.redo()
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0.3)
  })

  test('opacity batch for multiple selections collapses to one undo entry', () => {
    const { editor, rect } = setup()
    const pageId = editor.graph.getPages()[0].id
    const rect2 = editor.graph.createNode('RECTANGLE', pageId, {
      name: 'Rect2',
      x: 100,
      y: 0,
      width: 50,
      height: 50
    })
    editor.select([rect.id, rect2.id])

    editor.setOpacity(0.7)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0.7)
    expect(getNodeOrThrow(editor.graph, rect2.id).opacity).toBe(0.7)

    editor.undo.undo()
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
    expect(getNodeOrThrow(editor.graph, rect2.id).opacity).toBe(1)
  })

  test('no-op when opacity already matches', () => {
    const { editor, rect } = setup()

    editor.setOpacity(1)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
    expect(editor.undo.canUndo).toBe(false)
  })

  test('no-op with no selection', () => {
    const { editor } = setup()

    editor.clearSelection()
    editor.setOpacity(0.5)
    expect(editor.undo.canUndo).toBe(false)
  })
})
