import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, TOOL_SHORTCUTS, type Editor } from '@kalka/core/editor'
import { lineEndCaps } from '@kalka/scene-graph/arrow-caps'

import { handleDrawMove, startShapeDraw } from '#vue/shared/input/draw'
import type { DragState } from '#vue/shared/input/types'

let editor: Editor | null = null

afterEach(() => {
  editor?.dispose()
  editor = null
})

function drawArrow(editor: Editor, from: [number, number], to: [number, number]) {
  editor.setTool('ARROW')
  let drag: DragState | null = null
  startShapeDraw(from[0], from[1], editor, (d) => {
    drag = d
  })
  const drawing = drag as DragState | null
  if (drawing?.type !== 'draw') throw new Error('Expected a drawing')
  handleDrawMove(drawing, to[0], to[1], false)
  drawing.commit()
  const created = editor.graph.getNode(drawing.nodeId)
  if (!created) throw new Error('Expected a drawn arrow')
  return created
}

describe('the Arrow tool', () => {
  test('takes Shift+L, as in Figma', () => {
    expect(TOOL_SHORTCUTS['Shift+KeyL']).toBe('ARROW')
    expect(TOOL_SHORTCUTS.KeyL).toBe('LINE')
  })

  test('draws a line named Arrow with a line arrowhead at its end only', () => {
    const ed = createEditor()
    editor = ed
    const arrow = drawArrow(ed, [100, 100], [300, 100])
    expect(arrow).toMatchObject({ type: 'LINE', name: 'Arrow 1', width: 200, height: 0 })
    expect(arrow.strokes).toHaveLength(1)
    expect(lineEndCaps(arrow.strokeCap, arrow.vectorNetwork)).toEqual({
      start: 'NONE',
      end: 'ARROW_LINES'
    })
    expect(ed.state.activeTool).toBe('SELECT')
    expect(drawArrow(ed, [100, 200], [100, 300]).name).toBe('Arrow 2')
  })

  test('undoes in one step', () => {
    const ed = createEditor()
    editor = ed
    const arrow = drawArrow(ed, [0, 0], [120, 40])
    ed.undo.undo()
    expect(ed.graph.getNode(arrow.id)).toBeUndefined()
    ed.undo.redo()
    const back = ed.graph.getNode(arrow.id)
    expect(back && lineEndCaps(back.strokeCap, back.vectorNetwork).end).toBe('ARROW_LINES')
  })
})
