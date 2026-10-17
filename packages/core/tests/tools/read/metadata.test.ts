import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'get_metadata'),
  'get_metadata'
)

interface MetadataResult {
  xml: string
  error?: string
}

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const page = expectDefined(graph.getPages()[0], 'page')
  const card = graph.createNode('FRAME', page.id, {
    name: 'Card & "Hero"',
    x: 10,
    y: 20,
    width: 320,
    height: 200
  })
  const title = graph.createNode('TEXT', card.id, {
    name: 'Title',
    x: 16,
    y: 12.345,
    width: 120,
    height: 24
  })
  const hidden = graph.createNode('RECTANGLE', card.id, {
    name: 'Badge',
    x: 280,
    y: 8,
    width: 24,
    height: 24,
    visible: false
  })
  const other = graph.createNode('FRAME', page.id, { name: 'Other', width: 50, height: 50 })
  return { figma, graph, page, card, title, hidden, other }
}

function run(figma: FigmaAPI, args: Record<string, unknown>): MetadataResult {
  return tool.execute(figma, args) as MetadataResult
}

describe('get_metadata', () => {
  test('outlines a node and its children as XML with positions relative to the parent', () => {
    const { figma, card, title, hidden } = setup()
    const { xml } = run(figma, { nodeId: card.id })
    expect(xml.split('\n')).toEqual([
      `<frame id="${card.id}" name="Card &amp; &quot;Hero&quot;" x="10" y="20" width="320" height="200">`,
      `  <text id="${title.id}" name="Title" x="16" y="12.35" width="120" height="24" />`,
      `  <rectangle id="${hidden.id}" name="Badge" x="280" y="8" width="24" height="24" hidden="true" />`,
      '</frame>'
    ])
  })

  test('reads the selection when no node is named', () => {
    const { figma, card, other } = setup()
    figma.currentPage.selection = [
      expectDefined(figma.getNodeById(other.id), 'other'),
      expectDefined(figma.getNodeById(card.id), 'card')
    ]
    const roots = run(figma, {})
      .xml.split('\n')
      .filter((line) => line.startsWith('<'))
      .filter((line) => !line.startsWith('</'))
    expect(roots.map((line) => line.match(/id="([^"]+)"/)?.[1])).toEqual([other.id, card.id])
  })

  test('lists the pages when nothing is named or selected', () => {
    const { figma, graph, page } = setup()
    const second = graph.addPage('Second')
    expect(run(figma, {}).xml.split('\n')).toEqual([
      `<page id="${page.id}" name="${page.name}" />`,
      `<page id="${second.id}" name="Second" />`
    ])
  })

  test('outlines a page by its ID', () => {
    const { figma, page, card, other } = setup()
    const lines = run(figma, { nodeId: page.id, depth: 1 }).xml.split('\n')
    expect(lines[0]).toBe(`<page id="${page.id}" name="${page.name}">`)
    expect(lines).toContain(
      `  <frame id="${card.id}" name="Card &amp; &quot;Hero&quot;" x="10" y="20" width="320" height="200" children="2" />`
    )
    expect(lines.some((line) => line.includes(other.id))).toBe(true)
  })

  test('takes node IDs in the form Figma links write them', () => {
    const { figma, card } = setup()
    const linkId = card.id.replace(':', '-')
    expect(run(figma, { nodeId: linkId }).xml).toStartWith(`<frame id="${card.id}"`)
  })

  test('answers an unknown node with an error and the pages to choose from', () => {
    const { figma, page } = setup()
    const result = run(figma, { nodeId: '999:999' })
    expect(result.error).toContain('999:999')
    expect(result.xml).toContain(`<page id="${page.id}"`)
  })

  test("accepts the client arguments Figma's tool takes", () => {
    const { figma, card } = setup()
    const result = run(figma, {
      nodeId: card.id,
      fileKey: 'abc',
      clientLanguages: 'typescript',
      clientFrameworks: 'vue'
    })
    expect(result.error).toBeUndefined()
  })
})
