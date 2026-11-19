import { describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { SceneGraph } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix, { type Mat3 } from '@kalka/scene-graph/matrix'

import { computeContentBounds } from '#core/io/formats/raster'
import { renderNodesToSVG } from '#core/io/formats/svg/export'

function transformMatrix(transform: string | undefined): Mat3 {
  let matrix = Matrix.identity()
  for (const [, name, args] of (transform ?? '').matchAll(/(\w+)\(([^)]*)\)/g)) {
    const [a = 0, b = 0, c = 0] = args.split(/[\s,]+/).map(Number)
    if (name === 'translate') {
      matrix = Matrix.multiply(matrix, Matrix.translated(a, b))
    } else if (name === 'rotate') {
      matrix = Matrix.multiply(matrix, Matrix.rotated((a * Math.PI) / 180, b, c))
    } else if (name === 'scale') {
      matrix = Matrix.multiply(matrix, Matrix.scaled(a, b))
    } else {
      throw new Error(`Unexpected transform ${name}`)
    }
  }
  return matrix
}

function elementMatrix(svg: string, matches: (name: string, attrs: string) => boolean): Mat3 {
  const stack: Mat3[] = [Matrix.identity()]
  for (const [, closing, name, attrs, selfClosing] of svg.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    if (closing) {
      stack.pop()
      continue
    }
    const parent = expectDefined(stack.at(-1))
    const matrix = Matrix.multiply(parent, transformMatrix(attrs.match(/transform="([^"]*)"/)?.[1]))
    if (matches(name, attrs)) {
      return matrix
    }
    if (!selfClosing) {
      stack.push(matrix)
    }
  }
  throw new Error('No matching element in the SVG')
}

function redRectMatrix(svg: string): Mat3 {
  return elementMatrix(svg, (name, attrs) => name === 'rect' && attrs.includes('fill="#FF0000"'))
}

const RED = { type: 'SOLID' as const, color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }

const CASES: Array<
  [string, (graph: SceneGraph, page: string) => { nodeId: string; inkId: string }]
> = [
  [
    'a flipped rectangle',
    (graph, page) => {
      const id = graph.createNode('RECTANGLE', page, {
        x: 50,
        y: 20,
        width: 30,
        height: 10,
        flipX: true,
        fills: [RED]
      }).id
      return { nodeId: id, inkId: id }
    }
  ],
  [
    'a rotated and flipped rectangle',
    (graph, page) => {
      const id = graph.createNode('RECTANGLE', page, {
        x: 50,
        y: 20,
        width: 30,
        height: 10,
        rotation: 30,
        flipY: true,
        fills: [RED]
      }).id
      return { nodeId: id, inkId: id }
    }
  ],
  [
    'a frame holding a rotated and flipped child',
    (graph, page) => {
      const frame = graph.createNode('FRAME', page, { x: 10, y: 10, width: 100, height: 100 })
      const child = graph.createNode('RECTANGLE', frame.id, {
        x: 40,
        y: 30,
        width: 30,
        height: 10,
        rotation: -40,
        flipX: true,
        fills: [RED]
      })
      return { nodeId: frame.id, inkId: child.id }
    }
  ]
]

describe('SVG export of flipped and rotated layers', () => {
  for (const [name, build] of CASES) {
    test(`${name} is drawn where its world matrix puts it`, () => {
      const graph = new SceneGraph()
      const page = graph.getPages()[0].id
      const { nodeId, inkId } = build(graph, page)
      const bounds = expectDefined(computeContentBounds(graph, [nodeId]))
      const svg = expectDefined(renderNodesToSVG(graph, page, [nodeId]))
      const expected = Matrix.multiply(
        Matrix.translated(-bounds.minX, -bounds.minY),
        getWorldMatrix(expectDefined(graph.getNode(inkId)), graph)
      )
      const actual = redRectMatrix(svg)
      for (const index of [0, 1, 2, 3, 4, 5]) expect(actual[index]).toBeCloseTo(expected[index], 1)
    })
  }
})
