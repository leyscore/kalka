import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

/** A group of two 50×50 squares, 50 apart. */
function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const left = editor.graph.createNode('RECTANGLE', page, { x: 0, y: 0, width: 50, height: 50 })
  const right = editor.graph.createNode('RECTANGLE', page, { x: 100, y: 0, width: 50, height: 50 })
  editor.select([left.id, right.id])
  const group = editor.groupSelected()
  if (!group) throw new Error('No group')
  const width = () => getNodeOrThrow(editor.graph, group).width
  return { editor, right, width }
}

describe('a group spans its layers after they change, as in Figma', () => {
  test('after a size or position typed in the properties panel, undone in one step', () => {
    const { editor, right, width } = setup()
    editor.updateNodeWithUndo(right.id, { width: 200 }, 'Resize')
    expect(width()).toBe(300)
    editor.updateNodeWithUndo(right.id, { x: 300 }, 'Move')
    expect(width()).toBe(500)

    editor.undoAction()
    expect(width()).toBe(300)
    editor.undoAction()
    expect(width()).toBe(150)
  })

  test('after a layer is resized with its handles', () => {
    const { editor, right, width } = setup()
    const original = { x: right.x, y: right.y, width: 50, height: 50 }
    editor.graph.updateNode(right.id, { width: 150 })
    editor.commitResize(right.id, original)
    expect(width()).toBe(250)
    editor.undoAction()
    expect(width()).toBe(150)
  })
})
