import { describe, expect, test } from 'bun:test'

import type { VectorNetwork } from '@kalka/scene-graph'
import {
  lineArrowEndpoints,
  lineEndCaps,
  lineEndNetwork,
  openPathEnds
} from '@kalka/scene-graph/arrow-caps'
import { strokeOverflow } from '@kalka/scene-graph/geometry'

const STRAIGHT = { x: 0, y: 0 }

describe('line ends', () => {
  test('a line without a network ends in its own cap at both ends', () => {
    expect(lineEndCaps('ARROW_LINES')).toEqual({ start: 'ARROW_LINES', end: 'ARROW_LINES' })
  })

  test('the network of a line’s ends overrides each end on its own', () => {
    const network = lineEndNetwork(100, 0, { end: 'ARROW_EQUILATERAL' })
    expect(lineEndCaps('NONE', network)).toEqual({ start: 'NONE', end: 'ARROW_EQUILATERAL' })
    const heads = lineArrowEndpoints(100, 0, 'NONE', network)
    expect(heads).toEqual([{ x: 100, y: 0, angle: 0, cap: 'ARROW_EQUILATERAL' }])
  })

  test('an arrow at one end widens the bounds its stroke reaches', () => {
    const network = lineEndNetwork(100, 0, { start: 'ARROW_LINES' })
    const stroke = {
      type: 'SOLID' as const,
      color: { r: 0, g: 0, b: 0, a: 1 },
      opacity: 1,
      visible: true,
      weight: 2,
      align: 'CENTER' as const
    }
    expect(strokeOverflow([stroke], 'NONE', network)).toBeGreaterThan(1)
  })

  test('finds the two ends of one open run, and none for a loop or a fork', () => {
    const run: VectorNetwork = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 }
      ],
      segments: [
        { start: 1, end: 0, tangentStart: STRAIGHT, tangentEnd: STRAIGHT },
        { start: 1, end: 2, tangentStart: STRAIGHT, tangentEnd: STRAIGHT }
      ],
      regions: []
    }
    expect(openPathEnds(run)).toEqual([0, 2])
    const loop = {
      ...run,
      segments: [
        ...run.segments,
        { start: 2, end: 0, tangentStart: STRAIGHT, tangentEnd: STRAIGHT }
      ]
    }
    expect(openPathEnds(loop)).toBeNull()
    const fork = {
      vertices: [...run.vertices, { x: 10, y: 30 }],
      segments: [
        ...run.segments,
        { start: 1, end: 3, tangentStart: STRAIGHT, tangentEnd: STRAIGHT }
      ],
      regions: []
    }
    expect(openPathEnds(fork)).toBeNull()
  })
})
