import { describe, test, expect } from 'bun:test'

import { createEditor } from '@open-pencil/core/editor'

import { getNodeOrThrow } from '#tests/helpers/assert'

describe('opacity via updateNodeWithUndo + runBatch', () => {
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

  function setOpacity(editor: ReturnType<typeof createEditor>, opacity: number) {
    const targets = editor.getSelectedNodes()
    if (targets.length === 0) return
    editor.undo.runBatch('Set opacity', () => {
      for (const target of targets) {
        if (target.opacity === opacity) continue
        editor.updateNodeWithUndo(target.id, { opacity }, 'Set opacity')
      }
    })
  }

  test('sets opacity to 50%', () => {
    const { editor, rect } = setup()

    setOpacity(editor, 0.5)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0.5)
  })

  test('0 digit sets opacity to 100%', () => {
    const { editor, rect } = setup()

    setOpacity(editor, 0.5)
    setOpacity(editor, 1)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
  })

  test('opacity change is undoable as a single batch entry', () => {
    const { editor, rect } = setup()

    setOpacity(editor, 0.3)
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

    setOpacity(editor, 0.7)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(0.7)
    expect(getNodeOrThrow(editor.graph, rect2.id).opacity).toBe(0.7)

    editor.undo.undo()
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
    expect(getNodeOrThrow(editor.graph, rect2.id).opacity).toBe(1)
  })

  test('no-op when opacity already matches', () => {
    const { editor, rect } = setup()

    setOpacity(editor, 1)
    expect(getNodeOrThrow(editor.graph, rect.id).opacity).toBe(1)
    expect(editor.undo.canUndo).toBe(false)
  })
})
