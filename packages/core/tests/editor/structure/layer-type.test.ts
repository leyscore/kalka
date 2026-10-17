import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { getAxisAlignedWorldBounds } from '@kalka/scene-graph/coordinate'

// Each case repeats the layer type menu in Figma desktop 126's properties panel.

function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const frame = editor.graph.createNode('FRAME', page, {
    x: 9000,
    y: 100,
    width: 200,
    height: 150,
    fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 1, a: 1 }, opacity: 1, visible: true }],
    strokes: [
      {
        type: 'SOLID',
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true,
        weight: 1,
        align: 'INSIDE'
      }
    ],
    cornerRadius: 8,
    clipsContent: true,
    opacity: 0.8,
    effects: [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        spread: 0,
        visible: true
      }
    ]
  })
  const box = editor.graph.createNode('RECTANGLE', frame.id, {
    x: 20,
    y: 30,
    width: 50,
    height: 40
  })
  // Sticks out past the frame's right and bottom edges.
  const dot = editor.graph.createNode('ELLIPSE', frame.id, {
    x: 180,
    y: 120,
    width: 60,
    height: 60
  })
  return { editor, frame, box, dot }
}

const canvasBox = (editor: ReturnType<typeof createEditor>, id: string) => {
  const node = editor.graph.getNode(id)
  if (!node) throw new Error(`Missing ${id}`)
  const { x, y, width, height } = getAxisAlignedWorldBounds(node, editor.graph)
  return [x, y, width, height]
}

describe('layer type menu', () => {
  test('a frame becomes a group in place, fitting its layers and keeping its effects', () => {
    const { editor, frame, box, dot } = setup()
    const boxBefore = canvasBox(editor, box.id)
    const dotBefore = canvasBox(editor, dot.id)
    editor.convertLayerType(frame.id, 'GROUP')
    const group = editor.graph.getNode(frame.id)
    expect(group).toMatchObject({
      type: 'GROUP',
      fills: [],
      strokes: [],
      cornerRadius: 0,
      opacity: 0.8
    })
    expect(group?.effects).toHaveLength(1)
    expect(canvasBox(editor, frame.id)).toEqual([9020, 130, 220, 150])
    expect(canvasBox(editor, box.id)).toEqual(boxBefore)
    expect(canvasBox(editor, dot.id)).toEqual(dotBefore)

    editor.undo.undo()
    expect(editor.graph.getNode(frame.id)).toMatchObject({
      type: 'FRAME',
      x: 9000,
      y: 100,
      width: 200,
      height: 150,
      cornerRadius: 8,
      clipsContent: true
    })
    expect(editor.graph.getNode(frame.id)?.fills).toHaveLength(1)
    expect(canvasBox(editor, dot.id)).toEqual(dotBefore)
    editor.undo.redo()
    expect(editor.graph.getNode(frame.id)?.type).toBe('GROUP')
    expect(canvasBox(editor, frame.id)).toEqual([9020, 130, 220, 150])
  })

  test('a group becomes a frame of its bounds that clips, with no fill', () => {
    const { editor, frame } = setup()
    editor.convertLayerType(frame.id, 'GROUP')
    editor.convertLayerType(frame.id, 'FRAME')
    expect(editor.graph.getNode(frame.id)).toMatchObject({
      type: 'FRAME',
      fills: [],
      clipsContent: true,
      opacity: 0.8
    })
    expect(canvasBox(editor, frame.id)).toEqual([9020, 130, 220, 150])
  })

  test('undo brings back a frame’s linked fill, stroke, and guide styles', () => {
    const { editor, frame } = setup()
    const styles = { fillStyleId: '1:10', strokeStyleId: '1:11', gridStyleId: '1:12' }
    editor.graph.updateNode(frame.id, styles)
    editor.convertLayerType(frame.id, 'GROUP')
    expect(editor.graph.getNode(frame.id)).toMatchObject({
      fillStyleId: null,
      strokeStyleId: null,
      gridStyleId: null
    })
    editor.undo.undo()
    expect(editor.graph.getNode(frame.id)).toMatchObject(styles)
  })

  test('an empty frame has nothing to group', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {
      width: 100,
      height: 100
    })
    editor.convertLayerType(frame.id, 'GROUP')
    expect(editor.graph.getNode(frame.id)?.type).toBe('FRAME')
  })
})
