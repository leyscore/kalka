import { describe, expect, test } from 'bun:test'

import { hitTestFrameTitle, LabelCache } from '@kalka/core/canvas'
import { SceneGraph } from '@kalka/scene-graph'

import {
  componentLabelsLayer,
  ellipsize,
  frameTitlesLayer,
  sectionTitlesLayer,
  type LabelContext
} from '#vue/canvas/svg-overlay/layers/labels'
import { rulerStep, rulersLayer } from '#vue/canvas/svg-overlay/layers/rulers'
import type { OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const measureText = (text: string) => text.length * 6

function flatten(shapes: OverlayShape[]): OverlayShape[] {
  return shapes.flatMap((shape) => (shape.type === 'group' ? flatten(shape.children) : [shape]))
}

function texts(shapes: OverlayShape[]): string[] {
  return flatten(shapes).flatMap((shape) => (shape.type === 'text' ? [shape.text] : []))
}

function context(graph: SceneGraph, patch: Partial<LabelContext> = {}): LabelContext {
  const labels = new LabelCache()
  labels.update(graph, graph.getPages()[0].id)
  return {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays: {},
    selectedIds: new Set(),
    measureText,
    labels,
    viewportSize: { width: 1000, height: 800 },
    ...patch
  }
}

describe('SVG canvas labels', () => {
  test('frames on the page show their name, cut to their width', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('FRAME', page, { name: 'Accueil', x: 10, y: 40, width: 300, height: 200 })
    graph.createNode('FRAME', page, {
      name: 'Un nom beaucoup trop long',
      x: 400,
      y: 40,
      width: 60,
      height: 60
    })
    const names = texts(frameTitlesLayer(context(graph)))
    expect(names).toContain('Accueil')
    expect(names.find((name) => name.startsWith('Un'))?.endsWith('…')).toBe(true)
  })

  test('a selected frame names itself in the selection color', () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
      name: 'A',
      width: 100,
      height: 100
    })
    const [muted] = flatten(frameTitlesLayer(context(graph)))
    const [selected] = flatten(
      frameTitlesLayer(context(graph, { selectedIds: new Set([frame.id]) }))
    )
    expect(muted.type === 'text' && selected.type === 'text' && muted.fill !== selected.fill).toBe(
      true
    )
  })

  test('sections get a tag and components a diamond', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('SECTION', page, { name: 'Écrans', y: 100, width: 400, height: 300 })
    graph.createNode('COMPONENT', page, { name: 'Bouton', x: 600, y: 100, width: 120, height: 40 })
    const sections = flatten(sectionTitlesLayer(context(graph)))
    expect(sections.some((shape) => shape.type === 'rect' && shape.rx !== undefined)).toBe(true)
    expect(texts(sectionTitlesLayer(context(graph)))).toEqual(['Écrans'])
    const components = flatten(componentLabelsLayer(context(graph)))
    expect(components.filter((shape) => shape.type === 'polygon')).toHaveLength(1)
    expect(texts(components)).toEqual(['Bouton'])
  })

  test('ellipsis keeps as many characters as fit', () => {
    expect(ellipsize(measureText, 'abcdef', 11, 400, 30)).toBe('abcd…')
    expect(ellipsize(measureText, 'abc', 11, 400, 30)).toBe('abc')
    expect(ellipsize(measureText, 'abcdef', 11, 400, 8)).toBe('')
  })
})

describe('SVG rulers', () => {
  test('steps are 1, 2 or 5 times a power of ten about 100px apart', () => {
    expect(rulerStep(1)).toBe(100)
    expect(rulerStep(2)).toBe(50)
    expect(rulerStep(0.3)).toBe(500)
  })

  test('the selection marks its extent with badges in world units', () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
      x: 120,
      y: 80,
      width: 200,
      height: 100
    })
    const shapes = rulersLayer(
      context(graph, {
        selectedIds: new Set([frame.id]),
        view: { panX: 50, panY: 30, zoom: 1 }
      }) as never
    )
    const labels = texts(shapes)
    for (const value of ['120', '320', '80', '180']) expect(labels).toContain(value)
  })
})

describe('label hit testing without Skia fonts', () => {
  test('a click on a frame name finds the frame, measured as the overlay draws it', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, {
      name: 'Accueil',
      x: 10,
      y: 40,
      width: 300,
      height: 200
    })
    const labels = new LabelCache()
    labels.update(graph, page)
    const measure = (node: { name: string }, layout: { fontSize: number }) => ({
      width: measureText(node.name),
      height: layout.fontSize
    })
    // The name sits just above the frame; it is seven characters, 42px wide here.
    expect(hitTestFrameTitle(graph, 20, 32, 1, page, null, labels, { measure })?.id).toBe(frame.id)
    expect(hitTestFrameTitle(graph, 200, 32, 1, page, null, labels, { measure })).toBeNull()
    // Without a font and without a measure, nothing can be hit.
    expect(hitTestFrameTitle(graph, 20, 32, 1, page, null, labels)).toBeNull()
  })
})
