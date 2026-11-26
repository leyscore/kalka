import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

describe('Rasterize selection', () => {
  test('replaces the selected layers with one image where the lowest was, undoably', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      x: 100,
      y: 100,
      width: 400,
      height: 400
    })
    const below = editor.graph.createNode('RECTANGLE', frame.id, { x: 10, y: 10 })
    const first = editor.graph.createNode('RECTANGLE', frame.id, { x: 20, y: 30 })
    const second = editor.graph.createNode('ELLIPSE', frame.id, { x: 60, y: 30 })
    editor.select([first.id, second.id])

    const id = editor.replaceSelectionWithImage(PNG, { minX: 120, minY: 130, maxX: 220, maxY: 180 })
    const image = id ? editor.graph.getNode(id) : undefined
    expect(image).toMatchObject({ type: 'RECTANGLE', name: 'Image', x: 20, y: 30 })
    expect([image?.width, image?.height]).toEqual([100, 50])
    const fill = image?.fills[0]
    expect(fill?.type).toBe('IMAGE')
    expect(fill?.imageHash ? editor.graph.images.get(fill.imageHash) : null).toEqual(PNG)
    expect(editor.graph.getNode(frame.id)?.childIds).toEqual([below.id, id ?? ''])
    expect([...editor.state.selectedIds]).toEqual([id ?? ''])

    editor.undo.undo()
    expect(editor.graph.getNode(frame.id)?.childIds).toEqual([below.id, first.id, second.id])
    expect([...editor.state.selectedIds]).toEqual([first.id, second.id])
  })

  test('refuses layers of different parents', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const frame = editor.graph.createNode('FRAME', pageId, {})
    const inside = editor.graph.createNode('RECTANGLE', frame.id, {})
    const outside = editor.graph.createNode('RECTANGLE', pageId, {})
    editor.select([inside.id, outside.id])
    expect(editor.replaceSelectionWithImage(PNG, { minX: 0, minY: 0, maxX: 10, maxY: 10 })).toBe(
      null
    )
  })
})
