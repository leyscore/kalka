import { describe, expect, test } from 'bun:test'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { cssWrite, layerCSS } from '@kalka/scene-graph/css-model'

function badgeIn(parentFields: Partial<SceneNode>, fields: Partial<SceneNode>) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const parent = graph.createNode('FRAME', page.id, { width: 300, height: 200, ...parentFields })
  const node = graph.createNode('RECTANGLE', parent.id, {
    x: 230,
    y: 10,
    width: 60,
    height: 20,
    ...fields
  })
  return { node, parent }
}

describe('absolute position in auto layout', () => {
  test('pins the layer with the insets of its constraints', () => {
    const { node, parent } = badgeIn(
      { layoutMode: 'HORIZONTAL', primaryAxisSizing: 'FIXED', counterAxisSizing: 'FIXED' },
      { layoutPositioning: 'ABSOLUTE', horizontalConstraint: 'MAX', verticalConstraint: 'MIN' }
    )
    const css = layerCSS(node, parent)
    expect(css).toMatchObject({ position: 'absolute', right: '10px', top: '10px' })
    expect(css.left).toBeUndefined()
  })

  test('keeps the start inset along an axis the frame hugs, where its size is not known yet', () => {
    const { node, parent } = badgeIn(
      { layoutMode: 'HORIZONTAL', primaryAxisSizing: 'HUG', counterAxisSizing: 'FIXED' },
      { layoutPositioning: 'ABSOLUTE', horizontalConstraint: 'MAX', verticalConstraint: 'MAX' }
    )
    const css = layerCSS(node, parent)
    expect(css).toMatchObject({ left: '230px', bottom: '170px', width: '60px' })
    expect(css.right).toBeUndefined()
  })

  test('a free layer keeps its constraints when its CSS is written', () => {
    const { node, parent } = badgeIn({}, { horizontalConstraint: 'MAX', verticalConstraint: 'MAX' })
    const changes = cssWrite(node, parent, { ...layerCSS(node, parent), opacity: '0.5' })
    expect(changes.horizontalConstraint).toBeUndefined()
    expect(changes.verticalConstraint).toBeUndefined()
  })
})
