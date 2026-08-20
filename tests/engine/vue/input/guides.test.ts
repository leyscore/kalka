import { describe, expect, test } from 'bun:test'

import { ref } from 'vue'

import { createEditor } from '@open-pencil/core/editor'

import { createGuideInput } from '#vue/canvas/guides/input'
import type { DragState } from '#vue/shared/input/types'

function setup() {
  const editor = createEditor()
  Object.assign(editor.state, { showRulers: true })
  let drag: DragState | null = null
  const input = createGuideInput({
    canvasRef: ref<HTMLCanvasElement | null>(null),
    editor,
    canvasToLocal: (cx, cy) => ({ lx: cx, ly: cy }),
    setDrag: (next) => {
      drag = next
    },
    setCursor: () => undefined
  })
  return { editor, input, getDrag: () => drag }
}

describe('guide canvas input', () => {
  test('does not create a guide from a ruler click without movement', () => {
    const { editor, input, getDrag } = setup()
    expect(input.tryStartFromRuler(100, 5, 100, 5)).toBe(true)
    const drag = getDrag()
    expect(drag?.type).toBe('guide')
    if (drag?.type === 'guide') input.finish(drag)
    expect(editor.graph.getNode(editor.state.currentPageId)?.guides).toEqual([])
  })

  test('publishes live preview after the drag threshold and commits on release', () => {
    const { editor, input, getDrag } = setup()
    input.tryStartFromRuler(100, 5, 100, 5)
    const drag = getDrag()
    if (drag?.type !== 'guide') throw new Error('Expected guide drag')

    input.handleMove(drag, 100, 40, 100, 40)
    expect(editor.state.guides.preview).toMatchObject({ axis: 'y', position: 40 })
    expect(editor.graph.getNode(editor.state.currentPageId)?.guides).toEqual([])

    input.finish(drag)
    expect(editor.graph.getNode(editor.state.currentPageId)?.guides[0]).toMatchObject({
      axis: 'y',
      position: 40
    })
  })

  test('ruler hover takes precedence over an intersecting existing guide', () => {
    const { editor, input } = setup()
    editor.addGuide(editor.state.currentPageId, 'x', 100)
    expect(input.updateHover(100, 5)).toBe('ns-resize')
    expect(editor.state.guides.hovered).toBeNull()
  })
})
