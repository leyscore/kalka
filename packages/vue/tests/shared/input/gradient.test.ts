import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, type Editor } from '@kalka/core/editor'
import type { Fill } from '@kalka/scene-graph'
import {
  DEFAULT_GRADIENT_TRANSFORM,
  IDENTITY_GRADIENT_TRANSFORM
} from '@kalka/scene-graph/gradient'
import type { Vector } from '@kalka/scene-graph/primitives'

import {
  cancelGradientHandle,
  commitGradientHandle,
  dragGradientHandle,
  gradientHandles,
  handleGradientHandleMove,
  hitGradientHandle,
  hoverGradientHandle,
  tryStartGradientHandle
} from '#vue/shared/input/gradient'

const SIZE = { width: 200, height: 100 }

function gradient(type: Fill['type'], gradientTransform = DEFAULT_GRADIENT_TRANSFORM): Fill {
  return {
    type,
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    gradientTransform,
    gradientStops: [
      { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
      { color: { r: 0, g: 1, b: 0, a: 1 }, position: 0.25 },
      { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
    ]
  }
}

function expectPoint(actual: Vector | null | undefined, expected: Vector) {
  expect(actual?.x).toBeCloseTo(expected.x)
  expect(actual?.y).toBeCloseTo(expected.y)
}

describe('gradient handles', () => {
  test('a new linear gradient runs down the middle of the layer with its stops along it', () => {
    const handles = gradientHandles(SIZE, gradient('GRADIENT_LINEAR'))
    expectPoint(handles.start, { x: 100, y: 0 })
    expectPoint(handles.end, { x: 100, y: 100 })
    expect(handles.width).toBeNull()
    expectPoint(handles.stops[1], { x: 100, y: 25 })
  })

  test('dragging an end of a linear gradient moves that end alone', () => {
    const fill = gradient('GRADIENT_LINEAR')
    const moved = gradientHandles(SIZE, dragGradientHandle(SIZE, fill, 'end', { x: 200, y: 50 }))
    expectPoint(moved.start, { x: 100, y: 0 })
    expectPoint(moved.end, { x: 200, y: 50 })
  })

  test('the centre of a radial gradient carries its ellipse', () => {
    const fill = gradient('GRADIENT_RADIAL', IDENTITY_GRADIENT_TRANSFORM)
    const handles = gradientHandles(SIZE, fill)
    expectPoint(handles.start, { x: 100, y: 50 })
    expectPoint(handles.end, { x: 200, y: 50 })
    expectPoint(handles.width, { x: 100, y: 100 })

    const moved = gradientHandles(SIZE, dragGradientHandle(SIZE, fill, 'start', { x: 60, y: 40 }))
    expectPoint(moved.start, { x: 60, y: 40 })
    expectPoint(moved.end, { x: 160, y: 40 })
    expectPoint(moved.width, { x: 60, y: 90 })
  })

  test('turning a radial gradient keeps its second radius square to the first', () => {
    const fill = gradient('GRADIENT_RADIAL', IDENTITY_GRADIENT_TRANSFORM)
    const turned = gradientHandles(SIZE, dragGradientHandle(SIZE, fill, 'end', { x: 100, y: 0 }))
    expectPoint(turned.end, { x: 100, y: 0 })
    expectPoint(turned.width, { x: 150, y: 50 })
  })

  test('the width handle sets the second radius only', () => {
    const fill = gradient('GRADIENT_RADIAL', IDENTITY_GRADIENT_TRANSFORM)
    const widened = gradientHandles(
      SIZE,
      dragGradientHandle(SIZE, fill, 'width', { x: 130, y: 90 })
    )
    expectPoint(widened.end, { x: 200, y: 50 })
    expectPoint(widened.width, { x: 100, y: 90 })
  })

  test('a stop slides along the gradient line, clamped to its ends', () => {
    const fill = gradient('GRADIENT_LINEAR')
    const slid = dragGradientHandle(SIZE, fill, 1, { x: 140, y: 60 })
    expect(slid.gradientStops?.[1].position).toBeCloseTo(0.6)
    const past = dragGradientHandle(SIZE, fill, 1, { x: 100, y: 180 })
    expect(past.gradientStops?.[1].position).toBe(1)
  })
})

describe('dragging gradient handles on the canvas', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.dispose()
    editor = null
  })

  function setup() {
    const ed = createEditor()
    editor = ed
    const rect = ed.graph.createNode('RECTANGLE', ed.state.currentPageId, {
      x: 100,
      y: 100,
      ...SIZE,
      fills: [gradient('GRADIENT_LINEAR')]
    })
    ed.select([rect.id])
    return { ed, rect }
  }

  function open(ed: Editor, nodeId: string) {
    ed.setGradientEdit({
      nodeId,
      paint: 'fills',
      index: 0,
      activeStop: 0,
      handle: null,
      dragging: false
    })
  }

  test('show only while the picker shows the gradient of the selected layer', () => {
    const { ed, rect } = setup()
    expect(hitGradientHandle(ed, 200, 200)).toBeNull()
    open(ed, rect.id)
    expect(hitGradientHandle(ed, 200, 200)?.handle).toBe('end')
    expect(hitGradientHandle(ed, 200, 125)?.handle).toBe(1)
    ed.clearSelection()
    expect(hitGradientHandle(ed, 200, 200)).toBeNull()
  })

  test('hovering lights a handle and a drag records one undo step', () => {
    const { ed, rect } = setup()
    open(ed, rect.id)
    expect(hoverGradientHandle(ed, 200, 100)).toBe('pointer')
    expect(ed.state.gradientEdit?.handle).toBe('start')

    const drag = tryStartGradientHandle(ed, 200, 200)
    if (!drag) throw new Error('no gradient handle under the press')
    expect(ed.state.gradientEdit?.dragging).toBe(true)
    handleGradientHandleMove(drag, 250, 180, ed)
    handleGradientHandleMove(drag, 300, 150, ed)
    commitGradientHandle(drag, ed)
    expect(ed.state.gradientEdit?.dragging).toBe(false)
    const moved = ed.graph.getNode(rect.id)?.fills[0]
    expectPoint(moved && gradientHandles(SIZE, moved).end, { x: 200, y: 50 })

    ed.undoAction()
    expect(ed.graph.getNode(rect.id)?.fills[0].gradientTransform).toEqual(
      DEFAULT_GRADIENT_TRANSFORM
    )
  })

  test('dragging a stop selects it, and a cancelled drag puts the gradient back', () => {
    const { ed, rect } = setup()
    open(ed, rect.id)
    const drag = tryStartGradientHandle(ed, 200, 125)
    if (!drag) throw new Error('no gradient stop under the press')
    expect(ed.state.gradientEdit?.activeStop).toBe(1)
    handleGradientHandleMove(drag, 200, 170, ed)
    expect(ed.graph.getNode(rect.id)?.fills[0].gradientStops?.[1].position).toBeCloseTo(0.7)
    cancelGradientHandle(drag, ed)
    expect(ed.graph.getNode(rect.id)?.fills[0].gradientStops?.[1].position).toBe(0.25)
  })
})
