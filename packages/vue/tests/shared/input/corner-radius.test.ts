import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, type Editor } from '@kalka/core/editor'

import {
  cornerRadiusChanges,
  cornerRadiusHandles,
  commitCornerRadius,
  handleCornerRadiusMove,
  hitCornerRadiusHandle,
  hoverCornerRadiusHandle,
  radiusAtDepth,
  showsCornerRadiusHandles,
  tryStartCornerRadius
} from '#vue/shared/input/corner-radius'

let editor: Editor | null = null

afterEach(() => {
  editor?.dispose()
  editor = null
})

function setup(fields = {}) {
  const ed = createEditor()
  editor = ed
  const rect = ed.graph.createNode('RECTANGLE', ed.state.currentPageId, {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    ...fields
  })
  ed.select([rect.id])
  return { ed, rect }
}

describe('corner radius handles', () => {
  test('show on a selected box large enough on screen, inset from each corner', () => {
    const { ed, rect } = setup()
    expect(showsCornerRadiusHandles(rect, 1)).toBe(true)
    expect(showsCornerRadiusHandles(rect, 0.2)).toBe(false)
    const handles = cornerRadiusHandles(rect, 1)
    expect(handles.map(({ corner, x, y }) => ({ corner, x, y }))).toEqual([
      { corner: 'nw', x: 12, y: 12 },
      { corner: 'ne', x: 188, y: 12 },
      { corner: 'se', x: 188, y: 88 },
      { corner: 'sw', x: 12, y: 88 }
    ])
    ed.updateNode(rect.id, { cornerRadius: 30 })
    const rounded = ed.graph.getNode(rect.id)
    expect(rounded && cornerRadiusHandles(rounded, 1)[0]).toMatchObject({ x: 30, y: 30 })
    expect(hitCornerRadiusHandle(ed, 130, 130)?.corner).toBe('nw')
    expect(hitCornerRadiusHandle(ed, 150, 150)).toBeNull()
  })

  test('show while the pointer is over the selected layer and light the one under it', () => {
    const { ed, rect } = setup()
    expect(hoverCornerRadiusHandle(ed, 150, 150)).toBeNull()
    expect(ed.state.cornerRadiusHandle).toEqual({ nodeId: rect.id, corner: null, dragging: false })
    expect(hoverCornerRadiusHandle(ed, 112, 112)).toBe('pointer')
    expect(ed.state.cornerRadiusHandle?.corner).toBe('nw')
    hoverCornerRadiusHandle(ed, 600, 600)
    expect(ed.state.cornerRadiusHandle).toBeNull()
  })

  test('dragging a handle rounds every corner, clamped to half the short side, in one undo', () => {
    const { ed, rect } = setup()
    const drag = tryStartCornerRadius(ed, 112, 112, false)
    if (!drag) throw new Error('Expected a radius drag')
    expect(ed.state.cornerRadiusHandle).toMatchObject({ corner: 'nw', dragging: true })
    handleCornerRadiusMove(drag, 130, 130, ed)
    expect(ed.graph.getNode(rect.id)).toMatchObject({
      cornerRadius: 18,
      independentCorners: false,
      bottomRightRadius: 18
    })
    handleCornerRadiusMove(drag, 400, 400, ed)
    expect(ed.graph.getNode(rect.id)?.cornerRadius).toBe(50)
    commitCornerRadius(drag, ed)
    expect(ed.state.cornerRadiusHandle).toBeNull()
    ed.undo.undo()
    expect(ed.graph.getNode(rect.id)?.cornerRadius).toBe(0)
  })

  test('Option drags one corner and keeps the others', () => {
    const { ed, rect } = setup({ cornerRadius: 8 })
    const handle = cornerRadiusHandles(rect, 1).find((h) => h.corner === 'se')
    if (!handle) throw new Error('Expected the se handle')
    const drag = tryStartCornerRadius(ed, 100 + handle.x, 100 + handle.y, true)
    if (!drag) throw new Error('Expected a radius drag')
    handleCornerRadiusMove(drag, 100 + handle.x - 20, 100 + handle.y - 20, ed)
    expect(ed.graph.getNode(rect.id)).toMatchObject({
      independentCorners: true,
      topLeftRadius: 8,
      topRightRadius: 8,
      bottomLeftRadius: 8,
      bottomRightRadius: 28
    })
  })

  test('a small radius grows past the press and shrinks to nothing at the corner', () => {
    const drag = { startDepth: 12, startRadius: 4 }
    expect(radiusAtDepth(drag, 12)).toBe(4)
    expect(radiusAtDepth(drag, 22)).toBe(14)
    expect(radiusAtDepth(drag, 6)).toBe(2)
    expect(radiusAtDepth(drag, -5)).toBe(0)
  })

  test('uniform changes reset independent corners', () => {
    const original = {
      cornerRadius: 0,
      independentCorners: true,
      topLeftRadius: 2,
      topRightRadius: 4,
      bottomRightRadius: 6,
      bottomLeftRadius: 8
    }
    expect(cornerRadiusChanges(original, 'ne', 10, false)).toMatchObject({
      independentCorners: false,
      topLeftRadius: 10,
      bottomLeftRadius: 10
    })
  })
})
