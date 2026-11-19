import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

describe('undoing the removal of a mode', () => {
  test('shows the mode again when it was the one shown, and layers take its values', () => {
    const editor = createEditor()
    const collection = editor.graph.createCollection('Theme')
    const surface = editor.graph.createVariable('Surface', 'COLOR', collection.id, {
      r: 1,
      g: 0,
      b: 0,
      a: 1
    })
    const card = editor.graph.createNode('RECTANGLE', editor.state.currentPageId, {
      fills: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    })
    editor.bindVariable(card.id, 'fills/0/color', surface.id)
    const dark = editor.addMode(collection.id, 'Dark')
    if (!dark) throw new Error('No mode')
    editor.updateVariableValue(surface.id, dark, { r: 0, g: 0, b: 1, a: 1 })
    editor.setActiveMode(collection.id, dark)

    editor.removeMode(collection.id, dark)
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual({ r: 1, g: 0, b: 0, a: 1 })

    editor.undoAction()
    expect(editor.graph.activeMode.get(collection.id)).toBe(dark)
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual({ r: 0, g: 0, b: 1, a: 1 })
  })
})
