import { describe, expect, test } from 'bun:test'

import { createDefaultNode, type SceneNode, type Stroke, type VectorNetwork } from '@kalka/scene-graph'

import {
  defaultStrokeBrush,
  drawsStrokeOutline,
  matchStrokeWidthPreset,
  seededRandom,
  STROKE_BRUSHES,
  strokeOutlinePolygons,
  strokeOutlineSVGPath,
  strokeWidthPreset,
  widthProfileFunction
} from '#core/vector'

const zero = { x: 0, y: 0 }

function polyline(points: [number, number][]): VectorNetwork {
  return {
    vertices: points.map(([x, y]) => ({ x, y })),
    segments: points.slice(0, -1).map((_, i) => ({
      start: i,
      end: i + 1,
      tangentStart: zero,
      tangentEnd: zero
    })),
    regions: []
  }
}

const stroke: Stroke = {
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0, a: 1 },
  opacity: 1,
  visible: true,
  weight: 10,
  align: 'CENTER'
}

function pathLayer(points: [number, number][], changes: Partial<SceneNode> = {}): SceneNode {
  return {
    ...createDefaultNode(() => 'path', 'VECTOR'),
    width: 100,
    height: 100,
    vectorNetwork: polyline(points),
    strokes: [stroke],
    ...changes
  }
}

/** The widest the outline reaches from the line y = 0, near x. */
function reachAt(polygons: number[][], x: number): number {
  let reach = 0
  for (const polygon of polygons) {
    for (let index = 0; index < polygon.length; index += 2) {
      if (Math.abs(polygon[index] - x) < 1.5) reach = Math.max(reach, Math.abs(polygon[index + 1]))
    }
  }
  return reach
}

describe('width profiles', () => {
  test('a preset round-trips through the points a layer keeps', () => {
    for (const preset of ['uniform', 'wedge', 'taper', 'eye', 'rounded', 'pinch'] as const) {
      expect(matchStrokeWidthPreset(strokeWidthPreset(preset))).toBe(preset)
    }
    expect(matchStrokeWidthPreset([{ position: 0.3, ascent: 0.2, descent: 0.4 }])).toBeNull()
  })

  test('widths between points follow a line where the points do', () => {
    const at = widthProfileFunction(strokeWidthPreset('wedge'))
    expect(at(0).ascent).toBeCloseTo(0.025)
    expect(at(0.5).ascent).toBeCloseTo(0.2625)
    expect(at(1).descent).toBeCloseTo(0.5)
    expect(widthProfileFunction([])(0.4)).toEqual({ ascent: 0.5, descent: 0.5 })
  })

  test('a plain stroke is no outline', () => {
    expect(drawsStrokeOutline(pathLayer([[0, 0], [100, 0]]))).toBe(false)
    expect(strokeOutlinePolygons(pathLayer([[0, 0], [100, 0]]), stroke)).toBeNull()
  })

  test('an eye profile is thin at the ends and full in the middle', () => {
    const layer = pathLayer([[0, 0], [100, 0]], { strokeWidthProfile: strokeWidthPreset('eye') })
    const polygons = strokeOutlinePolygons(layer, stroke) ?? []
    expect(reachAt(polygons, 50)).toBeCloseTo(5, 1)
    expect(reachAt(polygons, 0)).toBeLessThan(0.5)
    expect(reachAt(polygons, 100)).toBeLessThan(0.5)
  })

  test('one side can be wider than the other', () => {
    const layer = pathLayer([[0, 0], [100, 0]], {
      strokeWidthProfile: [{ position: 0, ascent: 1, descent: 0.2 }]
    })
    const polygons = strokeOutlinePolygons(layer, stroke) ?? []
    const ys = polygons.flatMap((polygon) => polygon.filter((_, index) => index % 2 === 1))
    // Left of a path going right is up on a y-down canvas.
    expect(Math.min(...ys)).toBeCloseTo(-10, 1)
    expect(Math.max(...ys)).toBeCloseTo(2, 1)
  })

  test('a corner splits the outline and a join fills it', () => {
    const layer = pathLayer(
      [
        [0, 0],
        [100, 0],
        [100, 100]
      ],
      { strokeWidthProfile: strokeWidthPreset('rounded'), strokeJoin: 'ROUND' }
    )
    const polygons = strokeOutlinePolygons(layer, stroke) ?? []
    expect(polygons.length).toBe(3)
    expect(strokeOutlineSVGPath(layer, stroke)).toMatch(/^M[-\d.]+ [-\d.]+L/)
  })
})

describe('brushes', () => {
  test('every brush draws along a path', () => {
    for (const type of ['STRETCH', 'SCATTER'] as const) {
      for (const id of STROKE_BRUSHES[type]) {
        const layer = pathLayer([[0, 0], [100, 0]], { strokeBrush: defaultStrokeBrush(type, id) })
        const polygons = strokeOutlinePolygons(layer, stroke) ?? []
        expect(polygons.length).toBeGreaterThan(0)
        const xs = polygons.flatMap((polygon) => polygon.filter((_, index) => index % 2 === 0))
        expect(Math.min(...xs)).toBeLessThan(15)
        expect(Math.max(...xs)).toBeGreaterThan(85)
      }
    }
  })

  test('a scatter brush drops a copy every gap of stroke weights, the same for one seed', () => {
    const brush = { ...defaultStrokeBrush('SCATTER', 'dots'), gap: 2 }
    const layer = pathLayer([[0, 0], [100, 0]], { strokeBrush: brush })
    expect(strokeOutlinePolygons(layer, stroke)?.length).toBe(5)
    const jittered = pathLayer([[0, 0], [100, 0]], {
      strokeBrush: { ...brush, sizeJitter: 1, wiggle: 1, seed: 7 }
    })
    expect(strokeOutlineSVGPath(jittered, stroke)).toBe(strokeOutlineSVGPath(jittered, stroke))
    const random = seededRandom(7)
    const first = [random(), random()]
    expect(first.every((value) => value >= 0 && value < 1)).toBe(true)
  })

  test('an unknown brush draws its type’s first one', () => {
    expect(defaultStrokeBrush('STRETCH', 'nope').id).toBe(STROKE_BRUSHES.STRETCH[0])
  })
})
