import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'
import { colorToFill } from '@kalka/scene-graph/color'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'get_variable_defs'),
  'get_variable_defs'
)

interface VariableDefsResult {
  error?: string
  definitions: Record<string, string>
  variables: Array<{
    name: string
    collection: string
    mode: string
    value: string
    valuesByMode: Record<string, string>
  }>
  styles: Array<{ name: string; type: string; value: string }>
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const page = expectDefined(graph.getPages()[0], 'page')

  const colors = graph.createCollection('Colors')
  const light = colors.defaultModeId
  const dark = expectDefined(graph.createMode(colors.id, 'Dark'), 'dark mode')
  const brand = graph.createVariable('brand/500', 'COLOR', colors.id, { r: 1, g: 0, b: 0, a: 1 })
  figma.setVariableValue(brand.id, dark, { r: 0, g: 0, b: 1, a: 1 })
  const primary = graph.createVariable('color/primary', 'COLOR', colors.id, { aliasId: brand.id })
  figma.setVariableValue(primary.id, dark, { aliasId: brand.id })
  const spacing = graph.createCollection('Spacing')
  const radius = graph.createVariable('radius/md', 'FLOAT', spacing.id, 8)
  graph.createVariable('radius/unused', 'FLOAT', spacing.id, 99)

  const styles = graph.addPage('Styles')
  graph.updateNode(styles.id, { internalOnly: true })
  const heading = graph.createNode('TEXT', styles.id, {
    name: 'Heading/H1',
    sharedStyleType: 'TEXT',
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 32,
    lineHeight: 40,
    internalOnly: true
  })
  heading.source.id = 'S:heading'

  const card = graph.createNode('FRAME', page.id, { name: 'Card', width: 200, height: 100 })
  const button = graph.createNode('RECTANGLE', card.id, {
    name: 'Button',
    fills: [colorToFill('#FF0000')]
  })
  graph.bindVariable(button.id, 'fills/0/color', primary.id)
  graph.bindVariable(button.id, 'cornerRadius', radius.id)
  const title = graph.createNode('TEXT', card.id, { name: 'Title', textStyleId: 'S:heading' })
  const other = graph.createNode('FRAME', page.id, { name: 'Other' })
  return { graph, figma, colors, light, dark, card, button, title, other }
}

function run(figma: FigmaAPI, args: Record<string, unknown>): VariableDefsResult {
  return tool.execute(figma, args) as VariableDefsResult
}

describe('get_variable_defs', () => {
  test('maps every variable and style a node and its children use to its value', () => {
    const { figma, card } = setup()
    expect(run(figma, { nodeId: card.id }).definitions).toEqual({
      'color/primary': '#FF0000',
      'radius/md': '8',
      'Heading/H1': 'Font(family: Inter, weight: 700, size: 32, lineHeight: 40, letterSpacing: 0)'
    })
  })

  test('gives each variable its value in every mode, aliases followed', () => {
    const { figma, button } = setup()
    const primary = run(figma, { nodeId: button.id }).variables.find(
      (variable) => variable.name === 'color/primary'
    )
    expect(primary).toMatchObject({
      collection: 'Colors',
      value: '#FF0000',
      valuesByMode: { Dark: '#0000FF' }
    })
    expect(Object.values(expectDefined(primary, 'primary').valuesByMode)).toEqual([
      '#FF0000',
      '#0000FF'
    ])
  })

  test('reads values in the mode the layers are in', () => {
    const { figma, graph, card, colors, dark } = setup()
    graph.updateNode(card.id, { variableModes: { [colors.id]: dark } })
    const result = run(figma, { nodeId: card.id })
    expect(result.definitions['color/primary']).toBe('#0000FF')
    expect(result.variables.find((variable) => variable.name === 'color/primary')?.mode).toBe(
      'Dark'
    )
  })

  test('reads the selection when no node is named', () => {
    const { figma, title } = setup()
    figma.currentPage.selection = [expectDefined(figma.getNodeById(title.id), 'title')]
    const result = run(figma, {})
    expect(result.variables).toEqual([])
    expect(result.styles.map((style) => style.name)).toEqual(['Heading/H1'])
  })

  test('reads the whole page when nothing is named or selected', () => {
    const { figma } = setup()
    expect(Object.keys(run(figma, {}).definitions).sort()).toEqual([
      'Heading/H1',
      'color/primary',
      'radius/md'
    ])
  })

  test('returns nothing for layers without variables or styles', () => {
    const { figma, other } = setup()
    expect(run(figma, { nodeId: other.id })).toEqual({ definitions: {}, variables: [], styles: [] })
  })

  test('reports an unknown node', () => {
    const { figma } = setup()
    expect(run(figma, { nodeId: '999:999' }).error).toContain('999:999')
  })
})
