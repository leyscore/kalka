import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }

function themedScreen() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const collection = editor.graph.createCollection('Theme')
  const surface = editor.graph.createVariable('Surface', 'COLOR', collection.id, RED)
  const dark = editor.addMode(collection.id, 'Dark')
  if (!dark) throw new Error('No mode')
  editor.updateVariableValue(surface.id, dark, BLUE)
  const screen = editor.graph.createNode('FRAME', page, { name: 'Screen' })
  const card = editor.graph.createNode('RECTANGLE', screen.id, {
    name: 'Card',
    fills: [{ type: 'SOLID', color: RED, opacity: 1, visible: true, blendMode: 'NORMAL' }]
  })
  editor.bindVariable(card.id, 'fills/0/color', surface.id)
  return { editor, collection, dark, screen, card }
}

describe('a layer’s variable mode', () => {
  test('switches the layers inside it to that mode in one undo step', () => {
    const { editor, collection, dark, screen, card } = themedScreen()

    editor.setNodeVariableMode([screen.id], collection.id, dark)
    expect(getNodeOrThrow(editor.graph, screen.id).variableModes).toEqual({ [collection.id]: dark })
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual(BLUE)

    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, screen.id).variableModes).toEqual({})
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual(RED)

    editor.redoAction()
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual(BLUE)
  })

  test('goes back to the inherited mode when cleared', () => {
    const { editor, collection, dark, screen, card } = themedScreen()
    editor.setNodeVariableMode([screen.id], collection.id, dark)

    editor.setNodeVariableMode([screen.id], collection.id, undefined)
    expect(getNodeOrThrow(editor.graph, screen.id).variableModes).toEqual({})
    expect(getNodeOrThrow(editor.graph, card.id).fills[0].color).toEqual(RED)
  })

  test('ignores a mode the collection does not have', () => {
    const { editor, collection, screen } = themedScreen()
    editor.setNodeVariableMode([screen.id], collection.id, 'missing')
    expect(getNodeOrThrow(editor.graph, screen.id).variableModes).toEqual({})
  })
})
