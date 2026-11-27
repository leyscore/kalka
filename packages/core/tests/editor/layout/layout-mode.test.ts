import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

describe('adding auto layout to a frame', () => {
  test('keeps an empty frame at its size, as Figma does', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      width: 1440,
      height: 900
    })
    editor.setLayoutMode(frame.id, 'VERTICAL')
    const node = getNodeOrThrow(editor.graph, frame.id)
    expect([node.width, node.height]).toEqual([1440, 900])
    expect([node.primaryAxisSizing, node.counterAxisSizing]).toEqual(['FIXED', 'FIXED'])
  })

  test('hugs its layers with the padding and spacing they already have', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      width: 395,
      height: 160
    })
    for (const x of [40, 158, 276]) {
      editor.graph.createNode('RECTANGLE', frame.id, { x, y: 30, width: 92, height: 53 })
    }
    editor.setLayoutMode(frame.id, 'HORIZONTAL')
    const node = getNodeOrThrow(editor.graph, frame.id)
    expect({
      spacing: node.itemSpacing,
      padding: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft],
      size: [node.width, node.height]
    }).toEqual({ spacing: 26, padding: [30, 27, 77, 40], size: [395, 160] })

    editor.undoAction()
    expect(getNodeOrThrow(editor.graph, frame.id).layoutMode).toBe('NONE')
  })

  test('Shift+A reads a row from layers side by side and keeps them in place', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      width: 540,
      height: 540
    })
    // Drawn right to left, so the layer order is not the reading order.
    const right = editor.graph.createNode('RECTANGLE', frame.id, {
      name: 'Right',
      x: 216,
      y: 54,
      width: 144,
      height: 54
    })
    const left = editor.graph.createNode('RECTANGLE', frame.id, {
      name: 'Left',
      x: 36,
      y: 54,
      width: 144,
      height: 54
    })
    editor.addAutoLayout(frame.id)
    const node = getNodeOrThrow(editor.graph, frame.id)
    expect({
      mode: node.layoutMode,
      spacing: node.itemSpacing,
      padding: [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft],
      size: [node.width, node.height],
      order: node.childIds,
      places: [left.id, right.id].map((id) => getNodeOrThrow(editor.graph, id).x)
    }).toEqual({
      mode: 'HORIZONTAL',
      spacing: 36,
      padding: [54, 180, 432, 36],
      size: [540, 540],
      order: [left.id, right.id],
      places: [36, 216]
    })

    editor.undoAction()
    const undone = getNodeOrThrow(editor.graph, frame.id)
    expect(undone.layoutMode).toBe('NONE')
    expect(undone.childIds).toEqual([right.id, left.id])
  })
})

describe('changing the flow of a frame', () => {
  function grid(editor: ReturnType<typeof createEditor>) {
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      width: 400,
      height: 200
    })
    for (const x of [0, 120, 240])
      editor.graph.createNode('RECTANGLE', frame.id, { x, y: 0, width: 100, height: 100 })
    editor.setLayoutMode(frame.id, 'HORIZONTAL')
    return frame.id
  }

  test('a frame that hugged its layers keeps hugging them as a grid', () => {
    const editor = createEditor()
    const id = grid(editor)
    expect(getNodeOrThrow(editor.graph, id).primaryAxisSizing).toBe('HUG')
    editor.setLayoutMode(id, 'GRID')
    const node = getNodeOrThrow(editor.graph, id)
    expect([node.primaryAxisSizing, node.counterAxisSizing]).toEqual(['HUG', 'HUG'])
  })

  test('keeps the gaps when it goes from a grid to a row and back', () => {
    const editor = createEditor()
    const id = grid(editor)
    editor.setLayoutMode(id, 'GRID')
    editor.graph.updateNode(id, { gridColumnGap: 24, gridRowGap: 16 })
    editor.setLayoutMode(id, 'HORIZONTAL')
    let node = getNodeOrThrow(editor.graph, id)
    expect([node.itemSpacing, node.counterAxisSpacing]).toEqual([24, 16])
    editor.setLayoutMode(id, 'GRID')
    node = getNodeOrThrow(editor.graph, id)
    expect([node.gridColumnGap, node.gridRowGap]).toEqual([24, 16])
  })
})
