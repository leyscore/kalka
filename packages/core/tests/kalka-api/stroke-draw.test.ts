import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { compileScript } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { setStrokeDraw } from '#core/tools/modify/stroke-draw'

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const line = figma.createLine()
  line.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
  return { graph, figma, line }
}

describe('stroke width profiles and brushes for scripts and agents', () => {
  test('a script sets a preset and a brush by name', async () => {
    const { graph, figma, line } = setup()
    const result = await compileScript(`
      const line = figma.getNodeById(${JSON.stringify(line.id)})
      kalka.setStrokeDraw(line, { widthProfile: 'taper', brush: 'SCATTER:stars' })
      return { draw: kalka.getStrokeDraw(line), catalog: kalka.strokeDrawCatalog }
    `)(figma)
    expect(result).toMatchObject({
      draw: { widthPreset: 'taper', brush: { type: 'SCATTER', id: 'stars' } },
      catalog: { widthPresets: expect.arrayContaining(['uniform', 'taper']) }
    })
    expect(graph.getNode(line.id)?.strokeBrush?.id).toBe('stars')
  })

  test('the set_stroke_draw tool clears with uniform and none, and names what is wrong', () => {
    const { graph, figma, line } = setup()
    setStrokeDraw.execute(figma, { id: line.id, width_profile: 'eye', brush: 'STRETCH:ink' })
    expect(graph.getNode(line.id)?.strokeWidthProfile).toHaveLength(3)
    setStrokeDraw.execute(figma, { id: line.id, width_profile: 'uniform', brush: 'none' })
    expect(graph.getNode(line.id)?.strokeWidthProfile).toEqual([])
    expect(graph.getNode(line.id)?.strokeBrush).toBeNull()
    const rect = figma.createRectangle()
    expect(setStrokeDraw.execute(figma, { id: rect.id, width_profile: 'eye' })).toMatchObject({
      error: expect.stringContaining('need a path')
    })
  })
})
