import { afterEach, describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { fontManager } from '@kalka/core/text'
import { compileScript, CORE_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { fakeFontCatalogue } from '#core-tests/helpers/font-catalogue'

const CATALOGUE = [
  { id: 'fraunces', family: 'Fraunces', variable: true },
  { id: 'inter-tight', family: 'Inter Tight', variable: true },
  { id: 'inter', family: 'Inter' }
]

function documentUsing(fetch: ReturnType<typeof fakeFontCatalogue>['fetch']) {
  fontManager.setWebFontFetch(fetch)
  const graph = new SceneGraph()
  graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Hello', fontFamily: 'Fraunces' })
  return { graph, figma: new FigmaAPI(graph) }
}

function tool(name: string) {
  const found = CORE_TOOLS.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`No ${name} tool`)
  return found
}

afterEach(() => {
  fontManager.setWebFontFetch(null)
})

describe('kalka fonts scripting API', () => {
  test('a script adds a catalogue family to the document, which then draws with it', async () => {
    const { graph, figma } = documentUsing(fakeFontCatalogue(CATALOGUE).fetch)
    const result = await compileScript(`
      const font = await kalka.addFont('Fraunces')
      return { font, kept: kalka.fonts.map((kept) => kept.family) }
    `)(figma)
    expect(result).toMatchObject({
      font: { family: 'Fraunces', source: 'fontsource', license: 'OFL-1.1', weights: ['100 900'] },
      kept: ['Fraunces']
    })
    expect(graph.fonts.get('Fraunces')?.licenseText).toContain('OPEN FONT LICENSE')
    expect(fontManager.loadedFontSource('Fraunces', 'Bold')).toBe('project')
  })

  test('a search says which families the document carries already', async () => {
    const { figma } = documentUsing(fakeFontCatalogue(CATALOGUE).fetch)
    const result = await compileScript(`
      await kalka.addFont('Inter Tight')
      return (await kalka.searchFonts('inter')).map(({ family, added }) => ({ family, added }))
    `)(figma)
    expect(result).toEqual([
      { family: 'Inter', added: false },
      { family: 'Inter Tight', added: true }
    ])
  })

  test('removing a family stops the document carrying it', async () => {
    const { graph, figma } = documentUsing(fakeFontCatalogue(CATALOGUE).fetch)
    await compileScript(`await kalka.addFont('Inter'); kalka.removeFont('Inter')`)(figma)
    expect(graph.fonts.size).toBe(0)
  })
})

describe('font tools', () => {
  test('add_font names close families when the catalogue has none of that name', async () => {
    const { graph, figma } = documentUsing(fakeFontCatalogue(CATALOGUE).fetch)
    const result = await tool('add_font').execute(figma, { family: 'Inter Display' })
    expect(result).toEqual({
      error: expect.stringContaining('Inter, Inter Tight')
    })
    expect(graph.fonts.size).toBe(0)
  })

  test('search_fonts lists open-licence families for the agent to choose from', async () => {
    const { figma } = documentUsing(fakeFontCatalogue(CATALOGUE).fetch)
    const result = await tool('search_fonts').execute(figma, { query: 'fra' })
    expect(result).toMatchObject({ count: 1, fonts: [{ family: 'Fraunces', license: 'OFL-1.1' }] })
  })
})
