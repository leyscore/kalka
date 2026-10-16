import { describe, expect, test } from 'bun:test'

import { createEditor, type CSSWriter } from '@kalka/core/editor'
import { computeAllLayouts } from '@kalka/core/layout'
import type { SceneNode } from '@kalka/scene-graph'
import { cssWrite, layerCSS } from '@kalka/scene-graph/css-model'

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
    editor.graph.updateNode(
      card.id,
      cssWrite(card, page, { ...layerCSS(card, page), 'border-radius': '1rem', cursor: 'pointer' })
    )
    // Written as CSS, 1rem is read into the field and kept as written.
    expect(card.cornerRadius).toBe(16)
    editor.updateNodeWithUndo(card.id, { opacity: 0.5 }, 'Opacity', 'panel')
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

  test('a move lets the CSS written for position give way, live, and undo brings it back', () => {
    const { editor, page } = setup()
    const box = editor.graph.createNode('FRAME', page.id, { width: 300, height: 200 })
    const badge = editor.graph.createNode('FRAME', box.id, { x: 30, y: 10, width: 40, height: 20 })
    const written = { left: '10%', top: '5%', width: '50%', cursor: 'pointer' }
    editor.graph.updateNode(badge.id, { style: written })
    const original = { x: badge.x, y: badge.y, parentId: box.id, style: badge.style }

    // Each frame of the drag previews the position: the layer follows it on the canvas.
    editor.graph.updateNodePreview(badge.id, { x: 80, y: 60 })
    expect(badge.style).toEqual({ width: '50%', cursor: 'pointer' })
    expect(layerCSS(badge, box)).toMatchObject({ left: '80px', top: '60px', width: '50%' })

    // The drop goes back to where the drag began, then writes where it ended.
    editor.graph.updateNodePreview(badge.id, { x: 30, y: 10, style: original.style })
    editor.updateNode(badge.id, { x: 80, y: 60 }, 'drag')
    editor.commitMoveWithReparent(new Map([[badge.id, original]]))
    expect(badge.style).toEqual({ width: '50%', cursor: 'pointer' })

    editor.undo.undo()
    expect([badge.x, badge.y]).toEqual([30, 10])
    expect(badge.style).toEqual(written)
    editor.undo.redo()
    expect(badge.style).toEqual({ width: '50%', cursor: 'pointer' })
  })

  test('a resize lets the CSS written for size give way, and undo brings it back', () => {
    const { editor, page } = setup()
    const card = editor.graph.createNode('FRAME', page.id, { width: 200, height: 100 })
    editor.graph.updateNode(card.id, { style: { width: '50%', cursor: 'pointer' } })
    const original = { x: 0, y: 0, width: 200, height: 100, style: card.style }

    editor.graph.updateNodePreview(card.id, { width: 260, height: 120 })
    expect(card.style).toEqual({ cursor: 'pointer' })

    editor.graph.updateNodePreview(card.id, original)
    editor.updateNode(card.id, { width: 260, height: 120 }, 'drag')
    editor.commitResize(card.id, original)
    expect(layerCSS(card, page).width).toBe('260px')

    editor.undo.undo()
    expect(card.width).toBe(200)
    expect(card.style).toEqual({ width: '50%', cursor: 'pointer' })
  })

  test('layout measuring a layer keeps the CSS written for it', () => {
    const { editor, page } = setup()
    const row = editor.graph.createNode('FRAME', page.id, {
      layoutMode: 'HORIZONTAL',
      width: 400,
      height: 100,
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })
    const cell = editor.graph.createNode('FRAME', row.id, { width: 50, height: 50, layoutGrow: 1 })
    editor.graph.updateNode(cell.id, { style: { width: '50%', 'flex-grow': '2' } })
    computeAllLayouts(editor.graph, page.id)
    expect(cell.style).toEqual({ width: '50%', 'flex-grow': '2' })
  })
})

