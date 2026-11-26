import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('the pencil', () => {
  test('smooths a freehand stroke into a few curves and keeps the tool', () => {
    const editor = createEditor()
    editor.setTool('PENCIL')
    editor.pencilBegin(100, 100)
    for (let i = 1; i <= 120; i++) editor.pencilExtend(100 + i * 2, 100 + 40 * Math.sin(i / 12))
    expect(editor.state.pencilStroke?.length).toBeGreaterThan(100)

    const id = editor.pencilCommit()
    const node = id ? editor.graph.getNode(id) : undefined
    expect(node?.type).toBe('VECTOR')
    expect(node?.vectorNetwork?.segments.length).toBeLessThan(12)
    expect(node?.vectorNetwork?.regions).toEqual([])
    expect(node?.strokes[0]?.weight).toBe(2)
    expect(node?.x).toBeCloseTo(100)
    expect(node?.width).toBeCloseTo(240)
    expect(editor.state.pencilStroke).toBeNull()
    expect(editor.state.activeTool).toBe('PENCIL')

    editor.undo.undo()
    expect(editor.graph.getNode(node?.id ?? '')).toBeUndefined()
    editor.dispose()
  })

  test('a click without a stroke draws nothing', () => {
    const editor = createEditor()
    editor.pencilBegin(10, 10)
    expect(editor.pencilCommit()).toBeNull()
    expect(editor.state.pencilStroke).toBeNull()
    editor.dispose()
  })
})
