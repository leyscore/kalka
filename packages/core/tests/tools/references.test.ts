import { afterEach, describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import {
  registerStockPhotoProvider,
  setActiveStockPhotoProvider,
  type StockPhotoProvider,
  type StockPhotoResult
} from '#core/tools/stock-photo/providers'
import { CORE_TOOLS, findReferences, isToolExposed, searchReferences } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

const figma = new FigmaAPI(new SceneGraph())

function photo(id: string, url = `https://images.example.com/${id}.jpg`): StockPhotoResult {
  return { url, width: 400, height: 300, photographer: `Ada ${id}`, sourceId: id }
}

function provider(name: string, photos: StockPhotoResult[] | Error) {
  const searched: { query: string; perPage: number; targetDim: number }[] = []
  const fake: StockPhotoProvider = {
    name,
    search: (query, { perPage, targetDim }) => {
      searched.push({ query, perPage, targetDim })
      return photos instanceof Error ? Promise.reject(photos) : Promise.resolve(photos)
    }
  }
  return { fake, searched }
}

afterEach(() => setActiveStockPhotoProvider(null))

describe('searchReferences', () => {
  test('links each photo to its page on the service and credits its photographer', async () => {
    const { fake, searched } = provider('pexels', [photo('12')])
    const references = await searchReferences(fake, 'bauhaus poster', 6)
    expect(searched).toEqual([{ query: 'bauhaus poster', perPage: 6, targetDim: 400 }])
    expect(references).toEqual([
      {
        url: 'https://images.example.com/12.jpg',
        label: 'bauhaus poster',
        link: 'https://www.pexels.com/photo/12/',
        credit: 'Ada 12, Pexels'
      }
    ])
  })

  test('keeps https pictures only, up to the count asked', async () => {
    const photos = [photo('a', 'http://images.example.com/a.jpg'), ...'bcdef'.split('').map((id) => photo(id))]
    const { fake } = provider('unsplash', photos)
    const references = await searchReferences(fake, 'bakery', 4)
    expect(references.map((reference) => reference.link)).toEqual([
      'https://unsplash.com/photos/b',
      'https://unsplash.com/photos/c',
      'https://unsplash.com/photos/d',
      'https://unsplash.com/photos/e'
    ])
  })
})

describe('find_references', () => {
  test('without a connected service, the agent is told to offer styles in words', async () => {
    setActiveStockPhotoProvider(null)
    const result = await findReferences.execute(figma, { query: 'swiss grid' })
    expect(result).toMatchObject({ references: [] })
    expect(JSON.stringify(result)).toContain('Images and photos')
  })

  test('names the service, and turns a failed search into an error the agent can read', async () => {
    registerStockPhotoProvider(provider('test-ok', [photo('1')]).fake)
    setActiveStockPhotoProvider('test-ok')
    expect(await findReferences.execute(figma, { query: 'kraft coffee' })).toMatchObject({
      source: 'test-ok',
      references: [{ label: 'kraft coffee', credit: 'Ada 1, test-ok' }]
    })

    registerStockPhotoProvider(provider('test-down', new Error('rate limited')).fake)
    setActiveStockPhotoProvider('test-down')
    const failed = await findReferences.execute(figma, { query: 'kraft coffee' })
    expect(failed).toMatchObject({ error: expect.stringContaining('rate limited') })
  })

  test('is a core tool for the chat agent and MCP, never exposed to pages through WebMCP', () => {
    expect(CORE_TOOLS).toContain(findReferences)
    expect(isToolExposed(findReferences, 'ai')).toBe(true)
    expect(isToolExposed(findReferences, 'mcp')).toBe(true)
    expect(isToolExposed(findReferences, 'webmcp')).toBe(false)
  })
})
