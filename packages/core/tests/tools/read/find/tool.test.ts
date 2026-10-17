import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'
import { colorToFill } from '@kalka/scene-graph/color'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'find_nodes'),
  'find_nodes'
)

interface TokenMatch {
  field: string
  properties: string[]
  value: string
  variable: { id: string; name: string; collection: string }
  bound: boolean
  throughAlias?: true
  modes?: string[]
  mode?: string
}

interface FoundNode {
  id: string
  name: string
  type: string
  page: { id: string; name: string }
  text?: string
  styles?: Array<{
    property: string
    value: string
    variables?: Array<{ id: string; name: string; collection: string; field: string }>
  }>
  tokens?: TokenMatch[]
}

interface FindResult {
  error?: string
  count: number
  truncated?: true
  nodes: FoundNode[]
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const page = expectDefined(graph.getPages()[0], 'page')
  graph.updateNode(page.id, { name: 'Home' })

  const colors = graph.createCollection('Colors')
  const dark = expectDefined(graph.createMode(colors.id, 'Dark'), 'dark mode')
  const blue = graph.createVariable('brand/blue', 'COLOR', colors.id, {
    r: 47 / 255,
    g: 91 / 255,
    b: 234 / 255,
    a: 1
  })
  figma.setVariableValue(blue.id, dark, { r: 1, g: 1, b: 1, a: 1 })
  const primary = graph.createVariable('color/primary', 'COLOR', colors.id, { aliasId: blue.id })
  figma.setVariableValue(primary.id, dark, { aliasId: blue.id })
  const spacing = graph.createCollection('Spacing')
  const radius = graph.createVariable('radius/md', 'FLOAT', spacing.id, 8)
  radius.scopes = ['CORNER_RADIUS']

  const card = graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 320,
    height: 200,
    fills: [colorToFill('#FFFFFF')],
    cornerRadius: 8,
    layoutMode: 'VERTICAL',
    itemSpacing: 16,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16
  })
  const button = graph.createNode('RECTANGLE', card.id, {
    name: 'Button Primary',
    width: 120,
    height: 40,
    fills: [colorToFill('#2F5BEA')],
    cornerRadius: 8
  })
  graph.bindVariable(button.id, 'fills/0/color', primary.id)
  graph.bindVariable(button.id, 'cornerRadius', radius.id)
  const raw = graph.createNode('RECTANGLE', card.id, {
    name: 'Button Raw',
    width: 120,
    height: 40,
    fills: [colorToFill('#2f5bea')],
    cornerRadius: 8
  })
  const title = graph.createNode('TEXT', card.id, {
    name: 'Title',
    text: 'Welcome back',
    fontSize: 24,
    fills: [colorToFill('#111111')]
  })
  const nightButton = graph.createNode('RECTANGLE', card.id, {
    name: 'Night',
    fills: [colorToFill('#FFFFFF')]
  })

  const other = graph.addPage('Settings')
  const otherButton = graph.createNode('RECTANGLE', other.id, {
    name: 'Button Other',
    fills: [colorToFill('rgb(47, 91, 234)')]
  })
  return {
    graph,
    figma,
    page,
    blue,
    primary,
    radius,
    card,
    button,
    raw,
    title,
    nightButton,
    other,
    otherButton
  }
}

function run(figma: FigmaAPI, args: Record<string, unknown>): FindResult {
  return tool.execute(figma, args) as FindResult
}

const names = (result: FindResult) => result.nodes.map((node) => node.name)

