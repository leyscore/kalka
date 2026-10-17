import { describe, expect, test } from 'bun:test'

import {
  sceneNodeToDesignDocument,
  type DesignElement,
  type DesignNode,
  type VectorElementRenderer
} from '@kalka/dom-css/export'
import { SceneGraph, type Fill } from '@kalka/scene-graph'

function element(node: DesignNode | undefined): DesignElement {
  if (node?.type !== 'element') throw new Error('Expected an element')
  return node
}

/** A stand-in for the SVG export: each layer as a circle filling its box, named by layer. */
const vectorElement: VectorElementRenderer = (_graph, node) => ({
  type: 'element',
  tagName: 'svg',
  attrs: { width: String(node.width), height: String(node.height), 'data-layer': node.name },
  children: [{ type: 'element', tagName: 'circle', attrs: { r: '1' }, children: [] }]
})

function tileImages(value: string | undefined): string[] {
  return [...(value ?? '').matchAll(/url\("data:image\/svg\+xml,([^"]*)"\)/g)].map((match) =>
    decodeURIComponent(match[1])
  )
}

function patterned(fills: (sourceId: string) => Fill[]) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const dot = graph.createNode('ELLIPSE', page.id, {
    name: 'Dot',
    width: 20,
    height: 10,
    visible: false
  })
  const filled = graph.createNode('RECTANGLE', page.id, {
    name: 'Filled',
    width: 200,
    height: 100,
    fills: fills(dot.id)
  })
  return { graph, filled }
}

function project(graph: SceneGraph, id: string) {
  return (
    element(sceneNodeToDesignDocument(graph, id, { vectorElement }).children[0]).inlineStyle ?? {}
  )
}

const pattern = (sourceNodeId: string, fields: Partial<Fill> = {}): Fill => ({
  type: 'PATTERN',
  sourceNodeId,
  color: { r: 1, g: 0, b: 0, a: 1 },
  opacity: 1,
  visible: true,
  ...fields
})

describe('pattern fill projection', () => {
  test('repeats a tile drawing the hidden source from the layer corner', () => {
    const { graph, filled } = patterned((id) => [pattern(id, { scale: 2 })])
    const style = project(graph, filled.id)
    expect(style['background-size']).toBe('40px 20px')
    expect(style['background-repeat']).toBe('repeat')
    expect(style['background-origin']).toBe('border-box')
    const [tile] = tileImages(style['background-image'])
    expect(tile).toContain('data-layer="Dot"')
    expect(tile).toContain('translate(0 0) scale(2)')
  })

  test('wraps a hexagonal copy that crosses the tile edge', () => {
    const { graph, filled } = patterned((id) => [
      pattern(id, { patternTileType: 'HORIZONTAL_HEXAGONAL' })
    ])
    const [tile] = tileImages(project(graph, filled.id)['background-image'])
    expect(tile.match(/data-layer="Dot"/g)).toHaveLength(5)
    expect(tile).toContain('translate(-10 -5)')
  })

  test('stacks with the other fills in CSS order', () => {
    const { graph, filled } = patterned((id) => [
      { type: 'SOLID', color: { r: 0, g: 0, b: 1, a: 1 }, opacity: 1, visible: true },
      pattern(id)
    ])
    const style = project(graph, filled.id)
    // Figma lists the pattern last, on top; CSS lists the top layer first.
    expect(style['background-image']).toMatch(/^url\(.*\), linear-gradient\(/)
    expect(style['background-size']).toBe('20px 10px, auto')
    expect(style['background-color']).toBe('transparent')
  })

  test('leaves a pattern without a source to the table', () => {
    const { graph, filled } = patterned(() => [pattern('missing')])
    expect(project(graph, filled.id)['background-image']).toBeUndefined()
  })
})
