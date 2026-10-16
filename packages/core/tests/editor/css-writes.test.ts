import { describe, expect, test } from 'bun:test'

import { createEditor, type CSSWriter } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'
import { layerCSS } from '@kalka/scene-graph/css-model'

function setup(cssWrites: readonly CSSWriter[] = ['panel']) {
  const editor = createEditor({ cssWrites })
  const page = editor.graph.getPages()[0]
  const card = editor.graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 200,
    height: 100,
    layoutMode: 'VERTICAL',
    itemSpacing: 8
  })
  return { editor, page, card }
}

const PANEL_EDITS: [string, Partial<SceneNode>][] = [
  ['opacity', { opacity: 0.4 }],
  ['corner radius', { cornerRadius: 12 }],
  ['gap', { itemSpacing: 24 }],
  ['padding', { paddingTop: 4, paddingRight: 8, paddingBottom: 4, paddingLeft: 8 }],
  ['alignment', { primaryAxisAlign: 'CENTER', counterAxisAlign: 'MAX' }],
  ['blend mode', { blendMode: 'MULTIPLY' }],
  ['size', { width: 320, height: 180 }],
  ['clip', { clipsContent: true }]
]

describe('the properties panel writes CSS', () => {
  for (const [name, changes] of PANEL_EDITS) {
    test(`${name} gives the same layer as a field write`, () => {
      const viaCSS = setup(['panel'])
      const viaFields = setup([])
      viaCSS.editor.updateNodeWithUndo(viaCSS.card.id, changes, name, 'panel')
      viaFields.editor.updateNodeWithUndo(viaFields.card.id, changes, name, 'panel')
      const { id: _a, parentId: _p, style: _s, ...css } = viaCSS.card
      const { id: _b, parentId: _q, style: _t, ...fields } = viaFields.card
      expect(css).toEqual(fields)
      expect(viaCSS.card.style).toEqual({})
    })
  }

  test('CSS written as is gives way only to the fields of its own family, and undo restores it', () => {
    const { editor, page, card } = setup()
    editor.graph.updateNode(card.id, { style: { 'border-radius': '1rem', cursor: 'pointer' } })

    // Writing the CSS reads 1rem into the field, and keeps the declaration as written.
    editor.updateNodeWithUndo(card.id, { opacity: 0.5 }, 'Opacity', 'panel')
    expect(card.cornerRadius).toBe(16)
    expect(card.style).toEqual({ 'border-radius': '1rem', cursor: 'pointer' })

    editor.updateNodeWithUndo(card.id, { cornerRadius: 6 }, 'Radius', 'panel')
    expect(card.style).toEqual({ cursor: 'pointer' })
    expect(layerCSS(card, page)['border-radius']).toBe('6px')

    editor.undo.undo()
    expect(card.cornerRadius).toBe(16)
    expect(card.style).toEqual({ 'border-radius': '1rem', cursor: 'pointer' })
  })

  test('a writer not moved to CSS still sets fields', () => {
    const { editor, card } = setup([])
    editor.graph.updateNode(card.id, { style: { 'border-radius': '1rem' } })
    editor.updateNodeWithUndo(card.id, { cornerRadius: 6 }, 'Radius', 'panel')
    expect(card.cornerRadius).toBe(6)
    expect(card.style).toEqual({})
  })
})