describe('find_nodes by name, type and text', () => {
  test('keeps substring name and type filters', () => {
    const { figma } = setup()
    expect(names(run(figma, { name: 'button' }))).toEqual(['Button Primary', 'Button Raw'])
    expect(run(figma, { type: 'TEXT' }).count).toBe(1)
  })

  test('takes wildcards in names and text', () => {
    const { figma } = setup()
    expect(names(run(figma, { name: 'Button*' }))).toEqual(['Button Primary', 'Button Raw'])
    expect(names(run(figma, { name: '*raw' }))).toEqual(['Button Raw'])
    const found = run(figma, { text: 'welcome*' })
    expect(names(found)).toEqual(['Title'])
    expect(found.nodes[0].text).toBe('Welcome back')
    expect(run(figma, { text: 'back' }).count).toBe(1)
    expect(run(figma, { text: 'back*' }).count).toBe(0)
  })
})

describe('find_nodes by style', () => {
  test('matches projected CSS colors in any notation and reports bound variables', () => {
    const { figma, primary } = setup()
    const result = run(figma, {
      style: { property: 'background-color', value: 'oklch(0.5334 0.221 265.79)' }
    })
    expect(names(result)).toEqual(['Button Primary', 'Button Raw'])
    const [bound, raw] = result.nodes
    expect(bound.styles).toEqual([
      {
        property: 'background-color',
        value: '#2F5BEA',
        variables: [{ id: primary.id, name: 'color/primary', collection: 'Colors', field: 'fills/0/color' }]
      }
    ])
    expect(raw.styles?.[0].variables).toBeUndefined()
  })

  test('matches lengths, shorthands and any property', () => {
    const { figma } = setup()
    expect(names(run(figma, { style: { property: 'border-radius', value: '8px' } }))).toEqual([
      'Card',
      'Button Primary',
      'Button Raw'
    ])
    expect(names(run(figma, { style: { property: 'gap', value: '1rem' } }))).toEqual(['Card'])
    expect(names(run(figma, { style: { property: 'padding-left', value: '16' } }))).toEqual([
      'Card'
    ])
    expect(names(run(figma, { style: { property: 'font-size', value: '24px' } }))).toEqual([
      'Title'
    ])
    const anywhere = run(figma, { style: { value: '#111' } })
    expect(names(anywhere)).toEqual(['Title'])
    expect(anywhere.nodes[0].styles?.map((style) => style.property)).toContain('color')
  })

  test('matches a declared property with no value, and reads the layer CSS kept as written', () => {
    const { figma, graph, card } = setup()
    graph.updateNode(card.id, { style: { ...card.style, cursor: 'pointer' } })
    expect(names(run(figma, { style: { property: 'cursor' } }))).toEqual(['Card'])
    expect(run(figma, { style: { property: 'cursor', value: 'point*' } }).count).toBe(1)
  })

  test('applies the tolerance', () => {
    const { figma } = setup()
    expect(run(figma, { style: { property: 'background-color', value: '#2F5BF0' } }).count).toBe(0)
    expect(
      run(figma, { style: { property: 'background-color', value: '#2F5BF0' }, tolerance: 8 }).count
    ).toBe(2)
  })
})

