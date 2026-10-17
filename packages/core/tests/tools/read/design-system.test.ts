import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS, registerComponentCatalog, type ComponentCatalog } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'
import { colorToFill } from '@kalka/scene-graph/color'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'search_design_system'),
  'search_design_system'
)

interface SearchResult {
  query: string
  components: Array<{ name: string; type: string; source: string; libraryName?: string }>
  variables: Array<{ name: string; collection: string; valuesByMode: Record<string, string> }>
  styles: Array<{ id: string; name: string; type: string; value: string }>
}

function libraryCatalog(): ComponentCatalog {
  return {
    listLibraries: async () => [],
    listComponents: async () => [
      {
        libraryId: 'lib',
        libraryName: 'Brand UI',
        revisionId: 'r1',
        enabled: true,
        priority: 0,
        asset: {
          key: 'button-ghost',
          type: 'COMPONENT',
          name: 'Button/Ghost',
          description: 'Transparent button',
          sourceNodeId: '1:1',
          contentHash: 'hash'
        }
      }
    ],
    insertComponent: async () => ({ id: '', componentId: '' })
  }
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const page = expectDefined(graph.getPages()[0], 'page')
  const set = graph.createNode('COMPONENT_SET', page.id, { name: 'Button' })
  graph.createNode('COMPONENT', set.id, { name: 'Size=Large' })
  graph.createNode('COMPONENT', page.id, { name: 'Button/Primary' })
  graph.createNode('COMPONENT', page.id, { name: 'Card' })

  const colors = graph.createCollection('Colors')
  graph.createVariable('button/background', 'COLOR', colors.id, { r: 0, g: 0, b: 0, a: 1 })
  graph.createVariable('surface', 'COLOR', colors.id, { r: 1, g: 1, b: 1, a: 1 })

  const style = graph.createNode('RECTANGLE', page.id, {
    name: 'Button/Fill',
    sharedStyleType: 'FILL',
    fills: [colorToFill('#336699')]
  })
  style.source.id = 'S:fill'
  return { graph, figma }
}

async function run(figma: FigmaAPI, args: Record<string, unknown>): Promise<SearchResult[]> {
  const { results } = (await tool.execute(figma, args)) as { results: SearchResult[] }
  return results
}

describe('search_design_system', () => {
  test('finds components, variables, and styles whose names match', async () => {
    const { figma } = setup()
    const [result] = await run(figma, { query: 'button' })
    expect(result.components.map((component) => component.name)).toEqual([
      'Button',
      'Button/Primary'
    ])
    expect(result.variables.map((variable) => variable.name)).toEqual(['button/background'])
    expect(result.variables[0].collection).toBe('Colors')
    expect(result.styles).toEqual([
      { id: 'S:fill', name: 'Button/Fill', type: 'FILL', value: '#336699' }
    ])
  })

  test('matches every word of a query across name groups', async () => {
    const { figma } = setup()
    const [result] = await run(figma, { query: 'primary button' })
    expect(result.components.map((component) => component.name)).toEqual(['Button/Primary'])
  })

  test('runs several searches in one call', async () => {
    const { figma } = setup()
    const results = await run(figma, { query: ['card', 'surface'] })
    expect(results.map((result) => result.query)).toEqual(['card', 'surface'])
    expect(results[0].components.map((component) => component.name)).toEqual(['Card'])
    expect(results[1].variables.map((variable) => variable.name)).toEqual(['surface'])
  })

  test('searches only the kinds asked for', async () => {
    const { figma } = setup()
    const [result] = await run(figma, {
      query: 'button',
      includeComponents: false,
      includeStyles: false
    })
    expect(result.components).toEqual([])
    expect(result.styles).toEqual([])
    expect(result.variables).toHaveLength(1)
  })

  test('includes components of the enabled libraries', async () => {
    const { graph, figma } = setup()
    const unregister = registerComponentCatalog(graph, libraryCatalog())
    try {
      const [result] = await run(figma, { query: 'transparent', includeVariables: false })
      expect(result.components).toMatchObject([
        { name: 'Button/Ghost', source: 'library', libraryName: 'Brand UI' }
      ])
    } finally {
      unregister()
    }
  })

  test('limits the results of each kind', async () => {
    const { figma } = setup()
    const [result] = await run(figma, { query: 'button', limit: 1 })
    expect(result.components.map((component) => component.name)).toEqual(['Button'])
  })

  test('rejects a blank query', () => {
    const { figma } = setup()
    expect(() => tool.execute(figma, { query: '  ' })).toThrow(/nonblank/)
  })
})
