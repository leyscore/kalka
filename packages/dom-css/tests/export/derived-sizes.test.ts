import { describe, expect, it } from 'bun:test'

import { sceneNodeToDesignDocument } from '@open-pencil/dom-css/export'
import { SceneGraph } from '@open-pencil/scene-graph'

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
