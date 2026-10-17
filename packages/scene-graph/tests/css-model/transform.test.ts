import { describe, expect, it } from 'bun:test'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { getNodeLocalMatrix } from '@kalka/scene-graph/coordinate'
import { readLayerStyle, writeLayerStyle } from '@kalka/scene-graph/css-model'
import Matrix, { type Mat3 } from '@kalka/scene-graph/matrix'

const FUNCTION = /([a-z]+)\(([^)]*)\)/g

/** What a browser does with a `transform` about a `transform-origin`, as a matrix. */
function cssTransformMatrix(transform: string, origin: { x: number; y: number }): Mat3 {
  const steps = [...transform.matchAll(FUNCTION)].map(([, name, args]) => {
    const values = args.split(',').map((value) => Number.parseFloat(value))
    if (name === 'translate') return Matrix.translated(values[0], values[1])
    if (name === 'scale') return Matrix.scaled(values[0], values[1])
    if (name === 'rotate') return Matrix.rotated((values[0] * Math.PI) / 180)
    throw new Error(`Unexpected transform function ${name}`)
  })
  return Matrix.multiply(
    Matrix.translated(origin.x, origin.y),
    ...steps,
    Matrix.translated(-origin.x, -origin.y)
  )
}

function cssOrigin(style: Record<string, string>, node: SceneNode) {
  const origin = style['transform-origin']
  if (!origin) return { x: node.width / 2, y: node.height / 2 }
  const [x, y] = origin.split(' ').map((value) => Number.parseFloat(value))
  return { x, y }
}

const CASES: { name: string; type: 'FRAME' | 'TEXT' | 'LINE'; fields: Partial<SceneNode> }[] = [
  { name: 'a mirrored frame', type: 'FRAME', fields: { flipX: true } },
  { name: 'a turned frame flipped both ways', type: 'FRAME', fields: { rotation: 30, flipX: true, flipY: true } },
  { name: 'turned text flipped vertically', type: 'TEXT', fields: { rotation: -55, flipY: true } },
  { name: 'a turned, mirrored line', type: 'LINE', fields: { rotation: 20, flipX: true, height: 0 } }
]

describe('layer transforms in CSS', () => {
  for (const { name, type, fields } of CASES) {
    it(`place the corners of ${name} where the canvas does`, () => {
      const graph = new SceneGraph()
      const node = graph.createNode(type, graph.getPages()[0].id, { width: 120, height: 60, ...fields })
      const style = writeLayerStyle(node, { css: (_field, literal) => literal })
      const corners = [0, 0, node.width, 0, node.width, node.height, 0, node.height]
      const drawn = Matrix.mapPoints(cssTransformMatrix(style.transform, cssOrigin(style, node)), corners)
      const expected = Matrix.mapPoints(getNodeLocalMatrix(node, { x: 0, y: 0 }), corners)
      for (const [index, value] of drawn.entries()) expect(value).toBeCloseTo(expected[index], 6)
    })

    it(`reads back the turn and flips of ${name}`, () => {
      const graph = new SceneGraph()
      const page = graph.getPages()[0].id
      const node = graph.createNode(type, page, { width: 120, height: 60, ...fields })
      const style = writeLayerStyle(node, { css: (_field, literal) => literal })
      const read = graph.createNode(type, page, {})
      readLayerStyle(read, style, { projected: {} })
      expect({ rotation: read.rotation, flipX: read.flipX, flipY: read.flipY }).toEqual({
        rotation: node.rotation,
        flipX: node.flipX,
        flipY: node.flipY
      })
    })
  }
})
