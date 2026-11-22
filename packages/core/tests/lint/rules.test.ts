import { describe, expect, test } from 'bun:test'

import { createLinter, type LintMessage } from '@kalka/core/lint'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

const WHITE = { r: 1, g: 1, b: 1, a: 1 }
const BLUE = { r: 0.23, g: 0.51, b: 0.96, a: 1 }
const LIGHT_GRAY = { r: 0.8, g: 0.8, b: 0.8, a: 1 }

function solid(color: SceneNode['fills'][number]['color']): SceneNode['fills'] {
  return [{ type: 'SOLID', visible: true, opacity: 1, color }]
}

function lint(graph: SceneGraph, rule: string): LintMessage[] {
  const pageId = graph.getPages()[0].id
  return createLinter({ rules: [rule], config: { rules: { [rule]: 'warning' } } }).lintGraph(
    graph,
    [pageId]
  ).messages
}

function addColorVariable(graph: SceneGraph, id: string, name: string, color: typeof BLUE) {
  graph.addCollection({
    id: 'colors',
    name: 'Colors',
    modes: [{ modeId: 'light', name: 'Light' }],
    defaultModeId: 'light',
    variableIds: []
  })
  graph.addVariable({
    id,
    name,
    type: 'COLOR',
    collectionId: 'colors',
    valuesByMode: { light: color },
    description: '',
    hiddenFromPublishing: false
  })
}

describe('no-hardcoded-colors', () => {
  test('reports an unbound color only when a variable has the same value', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    addColorVariable(graph, 'blue', 'Colors/Blue/500', BLUE)
    const matching = graph.createNode('RECTANGLE', pageId, { name: 'Card', fills: solid(BLUE) })
    graph.createNode('RECTANGLE', pageId, { name: 'Tint', fills: solid(LIGHT_GRAY) })

    const messages = lint(graph, 'no-hardcoded-colors')

    expect(messages).toHaveLength(1)
    expect(messages[0]?.nodeId).toBe(matching.id)
    expect(messages[0]?.data).toEqual({
      paint: 'fill',
      index: 0,
      color: '#3B82F5',
      variableId: 'blue',
      variableName: 'Colors/Blue/500'
    })
  })

  test('stays quiet in a document without color variables', () => {
    const graph = new SceneGraph()
    graph.createNode('RECTANGLE', graph.getPages()[0].id, { name: 'Card', fills: solid(BLUE) })
    expect(lint(graph, 'no-hardcoded-colors')).toEqual([])
  })
})

describe('color-contrast', () => {
  test('uses the resolved color of a bound text fill', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    addColorVariable(graph, 'muted', 'Text/Muted', LIGHT_GRAY)
    const card = graph.createNode('FRAME', pageId, { name: 'Card', fills: solid(WHITE) })
    const label = graph.createNode('TEXT', card.id, {
      name: 'Label',
      text: 'Hello',
      fills: solid({ r: 0, g: 0, b: 0, a: 1 })
    })
    graph.bindVariable(label.id, 'fills/0/color', 'muted')

    const messages = lint(graph, 'color-contrast')

    expect(messages.map((message) => message.nodeId)).toEqual([label.id])
    expect(messages[0]?.data).toMatchObject({
      minRatio: 4.5,
      foreground: '#CCCCCC',
      background: '#FFFFFF'
    })
  })
})

describe('no-deeply-nested', () => {
  test('reports only the layer that crosses the depth limit', () => {
    const graph = new SceneGraph()
    let parentId = graph.getPages()[0].id
    const chain: string[] = []
    for (let depth = 1; depth <= 9; depth++) {
      parentId = graph.createNode('FRAME', parentId, { name: `Level ${depth}` }).id
      chain.push(parentId)
    }

    const messages = lint(graph, 'no-deeply-nested')

    expect(messages.map((message) => message.nodeId)).toEqual([chain[6]])
    expect(messages[0]?.data).toEqual({ depth: 7, maxDepth: 6 })
  })
})

describe('touch-target-size', () => {
  test('treats a small control inside a larger control as part of that control', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const button = graph.createNode('FRAME', pageId, { name: 'Button', width: 120, height: 48 })
    graph.createNode('FRAME', button.id, { name: 'Close button', width: 16, height: 16 })
    const chip = graph.createNode('FRAME', pageId, { name: 'Chip', width: 60, height: 24 })

    const messages = lint(graph, 'touch-target-size')

    expect(messages.map((message) => message.nodeId)).toEqual([chip.id])
    expect(messages[0]?.data).toEqual({ width: 60, height: 24, minSize: 44 })
  })

  test('matches control names as whole words', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    graph.createNode('RECTANGLE', pageId, { name: 'Rectangle', width: 1, height: 80 })
    graph.createNode('FRAME', pageId, { name: 'Tablet preview', width: 20, height: 20 })
    const iconButton = graph.createNode('FRAME', pageId, {
      name: 'IconButton2',
      width: 32,
      height: 32
    })

    expect(lint(graph, 'touch-target-size').map((message) => message.nodeId)).toEqual([
      iconButton.id
    ])
  })

  test('checks the WCAG AA minimum in Recommended and the AAA size in Strict', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const input = graph.createNode('FRAME', pageId, { name: 'Input', width: 320, height: 40 })
    const chip = graph.createNode('FRAME', pageId, { name: 'Chip', width: 60, height: 20 })
    const flagged = (preset: string) =>
      createLinter({ preset, rules: ['touch-target-size'] })
        .lintGraph(graph, [pageId])
        .messages.map((message) => message.nodeId)

    expect(flagged('recommended')).toEqual([chip.id])
    expect(flagged('strict')).toEqual([input.id, chip.id])
  })

  test('does not treat icons as touch targets on their own', () => {
    const graph = new SceneGraph()
    graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Icon', width: 16, height: 16 })
    expect(lint(graph, 'touch-target-size')).toEqual([])
  })
})

