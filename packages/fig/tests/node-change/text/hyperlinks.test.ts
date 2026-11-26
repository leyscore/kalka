import { describe, expect, test } from 'bun:test'

import { importStyleRuns } from '#fig/node-change/convert'
import { exportTextData } from '#fig/node-change/text/data-export'

import type { NodeChange, Paint } from '@kalka/kiwi/fig/codec'
import { SceneGraph } from '@kalka/scene-graph'

const URL_LINK = { type: 'URL', value: 'https://kalka.design' } as const

describe('text hyperlinks in .fig', () => {
  test('a style override link becomes the link of its characters', () => {
    const runs = importStyleRuns({
      textData: {
        characters: 'Read more',
        characterStyleIDs: [0, 0, 0, 0, 0, 1, 1, 1, 1],
        styleOverrideTable: [{ styleID: 1, hyperlink: { url: URL_LINK.value } }]
      }
    } as NodeChange)
    expect(runs).toEqual([{ start: 5, length: 4, style: { hyperlink: URL_LINK } }])
  })

  test('a link on the whole text layer covers every character', () => {
    const runs = importStyleRuns({
      hyperlink: { url: URL_LINK.value },
      textData: { characters: 'Docs' }
    } as NodeChange)
    expect(runs).toEqual([{ start: 0, length: 4, style: { hyperlink: URL_LINK } }])
  })

  test('a run link is written back to its style override', () => {
    const graph = new SceneGraph()
    const node = graph.createNode('TEXT', graph.getPages()[0].id, {
      text: 'Read more',
      styleRuns: [{ start: 5, length: 4, style: { hyperlink: URL_LINK } }]
    })
    const data = exportTextData(
      node,
      () => [],
      () => ({ type: 'SOLID' }) as Paint
    )
    expect(data?.styleOverrideTable?.[0]?.hyperlink).toEqual({ url: URL_LINK.value })
    expect(data?.characterStyleIDs).toEqual([0, 0, 0, 0, 0, 1, 1, 1, 1])
  })
})
