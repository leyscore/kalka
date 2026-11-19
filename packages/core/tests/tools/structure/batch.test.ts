import { describe, expect, test } from 'bun:test'

import { executeAtomicTool } from '@kalka/core/editor'
import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'
import { UndoManager } from '@kalka/scene-graph/undo'

import { expectDefined } from '#core-tests/helpers/assert'

const batchUpdate = expectDefined(
  ALL_TOOLS.find((tool) => tool.name === 'batch_update'),
  'batch_update'
)

function setup() {
  const graph = new SceneGraph()
  const undo = new UndoManager()
  const figma = new FigmaAPI(graph)
  const editor = {
    graph,
    runLayoutForNode: () => undefined,
    requestRender: () => undefined,
    pushUndoStep: undo.pushStep.bind(undo)
  }
  return { figma, editor, undo, rectangle: figma.createRectangle() }
}

/** A batch that renames the rectangle and changes one prop of the layer named `id`. */
function batch(rectangleId: string, id: string, props: Record<string, unknown>): string {
  return JSON.stringify([
    { id: rectangleId, props: { name: 'Renamed', opacity: 0.5 } },
    { id, props }
  ])
}

describe('batch_update', () => {
  test('applies every operation as one undo step', () => {
    const { figma, editor, undo, rectangle } = setup()
    const other = figma.createRectangle()
    const operations = batch(rectangle.id, other.id, { visible: false, corner_radius: '4' })

    expect(executeAtomicTool(editor, figma, batchUpdate, { operations })).toEqual({
      updated: 2,
      results: [
        { id: rectangle.id, updated: ['name', 'opacity'] },
        { id: other.id, updated: ['visible', 'corner_radius'] }
      ]
    })
    expect([rectangle.name, rectangle.opacity, other.cornerRadius, other.visible]).toEqual([
      'Renamed',
      0.5,
      4,
      false
    ])

    undo.undo()
    expect([rectangle.name, rectangle.opacity, other.cornerRadius, other.visible]).toEqual([
      'Rectangle',
      1,
      0,
      true
    ])
    expect(undo.canUndo).toBe(false)
  })

  test.each([
    ['a missing layer', 'missing', {}, 'Node "missing" not found'],
    ['a value of the wrong type', 'self', { spacing: 'wide' }, '1.props.spacing'],
    ['a value outside its options', 'self', { counter_align: 'middle' }, '1.props.counter_align'],
    ['a prop it does not take', 'self', { fill: '#f00' }, '1.props.fill']
  ])('changes nothing when one operation names %s', (_, target, props, message) => {
    const { figma, editor, undo, rectangle } = setup()
    const id = target === 'self' ? rectangle.id : target
    const operations = batch(rectangle.id, id, props)

    expect(() => executeAtomicTool(editor, figma, batchUpdate, { operations })).toThrow(message)
    expect([rectangle.name, rectangle.opacity]).toEqual(['Rectangle', 1])
    expect(undo.canUndo).toBe(false)
  })

  test('changes nothing when a headless call names a missing layer', () => {
    const { figma, rectangle } = setup()
    const operations = batch(rectangle.id, 'missing', {})

    expect(batchUpdate.execute(figma, { operations })).toEqual({
      error: 'Node "missing" not found'
    })
    expect([rectangle.name, rectangle.opacity]).toEqual(['Rectangle', 1])
  })
})
