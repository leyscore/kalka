import { expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

const BLUE = { r: 0.184, g: 0.357, b: 0.918, a: 1 }
const ORANGE = { r: 0.91, g: 0.35, b: 0.05, a: 1 }

function boundFill() {
  const graph = new SceneGraph()
  const brand = graph.createCollection('Brand')
  const accent = graph.createVariable('accent', 'COLOR', brand.id, BLUE)
  const page = graph.getPages()[0].id
  const button = graph.createNode('RECTANGLE', page, {
    fills: [{ type: 'SOLID', color: BLUE, opacity: 1, visible: true }],
    boundVariables: { 'fills/0/color': accent.id }
  })
  return { editor: createEditor({ graph }), brand, accent, button }
}

test('a fill bound to a color variable takes an edited value, as an update the canvas sees', () => {
  const { editor, brand, accent, button } = boundFill()
  const updated: string[] = []
  editor.onEditorEvent('node:updated', (id, changes) => {
    if ('fills' in changes) updated.push(id)
  })

  editor.updateVariableValue(accent.id, brand.defaultModeId, ORANGE)

  expect(button.fills[0]?.color).toEqual(ORANGE)
  expect(updated).toEqual([button.id])

  editor.undo.undo()
  expect(button.fills[0]?.color).toEqual(BLUE)
})

test('a variable edit leaves fills that already show its value untouched', () => {
  const { editor, brand, accent } = boundFill()
  const updated: string[] = []
  editor.onEditorEvent('node:updated', (id) => updated.push(id))

  editor.updateVariableValue(accent.id, brand.defaultModeId, BLUE)

  expect(updated).toEqual([])
})
