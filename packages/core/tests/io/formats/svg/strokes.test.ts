import { describe, expect, test } from 'bun:test'

import { SceneGraph, type SceneNode, type Stroke } from '@kalka/scene-graph'

import { renderNodeSVGElement } from '#core/io/formats/svg/export'
import type { SVGNode } from '#core/io/formats/svg/node'

const STOPS = [
  { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
  { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
]
const IDENTITY = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }

function gradientStroke(type: Stroke['type'], extra: Partial<Stroke> = {}): Stroke {
  return {
    type,
    color: { r: 0, g: 0, b: 0, a: 1 },
    gradientStops: STOPS,
    gradientTransform: IDENTITY,
    weight: 10,
    visible: true,
    opacity: 1,
    align: 'CENTER',
    ...extra
  }
}

/** A layer exported as SVG, read back as its elements. */
class Exported {
  readonly elements: SVGNode[] = []

  constructor(root: SVGNode) {
    const walk = (node: SVGNode) => {
      this.elements.push(node)
      for (const child of node.children) if (typeof child !== 'string') walk(child)
    }
    walk(root)
  }

  all(tag: string): SVGNode[] {
    return this.elements.filter((element) => element.tag === tag)
  }

  one(tag: string): SVGNode {
    const found = this.all(tag).at(0)
    if (!found) throw new Error(`Expected <${tag}>`)
    return found
  }

  /** The paint server a `url(#id)` paint names. */
  server(paint: string | number | undefined): SVGNode | undefined {
    const id = /^url\(#(.+)\)$/.exec(String(paint))?.[1]
    return this.elements.find((element) => element.attrs.id === id)
  }

  /** The element drawn inside the group that clips or masks with `attr`. */
  inside(attr: 'clip-path' | 'mask', tag: string): SVGNode | undefined {
    return this.all('g')
      .filter((group) => attr in group.attrs)
      .flatMap((group) => group.children)
      .find((child): child is SVGNode => typeof child !== 'string' && child.tag === tag)
  }
}

function exportLayer(type: SceneNode['type'], fields: Partial<SceneNode>): Exported {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode(type, page.id, { fills: [], ...fields })
  const svg = renderNodeSVGElement(graph, node, { idPrefix: 'layer-' })
  if (!svg) throw new Error('Expected an SVG')
  return new Exported(svg)
}

const HORIZONTAL_PATH = {
  vertices: [
    { x: 0, y: 0 },
    { x: 100, y: 0 }
  ],
  segments: [{ start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }],
  regions: []
}

describe('SVG export strokes', () => {
  test('a gradient stroke paints with its gradient, laid on the layer even when it has no height', () => {
    const doc = exportLayer('VECTOR', {
      width: 100,
      height: 0,
      vectorNetwork: HORIZONTAL_PATH,
      strokes: [gradientStroke('GRADIENT_LINEAR')]
    })
    const server = doc.server(doc.one('path').attrs.stroke)
    expect(server?.tag).toBe('linearGradient')
    // A bounding box without height draws no bounding-box paint; the layer's box always does.
    expect(server?.attrs.gradientUnits).toBe('userSpaceOnUse')
  })

  test('angular and diamond strokes paint with a pattern, which SVG has no gradient for', () => {
    for (const type of ['GRADIENT_ANGULAR', 'GRADIENT_DIAMOND'] as const) {
      const doc = exportLayer('RECTANGLE', {
        width: 50,
        height: 50,
        strokes: [gradientStroke(type)]
      })
      const server = doc.server(doc.one('rect').attrs.stroke)
      expect(server?.tag).toBe('pattern')
      expect(server && new Exported(server).all('path').length).toBeGreaterThan(3)
    }
  })

  test('arrow caps draw arrowheads in the stroke paint at both open ends', () => {
    const doc = exportLayer('VECTOR', {
      width: 100,
      height: 0,
      strokeCap: 'ARROW_EQUILATERAL',
      vectorNetwork: HORIZONTAL_PATH,
      strokes: [gradientStroke('GRADIENT_LINEAR')]
    })
    const shaft = doc.one('path').attrs.stroke
    const heads = doc.all('polygon')
    expect(heads).toHaveLength(2)
    for (const head of heads) expect(head.attrs.fill).toBe(shaft)
  })

  test('a line with open arrow caps draws two stroked wings per end', () => {
    const doc = exportLayer('LINE', {
      width: 100,
      height: 0,
      strokeCap: 'ARROW_LINES',
      strokes: [{ ...gradientStroke('SOLID'), color: { r: 0, g: 0.5, b: 0, a: 1 } }]
    })
    expect(doc.all('line')).toHaveLength(5)
  })

  test('an inside stroke is clipped to the shape and an outside one masked away from it', () => {
    const inside = exportLayer('RECTANGLE', {
      width: 40,
      height: 40,
      strokes: [{ ...gradientStroke('SOLID'), align: 'INSIDE' }]
    })
    expect(inside.inside('clip-path', 'rect')?.attrs['stroke-width']).toBe(20)

    const outside = exportLayer('ELLIPSE', {
      width: 40,
      height: 40,
      strokes: [{ ...gradientStroke('SOLID'), align: 'OUTSIDE' }]
    })
    expect(outside.inside('mask', 'ellipse')?.attrs['stroke-width']).toBe(20)
  })
})
