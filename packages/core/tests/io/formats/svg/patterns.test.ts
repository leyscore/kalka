import { describe, expect, test } from 'bun:test'

import { SceneGraph, type Fill } from '@kalka/scene-graph'

import { renderNodesToSVG } from '#core/io/formats/svg/export'

function pattern(sourceNodeId: string, fields: Partial<Fill> = {}): Fill {
  return {
    type: 'PATTERN',
    sourceNodeId,
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    ...fields
  }
}

function patterned(fill: (sourceId: string) => Fill) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const dot = graph.createNode('ELLIPSE', page, {
    x: -500,
    width: 20,
    height: 10,
    visible: false,
    fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
  })
  const filled = graph.createNode('VECTOR', page, { width: 200, height: 100 })
  graph.updateNode(filled.id, { fills: [fill(dot.id)] })
  return { svg: renderNodesToSVG(graph, page, [filled.id]) ?? '', dot, filled, graph, page }
}

describe('SVG export of pattern fills', () => {
  test('fills with a pattern repeating the hidden source at its scale', () => {
    const { svg } = patterned((id) => pattern(id, { scale: 2 }))
    expect(svg).toContain('<pattern id="pat0" patternUnits="userSpaceOnUse" width="40" height="20"')
    expect(svg).toContain('translate(0 0) scale(2)')
    expect(svg).toContain('<ellipse')
    expect(svg).toContain('fill="url(#pat0)"')
  })

  test('wraps hexagonal copies across the tile edge', () => {
    const { svg } = patterned((id) => pattern(id, { patternTileType: 'HORIZONTAL_HEXAGONAL' }))
    expect(svg.match(/<ellipse/g)).toHaveLength(5)
  })

  test('draws nothing for a pattern that repeats its own layer', () => {
    const { graph, page, filled } = patterned((id) => pattern(id))
    graph.updateNode(filled.id, { fills: [pattern(filled.id)] })
    expect(renderNodesToSVG(graph, page, [filled.id]) ?? '').not.toContain('<pattern')
  })
})

describe('SVG export of tiled images', () => {
  test('repeats the image at its size times its scale', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.images.set('gif', new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 20, 0, 10, 0]))
    const filled = graph.createNode('RECTANGLE', page, {
      width: 200,
      height: 100,
      fills: [
        {
          type: 'IMAGE',
          imageHash: 'gif',
          imageScaleMode: 'TILE',
          scale: 2,
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true
        }
      ]
    })
    const svg = renderNodesToSVG(graph, page, [filled.id]) ?? ''
    expect(svg).toContain('patternUnits="userSpaceOnUse" width="40" height="20"')
  })
})
