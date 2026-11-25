import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

const VIEWPORT = { width: 800, height: 600 }

/** The world point at the center of the viewport. */
function center(editor: ReturnType<typeof createEditor>) {
  const { panX, panY, zoom } = editor.state
  return { x: (VIEWPORT.width / 2 - panX) / zoom, y: (VIEWPORT.height / 2 - panY) / zoom }
}

describe('zoomToLevel', () => {
  test.each([0.5, 1, 4])('keeps the centered point in place when zooming from 2 to %p', (level) => {
    const editor = createEditor({ getViewportSize: () => VIEWPORT })
    editor.state.zoom = 2
    editor.state.panX = -300
    editor.state.panY = 120
    const before = center(editor)

    editor.zoomToLevel(level)

    expect(editor.state.zoom).toBe(level)
    expect(center(editor)).toEqual(before)
  })
})

describe('centerOn', () => {
  test('puts the point at the center at the given zoom', () => {
    const editor = createEditor({ getViewportSize: () => VIEWPORT })
    editor.centerOn(300, 200, 2)
    expect(editor.state.zoom).toBe(2)
    expect(center(editor)).toEqual({ x: 300, y: 200 })
  })

  test('leaves the view alone for a point too far away to represent', () => {
    const editor = createEditor({ getViewportSize: () => VIEWPORT })
    const before = { ...center(editor), zoom: editor.state.zoom }
    editor.centerOn(1e308, 0, 256)
    expect({ ...center(editor), zoom: editor.state.zoom }).toEqual(before)
  })
})

describe('zoomToSelection', () => {
  function editorWithSmallFrame() {
    const editor = createEditor({ getViewportSize: () => VIEWPORT })
    const id = editor.createShape('FRAME', 100, 100, 180, 200)
    editor.select([id])
    return editor
  }

  test('keeps a small selection at 100% by default', () => {
    const editor = editorWithSmallFrame()
    editor.zoomToSelection()
    expect(editor.state.zoom).toBe(1)
    expect(center(editor)).toEqual({ x: 190, y: 200 })
  })

  test('fills the view with a small selection when allowed past 100%', () => {
    const editor = editorWithSmallFrame()
    editor.zoomToSelection(Number.POSITIVE_INFINITY)
    expect(editor.state.zoom).toBeGreaterThan(1)
    expect(center(editor).x).toBeCloseTo(190)
    expect(center(editor).y).toBeCloseTo(200)
  })
})
