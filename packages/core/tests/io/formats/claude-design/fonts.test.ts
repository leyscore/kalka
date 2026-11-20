import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  loadedFaceWeights,
  matchedWeight,
  matchLoadedFontWeights
} from '#core/io/formats/claude-design'

const GOOGLE_CSS = `
/* latin */
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/a.woff2) format('woff2');
}
@font-face {
  font-family: 'Geist';
  font-style: normal;
  font-weight: 600;
  src: url(https://fonts.gstatic.com/b.woff2) format('woff2');
}
@font-face {
  font-family: 'Roboto Flex';
  font-weight: 100 1000;
  src: url(https://fonts.gstatic.com/c.woff2) format('woff2');
}`

describe('loaded font weights', () => {
  test('reads the families and weights a stylesheet loads', () => {
    const faces = loadedFaceWeights(GOOGLE_CSS)
    expect(faces.get('Geist')).toEqual([
      [400, 400],
      [600, 600]
    ])
    expect(faces.get('Roboto Flex')).toEqual([[100, 1000]])
  })

  test('matches a weight the way a browser does', () => {
    const geist: Array<[number, number]> = [
      [400, 400],
      [600, 600]
    ]
    expect(matchedWeight(700, geist)).toBe(600)
    expect(matchedWeight(600, geist)).toBe(600)
    expect(matchedWeight(500, geist)).toBe(400)
    expect(matchedWeight(300, geist)).toBe(400)
    expect(matchedWeight(500, [[400, 400], [500, 500]])).toBe(500)
    expect(matchedWeight(450, [[300, 300], [700, 700]])).toBe(300)
    expect(matchedWeight(800, [[100, 1000]])).toBe(800)
    expect(matchedWeight(700, [])).toBe(700)
  })

  test('draws a bold the page did not load from the face it did', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]?.id ?? ''
    const frame = graph.createNode('FRAME', page)
    const text = graph.createNode('TEXT', frame.id, {
      text: 'Unlock',
      fontFamily: 'Geist',
      fontWeight: 700,
      styleRuns: [{ start: 0, length: 2, style: { fontWeight: 800 } }]
    })
    const other = graph.createNode('TEXT', frame.id, { fontFamily: 'Inter', fontWeight: 700 })
    matchLoadedFontWeights(graph, frame.id, loadedFaceWeights(GOOGLE_CSS))
    expect(graph.getNode(text.id)?.fontWeight).toBe(600)
    expect(graph.getNode(text.id)?.styleRuns[0]?.style.fontWeight).toBe(600)
    expect(graph.getNode(other.id)?.fontWeight).toBe(700)
  })
})
