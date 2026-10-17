import { describe, expect, test } from 'bun:test'

import { sceneNodeToDesignDocument } from '#dom-css/export/index'
import type { VectorElementRenderer } from '#dom-css/export/projection'
import type { DesignElement } from '#dom-css/types'

import { SceneGraph, type SceneNode, type Stroke } from '@kalka/scene-graph'

const renderer: VectorElementRenderer = (_graph, node) => ({
  type: 'element',
  tagName: 'svg',
  attrs: { viewBox: `0 0 ${node.width} ${node.height}` },
  children: []
})

const gradient: Stroke = {
  type: 'GRADIENT_LINEAR',
  color: { r: 0, g: 0, b: 0, a: 1 },
  gradientStops: [
    { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
    { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
  ],
  gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 },
  weight: 8,
  visible: true,
  opacity: 1,
  align: 'CENTER'
}

const solid: Stroke = { ...gradient, type: 'SOLID', color: { r: 0, g: 0.5, b: 0, a: 1 } }

function project(type: SceneNode['type'], fields: Partial<SceneNode>): DesignElement {
  const graph = new SceneGraph()
  const node = graph.createNode(type, graph.getPages()[0].id, {
    width: 100,
    height: 40,
    fills: [],
    ...fields
  })
  const projected = sceneNodeToDesignDocument(graph, node.id, { vectorElement: renderer })
    .children[0]
  if (projected?.type !== 'element') throw new Error('Expected an element')
  return projected
}

describe('strokes CSS cannot draw', () => {
  test('a shape with a gradient stroke draws as SVG instead of a one-color outline', () => {
    for (const type of ['RECTANGLE', 'ELLIPSE', 'LINE'] as const) {
      const shape = project(type, { strokes: [gradient] })
      expect(shape.tagName).toBe('svg')
      expect(shape.inlineStyle?.outline).toBeUndefined()
    }
  })

  test('a line ending in arrows draws as SVG; a plain solid line stays a box', () => {
    expect(project('LINE', { strokes: [solid], strokeCap: 'ARROW_LINES' }).tagName).toBe('svg')
    expect(project('LINE', { strokes: [solid], strokeCap: 'NONE' }).tagName).not.toBe('svg')
  })

  test('a frame with a gradient stroke outlines in its middle color, not the unused solid one', () => {
    const frame = project('FRAME', { strokes: [gradient] })
    expect(frame.tagName).not.toBe('svg')
    expect(frame.inlineStyle?.outline).toContain('#800080')
  })

  test('a turned line turns about where it starts, other layers about their center', () => {
    const line = project('LINE', { strokes: [solid], rotation: 30, height: 0 })
    expect(line.inlineStyle?.['transform-origin']).toBe('0px 0px')
    const box = project('RECTANGLE', { strokes: [solid], rotation: 30 })
    expect(box.inlineStyle?.['transform-origin']).toBeUndefined()
  })

  test("an outline sits where the stroke's own alignment puts it", () => {
    const frame = project('RECTANGLE', {
      strokes: [{ ...solid, align: 'CENTER' }],
      strokeAlign: 'INSIDE'
    })
    expect(frame.inlineStyle?.['outline-offset']).toBe('-4px')
  })
})
