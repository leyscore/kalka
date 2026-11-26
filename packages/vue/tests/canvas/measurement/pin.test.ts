import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, type Editor } from '@kalka/core/editor'
import { addMeasurement, measurementSpan } from '@kalka/scene-graph'

import { createMeasurementPin, pickPinnedMeasurement } from '#vue/canvas/measurement/pin'

let editor: Editor

interface Press {
  button: number
  x: number
  y: number
}

afterEach(() => editor.dispose())

function setup() {
  editor = createEditor()
  const page = editor.state.currentPageId
  const a = editor.graph.createNode('RECTANGLE', page, { x: 0, y: 0, width: 100, height: 100 })
  const b = editor.graph.createNode('RECTANGLE', page, { x: 160, y: 20, width: 40, height: 40 })
  const frame = editor.graph.createNode('FRAME', page, {
    x: 300,
    y: 0,
    width: 200,
    height: 200
  })
  const inner = editor.graph.createNode('RECTANGLE', frame.id, {
    x: 30,
    y: 50,
    width: 100,
    height: 60
  })
  return { a, b, frame, inner }
}

function measuring(selected: string, hovered: string) {
  editor.select([selected])
  editor.setHoveredNode(hovered)
  editor.setMeasurementMode('shallow')
}

describe('pinning a measurement with Alt-click', () => {
  test('pins the gap clicked between two layers, which then measures the same distance', () => {
    const { a, b } = setup()
    measuring(a.id, b.id)
    // The gap runs from x 100 to 160 across the middle of where both layers overlap.
    const picked = pickPinnedMeasurement(editor, 130, 40)
    expect(picked).toEqual({
      from: a.id,
      measurement: { toNodeId: b.id, side: 'right', toSameSide: false }
    })
    const author = { kind: 'person' as const, name: 'Ada' }
    const thread = picked && addMeasurement(editor.graph, picked.from, author, picked.measurement)
    expect(thread && measurementSpan(editor.graph, thread)?.distance).toBe(60)
  })

  test('inside a frame, pins the inset nearest the pointer', () => {
    const { frame, inner } = setup()
    measuring(inner.id, frame.id)
    // The top inset runs from y 0 to 50 at the middle of the inner layer (x 380).
    expect(pickPinnedMeasurement(editor, 380, 20)?.measurement).toEqual({
      toNodeId: frame.id,
      side: 'top',
      toSameSide: true
    })
    expect(pickPinnedMeasurement(editor, 470, 80)?.measurement).toEqual({
      toNodeId: frame.id,
      side: 'right',
      toSameSide: true
    })
  })

  test('pins nothing while not measuring or without a hovered layer', () => {
    const { a, b } = setup()
    measuring(a.id, b.id)
    editor.setMeasurementMode('off')
    expect(pickPinnedMeasurement(editor, 130, 40)).toBeNull()
    editor.setMeasurementMode('shallow')
    editor.setHoveredNode(null)
    expect(pickPinnedMeasurement(editor, 130, 40)).toBeNull()
  })

  test('an Alt-press pins on release, and hands the press back once it drags', () => {
    const { a, b } = setup()
    measuring(a.id, b.id)
    const pinned: string[] = []
    const coords = (e: Press) => ({ sx: e.x, sy: e.y, cx: e.x, cy: e.y })
    const pin = createMeasurementPin(editor, coords, (_, measurement) => {
      pinned.push(measurement.side)
      return true
    })
    const press = { button: 0, x: 130, y: 40 }
    expect(pin.press(press)).toBe(true)
    expect(pin.move({ button: 0, x: 131, y: 40 })).toBeNull()
    expect(pin.release()).toBe(true)
    expect(pinned).toEqual(['right'])

    expect(pin.press(press)).toBe(true)
    expect(pin.move({ button: 0, x: 150, y: 40 })).toBe(press)
    expect(pin.release()).toBe(false)
    expect(pinned).toEqual(['right'])
  })
})
