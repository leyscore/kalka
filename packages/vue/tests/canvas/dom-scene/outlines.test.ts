import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { outlineCSS, outlineKey } from '#vue/canvas/dom-scene/outlines'

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('FRAME', page, { width: 200, height: 100 })
  const title = graph.createNode('TEXT', card.id, { width: 100, height: 20 })
  const other = graph.createNode('FRAME', page, { x: 300, width: 100, height: 100 })
  return { graph, card, title, other }
}

describe('outline mode stylesheet', () => {
  test('outlines every layer of the artboard and strips what paints', () => {
    const { graph, card } = setup()
    const css = outlineCSS(graph, card.id, { selection: null, objectBounds: false, pixelRatio: 2 })
    expect(css).toContain(':is([data-kalka-id]){outline:calc(2px / var(--kalka-device-scale')
    expect(css).toContain('background:none!important')
    expect(css).toContain('-webkit-text-stroke')
  })

  test('leaves text boxes out unless object bounds are shown', () => {
    const { graph, card } = setup()
    const glyphs = outlineCSS(graph, card.id, {
      selection: null,
      objectBounds: false,
      pixelRatio: 1
    })
    expect(glyphs).toContain('[data-kalka-text]{outline:none')
    const bounds = outlineCSS(graph, card.id, {
      selection: null,
      objectBounds: true,
      pixelRatio: 1
    })
    expect(bounds).not.toContain('[data-kalka-text]')
  })

  test('outlines only the selection, and nothing in artboards without it', () => {
    const { graph, card, title, other } = setup()
    const view = { selection: new Set([title.id]), objectBounds: true, pixelRatio: 1 }
    expect(outlineCSS(graph, card.id, view)).toContain(`[data-kalka-id="${title.id}"] *`)
    expect(outlineCSS(graph, other.id, view)).toBe('')
  })

  test('keys the view so artboards restyle only when it changes', () => {
    const all = { selection: null, objectBounds: false, pixelRatio: 1 }
    expect(outlineKey(null, 3)).toBe('')
    expect(outlineKey(all, 3)).toBe(outlineKey(all, 4))
    const selection = { ...all, selection: new Set(['1:2']) }
    expect(outlineKey(selection, 3)).not.toBe(outlineKey(selection, 4))
  })
})