describe('find_nodes by variable', () => {
  test('finds layers bound to a variable directly', () => {
    const { figma, primary } = setup()
    const result = run(figma, { variable: 'color/primary' })
    expect(names(result)).toEqual(['Button Primary'])
    expect(result.nodes[0].tokens).toEqual([
      {
        field: 'fills/0/color',
        properties: ['background-color'],
        value: '#2F5BEA',
        variable: { id: primary.id, name: 'color/primary', collection: 'Colors' },
        bound: true,
        mode: 'Mode 1'
      }
    ])
  })

  test('finds layers bound through an alias, by ID or CSS custom property', () => {
    const { figma, blue } = setup()
    const byName = run(figma, { variable: 'brand/blue' })
    expect(names(byName)).toEqual(['Button Primary'])
    expect(byName.nodes[0].tokens?.[0]).toMatchObject({
      variable: { name: 'color/primary' },
      throughAlias: true
    })
    expect(run(figma, { variable: blue.id }).count).toBe(1)
    expect(run(figma, { variable: '--brand-blue' }).count).toBe(1)
    expect(run(figma, { variable: 'var(--brand-blue)' }).count).toBe(1)
  })

  test('finds unbound layers whose raw value equals the token in some mode', () => {
    const { figma } = setup()
    const result = run(figma, { variable: 'brand/blue', variable_match: 'unbound' })
    expect(names(result)).toEqual(['Card', 'Button Raw', 'Night'])
    const raw = expectDefined(
      result.nodes.find((node) => node.name === 'Button Raw'),
      'raw button'
    )
    expect(raw.tokens).toEqual([
      {
        field: 'fills/0/color',
        properties: ['background-color'],
        value: '#2F5BEA',
        variable: expect.objectContaining({ name: 'brand/blue' }),
        bound: false,
        modes: ['Mode 1']
      }
    ])
    expect(result.nodes.find((node) => node.name === 'Night')?.tokens?.[0].modes).toEqual([
      'Dark'
    ])
  })

  test('limits unbound number candidates to the token scopes', () => {
    const { figma } = setup()
    const result = run(figma, { variable: 'radius/md', variable_match: 'unbound' })
    expect(names(result)).toEqual(['Card', 'Button Raw'])
    expect(result.nodes[0].tokens?.map((token) => token.field)).toEqual(['cornerRadius'])
  })

  test('returns bound and unbound layers together', () => {
    const { figma } = setup()
    const result = run(figma, { variable: 'radius/md', variable_match: 'any' })
    expect(names(result)).toEqual(['Card', 'Button Primary', 'Button Raw'])
    expect(result.nodes[1].tokens?.[0].bound).toBe(true)
  })

  test('combines with a style filter', () => {
    const { figma } = setup()
    expect(
      names(
        run(figma, {
          variable: 'brand/blue',
          variable_match: 'unbound',
          style: { property: 'background-color', value: '#2F5BEA' }
        })
      )
    ).toEqual(['Button Raw'])
  })

  test('reports an unknown variable', () => {
    const { figma } = setup()
    expect(run(figma, { variable: 'color/missing' }).error).toContain('color/missing')
  })
})

describe('find_nodes scope and results', () => {
  test('searches the current page by default, another page, or the whole document', () => {
    const { figma, other } = setup()
    const value = { property: 'background-color', value: '#2F5BEA' }
    expect(run(figma, { style: value }).count).toBe(2)
    const elsewhere = run(figma, { style: value, page: 'Settings' })
    expect(names(elsewhere)).toEqual(['Button Other'])
    expect(elsewhere.nodes[0].page).toEqual({ id: other.id, name: 'Settings' })
    expect(run(figma, { style: value, page: other.id }).count).toBe(1)
    const everywhere = run(figma, { style: value, within: 'document' })
    expect(everywhere.nodes.map((node) => node.page.name)).toEqual(['Home', 'Home', 'Settings'])
    expect(run(figma, { page: 'Nowhere' }).error).toContain('Settings')
    expect(run(figma, { style: {} }).error).toContain('property')
  })

  test('searches a subtree or the selection', () => {
    const { figma, raw, card } = setup()
    expect(names(run(figma, { root_id: raw.id }))).toEqual(['Button Raw'])
    expect(run(figma, { root_id: card.id }).count).toBe(5)
    expect(run(figma, { within: 'selection' }).error).toContain('Nothing is selected')
    figma.currentPage.selection = [expectDefined(figma.getNodeById(raw.id), 'raw')]
    expect(names(run(figma, { within: 'selection', name: 'button' }))).toEqual(['Button Raw'])
    expect(run(figma, { root_id: '999:999' }).error).toContain('999:999')
  })

  test('caps the nodes it returns and counts them all', () => {
    const { figma } = setup()
    const result = run(figma, { limit: 2 })
    expect(result.count).toBe(5)
    expect(result.truncated).toBe(true)
    expect(result.nodes).toHaveLength(2)
    expect(run(figma, {}).truncated).toBeUndefined()
  })
})
