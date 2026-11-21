import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { FRESH_COMPONENTS, FRESH_LIBRARY_ID, searchFreshComponents } from '@kalka/core/library'
import { freshLibraryRevision, insertFreshComponent } from '@kalka/core/tools'
import { insertLibraryComponent, searchLibraryComponents } from '@kalka/core/tools/read'
import { SceneGraph } from '@kalka/scene-graph'

function document() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  return { graph, figma }
}

describe('searching Kalka Fresh by intent', () => {
  test('finds a live background for an animated tech landing', () => {
    const [first] = searchFreshComponents('animated background for a tech landing')
    expect(first).toMatchObject({ category: 'backgrounds', live: true })
  })

  test('finds the stamp next to a headline', () => {
    const keys = searchFreshComponents('playful stamp next to the headline', { limit: 3 }).map(
      (result) => result.asset_key
    )
    expect(keys).toContain('text-ring')
  })

  test('keeps to a category, lists everything for an empty intent, and gives HTML on request', () => {
    const buttons = searchFreshComponents('soft', { category: 'buttons' })
    expect(buttons.every((result) => result.category === 'buttons')).toBe(true)
    expect(searchFreshComponents('')).toHaveLength(FRESH_COMPONENTS.length)
    const [withHTML] = searchFreshComponents('folded ticket', { includeHTML: true, limit: 1 })
    expect(withHTML?.html).toContain('var(--color-')
    expect(searchFreshComponents('ticket', { limit: 1 })[0]?.html).toBeUndefined()
  })

  test('the tool returns matches with their credit and the toolbox note', () => {
    const result = searchLibraryComponents.execute(new FigmaAPI(new SceneGraph()), {
      query: 'glass card'
    })
    expect(result).toMatchObject({
      library: { id: FRESH_LIBRARY_ID },
      components: expect.arrayContaining([
        expect.objectContaining({ credit: expect.stringMatching(/Cult UI|Paper Shaders/) })
      ]),
      note: expect.stringContaining('not a template')
    })
  })
})

describe('the built-in revision', () => {
  test('holds every component as a component set with its variants and text properties', async () => {
    const revision = await freshLibraryRevision()
    expect(revision.manifest.libraryId).toBe(FRESH_LIBRARY_ID)
    expect(revision.manifest.assets.map((asset) => asset.key)).toEqual(
      FRESH_COMPONENTS.map((component) => component.key)
    )
    const halo = revision.manifest.assets.find((asset) => asset.key === 'halo-button')
    const set = halo ? revision.graph.getNode(halo.sourceNodeId) : undefined
    expect(set?.type).toBe('COMPONENT_SET')
    expect(set?.childIds).toHaveLength(2)
    expect(set?.componentPropertyDefinitions.map((definition) => definition.name)).toContain(
      'Label'
    )
    expect(set?.symbolDescription).toContain('Cult UI')
    expect(await freshLibraryRevision()).toBe(revision)
  })
})

describe('inserting a Fresh component', () => {
  test('places an instance with its variant and text, and enables the library', async () => {
    const { graph, figma } = document()
    const inserted = await insertFreshComponent(figma, {
      assetKey: 'halo-button',
      properties: { State: 'Hover', Label: 'Book a table' }
    })
    expect(inserted).toMatchObject({
      name: 'Halo button',
      properties: { State: 'Hover', Label: 'Book a table' }
    })
    expect(graph.getNode(inserted.id)?.type).toBe('INSTANCE')
    expect(graph.enabledLibraries.get(FRESH_LIBRARY_ID)?.enabled).toBe(true)
  })

  test('refuses a property the component does not have and leaves nothing behind', async () => {
    const { graph, figma } = document()
    const before = graph.getChildren(figma.currentPageId).length
    expect(
      insertFreshComponent(figma, { assetKey: 'ticker-band', properties: { Speed: 'Fast' } })
    ).rejects.toThrow('Unknown properties: Speed')
    await Bun.sleep(0)
    expect(graph.getChildren(figma.currentPageId)).toHaveLength(before)
  })

  test("gives a live shader the document's accent, ground and ink", async () => {
    const { graph, figma } = document()
    const colors = graph.createCollection('Colors')
    graph.createVariable('accent', 'COLOR', colors.id, { r: 1, g: 0.4, b: 0, a: 1 })
    graph.createVariable('ground', 'COLOR', colors.id, { r: 0, g: 0.1, b: 0.2, a: 1 })
    const inserted = await insertFreshComponent(figma, { assetKey: 'mesh-field' })
    expect(inserted.recolored).toEqual(['accent', 'ground'])
    const shader = graph.getNode(inserted.id)?.shader
    expect(shader?.colors[0]).toEqual({ r: 1, g: 0.4, b: 0, a: 1 })
    expect(shader?.colors[1]).toEqual({ r: 0, g: 0.1, b: 0.2, a: 1 })
  })

  test('the insert tool takes Fresh components without a catalog', async () => {
    const { graph, figma } = document()
    const result = await insertLibraryComponent.execute(figma, {
      library_id: FRESH_LIBRARY_ID,
      asset_key: 'texture-button',
      properties: { Kind: 'Accent' }
    })
    expect(result).toMatchObject({ properties: { Kind: 'Accent' } })
    expect(
      await insertLibraryComponent.execute(figma, { library_id: FRESH_LIBRARY_ID, asset_key: 'nope' })
    ).toMatchObject({ error: expect.stringContaining('nope') })
    expect([...graph.getAllNodes()].some((node) => node.type === 'INSTANCE')).toBe(true)
  })
})
