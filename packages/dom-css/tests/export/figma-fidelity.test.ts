import { describe, expect, it } from 'bun:test'

import { sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

function hugging() {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    layoutMode: 'VERTICAL',
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'FIXED',
    width: 240,
    height: 0,
    derivedLayout: { width: 240, height: 155 }
  })
  return { graph, frame }
}

describe('saved sizes of hugging frames', () => {
  it('fixes a hugging frame at the size its file saved when asked to', () => {
    const { graph, frame } = hugging()
    const [root] = sceneNodeToDesignDocument(graph, frame.id, { derivedSizes: true }).children
    expect(root?.type === 'element' && root.inlineStyle?.height).toBe('155px')
  })

  it('leaves the frame to its content in exports', () => {
    const { graph, frame } = hugging()
    const [root] = sceneNodeToDesignDocument(graph, frame.id).children
    expect(root?.type === 'element' && root.inlineStyle?.height).toBeUndefined()
  })
})

describe('truncated text', () => {
  function text(overrides: Partial<SceneNode>) {
    const graph = new SceneGraph()
    const node = graph.createNode('TEXT', graph.getPages()[0].id, {
      text: 'Supporting line text, lorem ipsum dolor',
      width: 200,
      height: 40,
      lineHeight: 20,
      textAutoResize: 'NONE',
      textTruncation: 'ENDING',
      ...overrides
    })
    const [root] = sceneNodeToDesignDocument(graph, node.id).children
    return root?.type === 'element' ? root.inlineStyle : undefined
  }

  it('ends one line with an ellipsis', () => {
    expect(text({ maxLines: 1 })).toMatchObject({
      overflow: 'hidden',
      'white-space': 'nowrap',
      'text-overflow': 'ellipsis'
    })
  })

  it('clamps to its line limit, or to the lines its fixed height holds', () => {
    expect(text({ maxLines: 3 })?.['-webkit-line-clamp']).toBe('3')
    expect(text({ maxLines: null })?.['-webkit-line-clamp']).toBe('2')
  })

  it('leaves text that does not truncate alone', () => {
    expect(text({ textTruncation: 'DISABLED' })?.overflow).toBeUndefined()
  })
})

describe('lines and wrapped rows', () => {
  it('draws a solid line as a centered band as thick as its stroke', () => {
    const graph = new SceneGraph()
    const line = graph.createNode('LINE', graph.getPages()[0].id, {
      width: 300,
      height: 0,
      strokes: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          weight: 2,
          align: 'CENTER'
        }
      ]
    })
    const [root] = sceneNodeToDesignDocument(graph, line.id).children
    const style = root?.type === 'element' ? root.inlineStyle : undefined
    expect(style?.['box-shadow']).toBe('0 0 0 1px #000000')
    expect(style?.outline).toBeUndefined()
  })

  it('spaces wrapped rows like items when the file leaves their spacing unset', () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'HORIZONTAL',
      layoutWrap: 'WRAP',
      itemSpacing: 20,
      counterAxisSpacing: Number.NaN
    })
    const [root] = sceneNodeToDesignDocument(graph, frame.id).children
    expect(root?.type === 'element' && root.inlineStyle?.gap).toBe('20px')
  })
})
