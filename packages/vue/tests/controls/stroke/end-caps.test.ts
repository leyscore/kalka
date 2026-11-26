import { describe, expect, test } from 'bun:test'

import { compact } from 'es-toolkit/array'
import { computed } from 'vue'

import { createEditor } from '@kalka/core/editor'
import type { SceneNode, Stroke, VectorNetwork } from '@kalka/scene-graph'
import { lineEndNetwork } from '@kalka/scene-graph/arrow-caps'

import { MIXED } from '#vue/controls/node-props/use'
import {
  createEndPointControls,
  endPointCaps,
  endPointChanges,
  hasEndPoints
} from '#vue/controls/stroke/end-caps'

const STROKE: Stroke = {
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0, a: 1 },
  opacity: 1,
  visible: true,
  weight: 2,
  align: 'CENTER'
}

const OPEN_PATH: VectorNetwork = {
  vertices: [
    { x: 0, y: 0 },
    { x: 50, y: 20 },
    { x: 100, y: 0 }
  ],
  segments: [
    { start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
    { start: 1, end: 2, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
  ],
  regions: []
}

function setup(type: 'LINE' | 'VECTOR', fields: Partial<SceneNode> = {}) {
  const editor = createEditor()
  const node = editor.graph.createNode(type, editor.state.currentPageId, {
    width: 100,
    height: 0,
    strokes: [{ ...STROKE }],
    ...fields
  })
  const nodes = computed(() => compact([editor.graph.getNode(node.id)]))
  return { editor, node, controls: createEndPointControls(editor, nodes) }
}

describe('start and end points', () => {
  test('lines and open paths have ends; closed shapes do not', () => {
    const { node: line } = setup('LINE')
    const { node: path } = setup('VECTOR', { vectorNetwork: OPEN_PATH })
    const { node: closed } = setup('VECTOR', {
      vectorNetwork: {
        ...OPEN_PATH,
        segments: [
          ...OPEN_PATH.segments,
          { start: 2, end: 0, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
        ]
      }
    })
    expect(hasEndPoints(line)).toBe(true)
    expect(hasEndPoints(path)).toBe(true)
    expect(hasEndPoints(closed)).toBe(false)
  })

  test('an arrow on one end of a line stays on that end, and undoes in one step', () => {
    const { editor, node, controls } = setup('LINE')
    controls.setEndPoint('end', 'ARROW_EQUILATERAL')
    const arrow = editor.graph.getNode(node.id)
    if (!arrow) throw new Error('Expected the line')
    expect(endPointCaps(arrow)).toEqual({ start: 'NONE', end: 'ARROW_EQUILATERAL' })
    expect(arrow.strokeCap).toBe('NONE')
    expect(controls.endCap.value).toBe('ARROW_EQUILATERAL')

    editor.undo.undo()
    const plain = editor.graph.getNode(node.id)
    expect(plain && endPointCaps(plain)).toEqual({ start: 'NONE', end: 'NONE' })
  })

  test('the same arrow on both ends is the layer’s own cap, without a network', () => {
    const { editor, node, controls } = setup('LINE', {
      vectorNetwork: lineEndNetwork(100, 0, { end: 'ARROW_LINES' })
    })
    controls.setEndPoint('start', 'ARROW_LINES')
    const line = editor.graph.getNode(node.id)
    expect(line).toMatchObject({ strokeCap: 'ARROW_LINES', vectorNetwork: null })
    expect(line?.strokes[0].cap).toBe('ARROW_LINES')
  })

  test('a round shaft keeps its arrows on the end vertices', () => {
    const { node } = setup('LINE')
    const changes = endPointChanges(node, { start: 'ARROW_LINES', end: 'ARROW_LINES' }, 'ROUND')
    expect(changes?.strokeCap).toBe('ROUND')
    expect(changes?.vectorNetwork?.vertices.map((vertex) => vertex.strokeCap)).toEqual([
      'ARROW_LINES',
      'ARROW_LINES'
    ])
  })

  test('an open path takes its arrows on its two end vertices', () => {
    const { editor, node, controls } = setup('VECTOR', { vectorNetwork: OPEN_PATH })
    controls.setEndPoint('start', 'ARROW_LINES')
    const path = editor.graph.getNode(node.id)
    expect(path?.vectorNetwork?.vertices.map((vertex) => vertex.strokeCap)).toEqual([
      'ARROW_LINES',
      undefined,
      undefined
    ])
  })

  test('reports mixed ends across a selection', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const plain = editor.graph.createNode('LINE', page, { width: 100, strokes: [{ ...STROKE }] })
    const arrow = editor.graph.createNode('LINE', page, {
      width: 100,
      strokes: [{ ...STROKE }],
      vectorNetwork: lineEndNetwork(100, 0, { end: 'ARROW_LINES' })
    })
    const nodes = computed(() =>
      compact([editor.graph.getNode(plain.id), editor.graph.getNode(arrow.id)])
    )
    const controls = createEndPointControls(editor, nodes)
    expect(controls.startCap.value).toBe('NONE')
    expect(controls.endCap.value).toBe(MIXED)
  })
})
