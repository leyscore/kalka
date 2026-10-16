import { describe, expect, test } from 'bun:test'

import { sceneNodeToDesignDocument } from '#dom-css/export/index'
import {
  applyLayerStyle,
  applyLayerText,
  parseStyleDeclarations,
  type DesignElement
} from '#dom-css/import/layers'

import { createDefaultNode, SceneGraph, type SceneNode, type ShaderLayer } from '@kalka/scene-graph'

function element(tagName = 'div', attrs: Record<string, string> = {}): DesignElement {
  return { type: 'element', tagName, attrs, children: [] }
}

/** A layer as reading back the projection of `node` gives it. */
function readBack(graph: SceneGraph, node: SceneNode): SceneNode {
  const [projected] = sceneNodeToDesignDocument(graph, node.id, {
    includeSourceIds: false
  }).children
  if (projected?.type !== 'element') throw new Error('Nothing projected')
  const read = createDefaultNode(() => node.id, node.type)
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  applyLayerStyle(graph, read, projected, projected.inlineStyle ?? {}, { parent })
  if (node.type === 'TEXT') applyLayerText(read, projected)
  return read
}

describe('parseStyleDeclarations', () => {
  test('splits where CSS does', () => {
    expect(
      parseStyleDeclarations(
        'background-image: url("a;b.png"); COLOR: red !important; --Brand: #fff; broken'
      )
    ).toEqual({ 'background-image': 'url("a;b.png")', color: 'red', '--Brand': '#fff' })
  })
})

describe('applyLayerStyle', () => {
  test('reads back what the projection writes', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const frame = graph.createNode('FRAME', page.id, {
      width: 300,
      height: 200,
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      itemSpacing: 8,
      strokes: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 0.5,
          weight: 2,
          visible: true,
          align: 'CENTER'
        }
      ],
      strokeAlign: 'CENTER',
      strokeWeight: 2,
      effects: [
        {
          type: 'LAYER_BLUR',
          color: { r: 0, g: 0, b: 0, a: 0 },
          offset: { x: 0, y: 0 },
          radius: 4,
          spread: 0,
          visible: true
        }
      ],
      blendMode: 'SCREEN',
      rotation: 30
    })
    const child = graph.createNode('RECTANGLE', frame.id, {
      height: 20,
      layoutGrow: 1,
      layoutAlignSelf: 'STRETCH'
    })
    const read = readBack(graph, frame)
    expect(read.primaryAxisSizing).toBe('HUG')
    expect(read.strokes).toEqual(frame.strokes)
    expect(read.strokeAlign).toBe('CENTER')
    expect(read.strokesIncludedInLayout).toBe(false)
    expect(read.effects).toEqual(frame.effects)
    expect(read.blendMode).toBe('SCREEN')
    expect(read.rotation).toBe(30)

    const readChild = readBack(graph, child)
    expect(readChild.layoutGrow).toBe(1)
    expect(readChild.layoutAlignSelf).toBe('STRETCH')
    expect(readChild.minWidth).toBeNull()
  })

  test('a free position is not absolute positioning', () => {
    const graph = new SceneGraph()
    const board = graph.createNode('FRAME', graph.getPages()[0].id, { width: 400, height: 300 })
    const placed = graph.createNode('RECTANGLE', board.id, { x: 30, y: 40 })
    const read = readBack(graph, placed)
    expect({ x: read.x, y: read.y, positioning: read.layoutPositioning }).toEqual({
      x: 30,
      y: 40,
      positioning: 'AUTO'
    })
  })

  test('reads text runs and sizing', () => {
    const graph = new SceneGraph()
    const text = graph.createNode('TEXT', graph.getPages()[0].id, {
      text: 'Plain bold',
      textAutoResize: 'WIDTH_AND_HEIGHT',
      textAlignHorizontal: 'JUSTIFIED',
      styleRuns: [
        {
          start: 6,
          length: 4,
          style: {
            fontWeight: 700,
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
          }
        }
      ]
    })
    const read = readBack(graph, text)
    expect(read.text).toBe('Plain bold')
    expect(read.styleRuns).toEqual(text.styleRuns)
    expect(read.textAutoResize).toBe('WIDTH_AND_HEIGHT')
    expect(read.textAlignHorizontal).toBe('JUSTIFIED')
  })

  test('takes images from a resolver and shaders from their attribute', () => {
    const graph = new SceneGraph()
    const node = createDefaultNode(() => 'image', 'RECTANGLE')
    applyLayerStyle(
      graph,
      node,
      element('img', { src: '../assets/images/abc.png' }),
      {},
      {
        parent: undefined,
        resolveImage: (source) => (source.endsWith('abc.png') ? 'abc' : null)
      }
    )
    expect(node.fills[0]?.imageHash).toBe('abc')

    const shaded = createDefaultNode(() => 'shader', 'FRAME')
    const shader: ShaderLayer = { preset: 'warp', colors: [], speed: 0, params: {} }
    applyLayerStyle(
      graph,
      shaded,
      element('div', { 'data-kalka-shader': JSON.stringify(shader) }),
      {},
      {
        parent: undefined
      }
    )
    expect(shaded.shader).toEqual(shader)
  })
})
