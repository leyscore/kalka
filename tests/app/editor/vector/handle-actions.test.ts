import { expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { SceneGraph, type VectorNetwork } from '@kalka/scene-graph'

import { createVectorEditHandleActions } from '@/app/editor/vector/handle-actions'
import { smoothVertexTangents } from '@/app/editor/vector/handles'
import { createVectorEditLifecycle } from '@/app/editor/vector/lifecycle'
import type { VectorEditState } from '@/app/editor/vector/types'

import { expectDefined } from '#tests/helpers/assert'

/** An open path bending at its middle point: (0, 0) → (100, 0) → (100, 100). */
const ELBOW: VectorNetwork = {
  vertices: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 }
  ],
  segments: [
    { start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
    { start: 1, end: 2, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
  ],
  regions: []
}

function setup() {
  const graph = new SceneGraph()
  const pageId = expectDefined(graph.getPages()[0]).id
  const vector = graph.createNode('VECTOR', pageId, {
    width: 100,
    height: 100,
    vectorNetwork: ELBOW
  })
  const editor = createEditor({ graph })
  const state = { nodeEditState: null } as VectorEditState
  const lifecycle = createVectorEditLifecycle(editor, state)
  const actions = createVectorEditHandleActions(editor, lifecycle.getNodeEditState)
  lifecycle.enterNodeEditMode(vector.id)
  const es = expectDefined(state.nodeEditState)
  return { editor, graph, vector, lifecycle, actions, es }
}

test('a sharp point between two others grows mirrored handles along its neighbours', () => {
  const { actions, es } = setup()
  actions.nodeEditToggleVertexSmooth(1)

  // From (0, 0) to (100, 100): both handles on that diagonal, a third of the arms long.
  const length = 100 / 3
  const diagonal = length / Math.SQRT2
  expect(es.segments[0].tangentEnd.x).toBeCloseTo(-diagonal)
  expect(es.segments[0].tangentEnd.y).toBeCloseTo(-diagonal)
  expect(es.segments[1].tangentStart.x).toBeCloseTo(diagonal)
  expect(es.segments[1].tangentStart.y).toBeCloseTo(diagonal)
  expect(es.vertices[1].handleMirroring).toBe('ANGLE_AND_LENGTH')
})

test('a smooth point turns sharp again on the second toggle', () => {
  const { actions, es } = setup()
  actions.nodeEditToggleVertexSmooth(1)
  actions.nodeEditToggleVertexSmooth(1)
  expect(es.segments[0].tangentEnd).toEqual({ x: 0, y: 0 })
  expect(es.segments[1].tangentStart).toEqual({ x: 0, y: 0 })
  expect(es.vertices[1].handleMirroring).toBe('NONE')
})

test('dragging a handle of a smooth point mirrors the other, and Option breaks it', () => {
  const { actions, es } = setup()
  actions.nodeEditToggleVertexSmooth(1)
  actions.nodeEditSetHandle(1, 'tangentStart', { x: 0, y: 40 })
  expect(es.segments[0].tangentEnd).toEqual({ x: -0, y: -40 })

  actions.nodeEditSetHandle(1, 'tangentStart', { x: 30, y: 30 }, { breakMirroring: true })
  expect(es.segments[1].tangentStart).toEqual({ x: 30, y: 30 })
  expect(es.segments[0].tangentEnd).toEqual({ x: -0, y: -40 })
  expect(es.vertices[1].handleMirroring).toBe('NONE')
})

test('the toggle commits to the layer as one undo step', () => {
  const { editor, graph, vector, lifecycle, actions, es } = setup()
  actions.nodeEditToggleVertexSmooth(1)
  lifecycle.commitNodeEditChanges(es)
  const curved = expectDefined(graph.getNode(vector.id)?.vectorNetwork)
  expect(curved.segments[1].tangentStart.x).not.toBe(0)

  editor.undoAction()
  const restored = expectDefined(graph.getNode(vector.id)?.vectorNetwork)
  expect(restored.segments[1].tangentStart).toEqual({ x: 0, y: 0 })
})

test('an end point gets one handle toward its neighbour', () => {
  const { tangents, mirroring } = smoothVertexTangents(ELBOW.vertices, 0, [
    { segmentIndex: 0, tangentField: 'tangentStart', neighborIndex: 1 }
  ])
  expect(tangents).toHaveLength(1)
  expect(tangents[0].x).toBeCloseTo(100 / 3)
  expect(tangents[0].y).toBeCloseTo(0)
  expect(mirroring).toBe('NONE')
})
