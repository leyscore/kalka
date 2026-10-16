import { describe, expect, test } from 'bun:test'

import { figmaLosses } from '#fig/document/figma-losses'

import { SceneGraph } from '@kalka/scene-graph'

function graphWithFrame() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  return { graph, frame: graph.createNode('FRAME', page.id, { width: 100, height: 100 }) }
}

describe('Figma losses', () => {
  test('a document of plain layers loses nothing', () => {
    expect(figmaLosses(graphWithFrame().graph)).toEqual([])
  })

  test('lists the CSS only Kalka shows, with how often each is used', () => {
    const { graph, frame } = graphWithFrame()
    const page = graph.getPages()[0]
    graph.updateNode(frame.id, { htmlTag: 'nav', htmlClasses: ['menu'], layoutDirection: 'RTL' })
    graph.createNode('FRAME', page.id, { htmlTag: 'section' })
    const collection = graph.createCollection('Theme')
    const dark = graph.createMode(collection.id, 'Dark')
    const mode = collection.modes.find((entry) => entry.modeId === dark)
    if (mode) mode.condition = '(prefers-color-scheme: dark)'

    expect(figmaLosses(graph)).toEqual([
      { kind: 'class-rules', css: 'class rules (.name { … })', count: 1 },
      { kind: 'mode-conditions', css: '@media and attribute mode switches', count: 1 },
      { kind: 'html-tags', css: 'HTML element tags', count: 2 },
      { kind: 'right-to-left', css: 'direction: rtl', count: 1 }
    ])
  })
})