describe('instances', () => {
  test('are checked themselves but not through their sublayers', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', pageId, { name: 'Badge' })
    graph.createNode('TEXT', component.id, { name: 'Label', text: 'New', fontSize: 9 })
    const instance = graph.createInstance(component.id, pageId)
    if (!instance) throw new Error('Instance was not created')

    const messages = lint(graph, 'min-text-size')

    expect(messages).toHaveLength(1)
    expect(graph.getNode(messages[0]?.nodeId ?? '')?.parentId).toBe(component.id)
  })
})

function text(graph: SceneGraph, parentId: string, overrides: Partial<SceneNode>): SceneNode {
  return graph.createNode('TEXT', parentId, { width: 600, height: 20, ...overrides })
}

describe('tracked-caps-eyebrow', () => {
  function section(graph: SceneGraph, layoutMode: SceneNode['layoutMode'] = 'VERTICAL') {
    const page = graph.getPages()[0]
    return graph.createNode('FRAME', page.id, { width: 800, height: 400, layoutMode })
  }
  const eyebrow = {
    text: 'Our process',
    textCase: 'UPPER',
    fontSize: 12,
    letterSpacing: 1.8
  } satisfies Partial<SceneNode>

  test('reports tracked capitals right above a heading', () => {
    const graph = new SceneGraph()
    const frame = section(graph)
    const label = text(graph, frame.id, eyebrow)
    text(graph, frame.id, { text: 'Built for crews', fontSize: 48 })
    const messages = lint(graph, 'tracked-caps-eyebrow')
    expect(messages.map((message) => message.nodeId)).toEqual([label.id])
  })

  test('finds the heading after a wrapper that holds only the label', () => {
    const graph = new SceneGraph()
    const frame = section(graph)
    const wrapper = graph.createNode('FRAME', frame.id, { width: 200, height: 20 })
    text(graph, wrapper.id, { ...eyebrow, textCase: 'ORIGINAL', text: 'CASE STUDY' })
    const headline = graph.createNode('FRAME', frame.id, { width: 600, height: 60 })
    text(graph, headline.id, { text: 'A port that never sleeps', fontSize: 40 })
    expect(lint(graph, 'tracked-caps-eyebrow')).toHaveLength(1)
  })

  test('ignores untracked labels, body text after it and labels in a row', () => {
    const graph = new SceneGraph()
    const plain = section(graph)
    text(graph, plain.id, { ...eyebrow, letterSpacing: 0 })
    text(graph, plain.id, { text: 'Built for crews', fontSize: 48 })
    const body = section(graph)
    text(graph, body.id, eyebrow)
    text(graph, body.id, { text: 'We answer within a day.', fontSize: 16 })
    const row = section(graph, 'HORIZONTAL')
    text(graph, row.id, eyebrow)
    text(graph, row.id, { text: '48', fontSize: 48 })
    expect(lint(graph, 'tracked-caps-eyebrow')).toEqual([])
  })
})

describe('heading-tracking', () => {
  test('reports tight tracking with a fix at the floor', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    text(graph, page.id, { text: 'Freight', fontSize: 100, letterSpacing: -6, height: 100 })
    const [message] = lint(graph, 'heading-tracking')
    expect(message.suggestions).toEqual([{ kind: 'set', changes: { letterSpacing: -3 } }])
  })

  test('reports tight leading only on a heading that wraps', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    text(graph, page.id, { text: 'One line', fontSize: 80, lineHeight: 64, height: 64 })
    const wrapped = text(graph, page.id, {
      text: 'Two lines of display type',
      fontSize: 80,
      lineHeight: 64,
      height: 128
    })
    const messages = lint(graph, 'heading-tracking')
    expect(messages.map((message) => message.nodeId)).toEqual([wrapped.id])
    expect(messages[0].suggestions).toEqual([{ kind: 'set', changes: { lineHeight: 76 } }])
  })

  test('accepts body text and headings at the floor', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    text(graph, page.id, { text: 'Body', fontSize: 16, letterSpacing: -1 })
    text(graph, page.id, { text: 'Heading', fontSize: 64, letterSpacing: -1.92, height: 64 })
    expect(lint(graph, 'heading-tracking')).toEqual([])
  })
})

describe('broken-image', () => {
  test('reports an image whose source cannot load', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const relative = graph.createNode('FRAME', page.id, {
      width: 400,
      height: 300,
      pluginData: [{ pluginId: 'kalka-dom-css', key: 'image-source-url', value: 'hero.jpg' }]
    })
    const messages = lint(graph, 'broken-image')
    expect(messages.map((message) => message.nodeId)).toEqual([relative.id])
    expect(messages[0].data).toEqual({ source: 'hero.jpg' })
  })

  test('accepts image fills and remote sources', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    graph.createNode('FRAME', page.id, {
      width: 400,
      height: 300,
      pluginData: [
        { pluginId: 'kalka-dom-css', key: 'image-source-url', value: 'https://example.com/a.jpg' }
      ]
    })
    graph.createNode('FRAME', page.id, {
      width: 400,
      height: 300,
      fills: [
        {
          type: 'IMAGE',
          imageHash: 'abc',
          imageScaleMode: 'FILL',
          color: WHITE,
          opacity: 1,
          visible: true
        }
      ]
    })
    expect(lint(graph, 'broken-image')).toEqual([])
  })
})
