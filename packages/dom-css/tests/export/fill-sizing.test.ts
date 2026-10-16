import { describe, expect, it } from 'bun:test'

import { sceneNodeToDesignDocument, type DesignNode } from '@kalka/dom-css/export'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

function styleOf(nodes: DesignNode[], name: string): Record<string, string> | undefined {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    if (node.sourceSceneNode?.name === name) return node.inlineStyle
    const found = styleOf(node.children, name)
    if (found) return found
  }
  return undefined
}

function exportParent(layout: Partial<SceneNode>, children: Partial<SceneNode>[]) {
  const graph = new SceneGraph()
  const parent = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Parent',
    width: 300,
    height: 200,
    ...layout
  })
  for (const child of children) graph.createNode(child.type ?? 'FRAME', parent.id, child)
  return sceneNodeToDesignDocument(graph, parent.id).children
}

describe('fill sizing in DOM/CSS export', () => {
  it('leaves out the size a flex child stretches across, so align-self can stretch it', () => {
    const doc = exportParent({ layoutMode: 'HORIZONTAL' }, [
      { name: 'Tall', width: 40, height: 50, layoutAlignSelf: 'STRETCH' },
      { name: 'Wide', width: 40, height: 50, layoutGrow: 1 }
    ])

    expect(styleOf(doc, 'Tall')).toMatchObject({
      width: '40px',
      'align-self': 'stretch',
      'flex-shrink': '0'
    })
    expect(styleOf(doc, 'Tall')?.height).toBeUndefined()
    // Along the row, fill shares the free space from a zero basis, as auto layout does.
    expect(styleOf(doc, 'Wide')).toMatchObject({
      height: '50px',
      'flex-grow': '1',
      'flex-basis': '0px',
      'min-width': '0px'
    })
    expect(styleOf(doc, 'Wide')?.width).toBeUndefined()
  })

  it('leaves out the size of each axis a grid child fills', () => {
    const doc = exportParent(
      {
        layoutMode: 'GRID',
        gridTemplateColumns: [
          { sizing: 'FR', value: 1 },
          { sizing: 'FR', value: 1 }
        ]
      },
      [
        { name: 'Wide', width: 40, height: 50, layoutGrow: 1 },
        { name: 'Tall', width: 40, height: 50, layoutAlignSelf: 'STRETCH' }
      ]
    )

    expect(styleOf(doc, 'Wide')?.width).toBeUndefined()
    expect(styleOf(doc, 'Wide')?.height).toBe('50px')
    expect(styleOf(doc, 'Tall')?.width).toBe('40px')
    expect(styleOf(doc, 'Tall')?.height).toBeUndefined()
  })
})

describe('fill sizing of text', () => {
  it('stretches text that fills across its auto layout parent', () => {
    const doc = exportParent({ layoutMode: 'VERTICAL' }, [
      {
        name: 'Body',
        type: 'TEXT',
        width: 40,
        height: 18,
        textAutoResize: 'HEIGHT',
        layoutAlignSelf: 'STRETCH'
      }
    ])
    expect(styleOf(doc, 'Body')).toMatchObject({ 'align-self': 'stretch' })
    expect(styleOf(doc, 'Body')?.width).toBeUndefined()
  })
})
