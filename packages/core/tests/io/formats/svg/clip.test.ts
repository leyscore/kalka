import { describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { renderNodesToSVG } from '@kalka/core'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

const WHITE = {
  type: 'SOLID' as const,
  color: { r: 1, g: 1, b: 1, a: 1 },
  opacity: 1,
  visible: true
}

/** A clipping frame with one child, exported to SVG. */
function exportedFrame(frame: Partial<SceneNode>): string {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const node = graph.createNode('FRAME', page, { clipsContent: true, fills: [WHITE], ...frame })
  graph.createNode('RECTANGLE', node.id, { width: node.width, height: node.height })
  return expectDefined(renderNodesToSVG(graph, page, [node.id]), 'SVG output')
}

describe('SVG export of a clipping frame', () => {
  test('clips its children to its rounded corners', () => {
    expect(exportedFrame({ width: 100, height: 40, cornerRadius: 8 })).toMatch(
      /<clipPath id="clip[^"]*">\s*<rect width="100" height="40" rx="8" ry="8"/
    )
  })

  test('keeps a radius past its shorter side circular', () => {
    const result = exportedFrame({ width: 100, height: 10, cornerRadius: 20 })
    expect(result).toMatch(
      /<clipPath id="clip[^"]*">\s*<rect width="100" height="10" rx="5" ry="5"/
    )
    expect(result).not.toContain('rx="20"')
  })

  test('with independent corners clips its children to its outline', () => {
    expect(
      exportedFrame({
        width: 100,
        height: 40,
        independentCorners: true,
        topLeftRadius: 8,
        bottomRightRadius: 4
      })
    ).toMatch(/<clipPath id="clip[^"]*">\s*<path d="M8 0/)
  })
})
