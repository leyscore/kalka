import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { SceneGraph } from '@kalka/scene-graph'

/** A colour Kalka and the Plugin API both read: an RGB with its alpha. */
const BLACK = { r: 0, g: 0, b: 0, a: 1 }
const BLACK_STROKE = {
  type: 'SOLID' as const,
  color: BLACK,
  opacity: 1,
  visible: true,
  weight: 1,
  align: 'CENTER' as const
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const line = figma.createLine()
  line.strokes = [BLACK_STROKE]
  const node = () => {
    const found = graph.getNode(line.id)
    if (!found) throw new Error('No line')
    return found
  }
  return { figma, line, node }
}

describe('variable width strokes and brushes in the Plugin API', () => {
  test('a width profile reads and writes as Figma names it', () => {
    const { line, node } = setup()
    expect(line.variableWidthStrokeProperties).toEqual({ widthProfile: 'UNIFORM' })

    line.variableWidthStrokeProperties = { widthProfile: 'TAPER' }
    expect(line.variableWidthStrokeProperties).toEqual({ widthProfile: 'TAPER' })
    expect(node().strokeWidthProfile[0]).toEqual({ position: 0, ascent: 0.5, descent: 0.5 })

    line.variableWidthStrokeProperties = {
      widthProfile: 'CUSTOM',
      variableWidthPoints: [
        { position: 1, width: 0.2 },
        { position: 0, width: 2 }
      ]
    }
    // Width is both sides of the path together; points come back in order along the stroke.
    expect(node().strokeWidthProfile).toEqual([
      { position: 0, ascent: 1, descent: 1 },
      { position: 1, ascent: 0.1, descent: 0.1 }
    ])
    expect(line.variableWidthStrokeProperties).toEqual({
      widthProfile: 'CUSTOM',
      variableWidthPoints: [
        { position: 0, width: 2 },
        { position: 1, width: 0.2 }
      ]
    })

    line.variableWidthStrokeProperties = null
    expect(node().strokeWidthProfile).toEqual([])
  })

  test('brushes read back as custom and Figma brush names pick one of Kalka’s', async () => {
    const { figma, line, node } = setup()
    expect(line.complexStrokeProperties).toEqual({ type: 'BASIC' })
    await figma.loadBrushesAsync('SCATTER')

    line.complexStrokeProperties = {
      type: 'BRUSH',
      brushType: 'SCATTER',
      brushName: 'BUBBLEGUM',
      gap: 2,
      wiggle: 0,
      sizeJitter: 1.5,
      angularJitter: 90,
      rotation: 0
    }
    expect(node().strokeBrush).toMatchObject({
      type: 'SCATTER',
      gap: 2,
      sizeJitter: 0.5,
      angularJitter: 0.5
    })
    expect(line.complexStrokeProperties).toMatchObject({
      type: 'BRUSH',
      brushType: 'SCATTER',
      brushName: 'CUSTOM',
      sizeJitter: 1.5,
      angularJitter: 90
    })

    line.complexStrokeProperties = {
      type: 'BRUSH',
      brushType: 'STRETCH',
      brushName: 'ink',
      direction: 'BACKWARD'
    }
    expect(node().strokeBrush).toMatchObject({ type: 'STRETCH', id: 'ink', reverse: true })

    line.complexStrokeProperties = { type: 'BASIC' }
    expect(node().strokeBrush).toBeNull()
  })

  test('refuses what Kalka cannot draw', () => {
    const { figma, line } = setup()
    expect(() => {
      line.complexStrokeProperties = { type: 'DYNAMIC', frequency: 1, wiggle: 1, smoothen: 0 }
    }).toThrow('no dynamic strokes')
    const rect = figma.createRectangle()
    expect(() => {
      rect.variableWidthStrokeProperties = { widthProfile: 'WEDGE' }
    }).toThrow('vectors and lines')
    expect(rect.variableWidthStrokeProperties).toBeNull()
  })
})
