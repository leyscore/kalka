import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { computeAllLayouts } from '@kalka/core/layout'
import { cssWrite, layerCSS } from '@kalka/scene-graph/css-model'

function setup() {
  const editor = createEditor()
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

describe('editing a layer’s fields writes its CSS', () => {
  test('CSS written as is gives way only to the fields of its own family, and undo restores it', () => {
    const { editor, page, card } = setup()
    editor.graph.updateNode(
      card.id,
      cssWrite(card, page, { ...layerCSS(card, page), 'border-radius': '1rem', cursor: 'pointer' })
    )
    // Written as CSS, 1rem is read into the field and kept as written.
    expect(card.cornerRadius).toBe(16)
    editor.updateNodeWithUndo(card.id, { opacity: 0.5 }, 'Opacity')
    expect(card.style).toEqual({ 'border-radius': '1rem', cursor: 'pointer' })

    editor.updateNodeWithUndo(card.id, { cornerRadius: 6 }, 'Radius')
    expect(card.style).toEqual({ cursor: 'pointer' })
    expect(layerCSS(card, page)['border-radius']).toBe('6px')

    editor.undo.undo()
    expect(card.cornerRadius).toBe(16)
    expect(card.style).toEqual({ 'border-radius': '1rem', cursor: 'pointer' })
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
    editor.updateNode(badge.id, { x: 80, y: 60 })
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
    // Half of a 400px parent, which the browser lays out as 200.
    const parent = editor.graph.createNode('FRAME', page.id, { width: 400, height: 200 })
    const card = editor.graph.createNode('FRAME', parent.id, { width: 200, height: 100 })
    editor.graph.updateNode(card.id, { style: { width: '50%', cursor: 'pointer' } })
    const original = { x: 0, y: 0, width: 200, height: 100, style: card.style }

    editor.graph.updateNodePreview(card.id, { width: 260, height: 120 })
    expect(card.style).toEqual({ cursor: 'pointer' })

    editor.graph.updateNodePreview(card.id, original)
    editor.updateNode(card.id, { width: 260, height: 120 })
    editor.commitResize(card.id, original)
    expect(layerCSS(card, parent).width).toBe('260px')

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

