import { describe, expect, test } from 'bun:test'

import {
  sceneNodeToDesignDocument,
  type DesignElement,
  type DesignNode
} from '@kalka/dom-css/export'
import { SceneGraph, type Fill } from '@kalka/scene-graph'

function element(node: DesignNode | undefined): DesignElement {
  if (node?.type !== 'element') throw new Error('Expected an element')
  return node
}

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }

function gradient(
  type: Fill['type'],
  transform: Partial<NonNullable<Fill['gradientTransform']>> = {}
): Fill {
  return {
    type,
    color: RED,
    opacity: 1,
    visible: true,
    gradientStops: [
      { color: RED, position: 0 },
      { color: BLUE, position: 1 }
    ],
    gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0, ...transform }
  }
}

function project(fills: Fill[], extra: Record<string, unknown> = {}) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const box = graph.createNode('RECTANGLE', page.id, { width: 200, height: 100, fills, ...extra })
  return element(sceneNodeToDesignDocument(graph, box.id).children[0]).inlineStyle ?? {}
}

describe('DOM projection of paints', () => {
  test('a left-to-right linear gradient runs at 90deg from edge to edge', () => {
    // Gradient from (0, 0.5) to (1, 0.5) of the box.
    const style = project([gradient('GRADIENT_LINEAR', { m02: 0, m12: 0.5 })])
    expect(style['background-image']).toBe('linear-gradient(90deg, #FF0000 0%, #0000FF 100%)')
    expect(style['background-color']).toBeUndefined()
  })

  test('a top-to-bottom linear gradient runs at 180deg', () => {
    const style = project([
      gradient('GRADIENT_LINEAR', { m00: 0, m01: -1, m02: 0.5, m10: 1, m11: 0, m12: 0 })
    ])
    expect(style['background-image']).toBe('linear-gradient(180deg, #FF0000 0%, #0000FF 100%)')
  })

  test('a gradient that starts inside the box keeps its stops where they were', () => {
    // From a quarter to three quarters of the width.
    const style = project([gradient('GRADIENT_LINEAR', { m00: 0.5, m02: 0.25, m12: 0.5 })])
    expect(style['background-image']).toBe('linear-gradient(90deg, #FF0000 25%, #0000FF 75%)')
  })

  test('a radial gradient is an ellipse sized to the box', () => {
    const style = project([
      gradient('GRADIENT_RADIAL', { m00: 0.5, m01: 0, m02: 0.5, m10: 0, m11: 0.5, m12: 0.5 })
    ])
    expect(style['background-image']).toBe(
      'radial-gradient(50% 50% at 50% 50%, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('an angular gradient is a conic one', () => {
    const style = project([gradient('GRADIENT_ANGULAR', { m02: 0.5, m12: 0.5 })])
    expect(style['background-image']).toBe(
      'conic-gradient(from 90deg at 50% 50%, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('stacked fills become background layers, top fill first', () => {
    const solid: Fill = { type: 'SOLID', color: RED, opacity: 0.5, visible: true }
    const style = project([gradient('GRADIENT_LINEAR', { m12: 0.5 }), solid])
    expect(style['background-image']).toBe(
      'linear-gradient(rgba(255, 0, 0, 0.5), rgba(255, 0, 0, 0.5)), linear-gradient(90deg, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('one solid fill stays a background color', () => {
    const style = project([{ type: 'SOLID', color: RED, opacity: 1, visible: true }])
    expect(style['background-color']).toBe('#FF0000')
    expect(style['background-image']).toBeUndefined()
  })

  test('blend modes reach CSS for the layer and for each fill', () => {
    const multiply: Fill = { ...gradient('GRADIENT_LINEAR', { m12: 0.5 }), blendMode: 'MULTIPLY' }
    const style = project([multiply, { type: 'SOLID', color: BLUE, opacity: 1, visible: true }], {
      blendMode: 'SCREEN'
    })
    expect(style['mix-blend-mode']).toBe('screen')
    expect(style['background-blend-mode']).toBe('normal, multiply')
  })
})
