import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

describe('undoing a variable binding', () => {
  test('gives a fill back the colour it had before it was bound', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const collection = editor.graph.createCollection('Colors')
    const brand = editor.graph.createVariable('Brand', 'COLOR', collection.id, {
      r: 1,
      g: 0,
      b: 0,
      a: 1
    })
    const card = editor.graph.createNode('RECTANGLE', page, {
      name: 'Card',
      fills: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0.5, b: 1, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    })

    editor.bindVariable(card.id, 'fills/0/color', brand.id)
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual({ r: 1, g: 0, b: 0, a: 1 })

    editor.undoAction()
    const node = getNodeOrThrow(editor.graph, card.id)
    expect(node.boundVariables).toEqual({})
    expect(node.fills[0].color).toEqual({ r: 0, g: 0.5, b: 1, a: 1 })
  })
})
