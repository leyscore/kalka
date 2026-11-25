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
})
