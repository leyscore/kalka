import { describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { renderNodesToSVG } from '@kalka/core'
import { SceneGraph, type Effect } from '@kalka/scene-graph'

const WHITE = {
  type: 'SOLID' as const,
  color: { r: 1, g: 1, b: 1, a: 0.5 },
  opacity: 1,
  visible: true
}

function blurEffect(type: Effect['type'], radius: number): Effect {
  return {
    type,
    radius,
    visible: true,
    color: { r: 0, g: 0, b: 0, a: 0 },
    offset: { x: 0, y: 0 },
    spread: 0
  }
}

function exported(effects: Effect[]): string {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('FRAME', page, {
    width: 120,
    height: 80,
    cornerRadius: 12,
    fills: [WHITE],
    effects
  })
  return expectDefined(renderNodesToSVG(graph, page, [card.id]), 'SVG output')
}

describe('SVG export of a background blur', () => {
  test('blurs what lies behind the layer through a clipped backdrop box, as Figma does', () => {
    const svg = exported([blurEffect('BACKGROUND_BLUR', 20)])
    expect(svg).toContain('<foreignObject')
    expect(svg).toContain('backdrop-filter:blur(10px)')
    expect(svg).toMatch(/<clipPath id="bgblur[^"]*"[^>]*>\s*<rect width="120" height="80" rx="12"/)
    expect(svg).not.toContain('feGaussianBlur')
  })

  test('leaves a layer blur on the layer itself', () => {
    const svg = exported([blurEffect('LAYER_BLUR', 8)])
    expect(svg).toContain('feGaussianBlur')
    expect(svg).not.toContain('foreignObject')
  })
})
