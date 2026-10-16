import { describe, expect, it } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { installLayoutEngine, type LayoutEngine } from '@kalka/core/layout'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'get_computed_styles'),
  'get_computed_styles'
)

/** A layout engine that draws one layer, as the DOM scene draws those on the shown page. */
function engineDrawing(nodeId: string): LayoutEngine & { asked: readonly string[][] } {
  const asked: string[][] = []
  return {
    asked,
    layout: () => true,
    computedStyle(_graph, id, properties) {
      asked.push([...properties])
      return id === nodeId ? { width: '320px', display: 'flex' } : null
    }
  }
}

describe('get_computed_styles', () => {
  it('reads the values the engine computed for a drawn layer', async () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Card' })
    const engine = engineDrawing(frame.id)
    const uninstall = installLayoutEngine(engine)
    try {
      const result = await tool.execute(new FigmaAPI(graph), { id: frame.id, properties: ['width'] })
      expect(result).toEqual({ id: frame.id, name: 'Card', styles: { width: '320px', display: 'flex' } })
      expect(engine.asked).toEqual([['width']])
    } finally {
      uninstall()
    }
  })

  it('explains when the layer is not drawn', async () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Card' })
    const uninstall = installLayoutEngine(engineDrawing('other'))
    try {
      const result = await tool.execute(new FigmaAPI(graph), { id: frame.id })
      expect(result).toEqual({ error: expect.stringContaining('not drawn') })
    } finally {
      uninstall()
    }
  })
})
