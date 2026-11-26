import { describe, expect, test } from 'bun:test'

import { applyGridAnchors } from '#fig/node-change/grid'
import { nodeChangeToProps } from '#fig/node-change/index'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { SceneGraph } from '@kalka/scene-graph'

const guid = (localID: number) => ({ sessionID: 1, localID })
const sizing = (type: string, value: number) => ({
  minSizing: { type, value },
  maxSizing: { type, value }
})

/** A two-column, two-row grid as Figma saves it: tracks out of order, ids at positions. */
const GRID: NodeChange = {
  type: 'FRAME',
  stackMode: 'GRID',
  gridColumnGap: 12,
  gridRowGap: 8,
  gridColumns: {
    entries: [
      { id: guid(11), position: '!' },
      { id: guid(10), position: ' ' }
    ]
  },
  gridRows: {
    entries: [
      { id: guid(20), position: ' ' },
      { id: guid(21), position: '!' }
    ]
  },
  gridColumnsSizing: {
    entries: [
      { id: guid(10), trackSize: sizing('FIXED', 120) },
      { id: guid(11), trackSize: sizing('FLEX', 2) }
    ]
  },
  gridRowsSizing: { entries: [{ id: guid(20), trackSize: sizing('HUG', 0) }] }
}

describe('@kalka/fig grid layout', () => {
  test('reads tracks in their positions order, with their sizes and the gaps', () => {
    const props = nodeChangeToProps(GRID, [])
    expect(props.layoutMode).toBe('GRID')
    expect(props.gridTemplateColumns).toEqual([
      { sizing: 'FIXED', value: 120 },
      { sizing: 'FR', value: 2 }
    ])
    expect(props.gridTemplateRows).toEqual([
      { sizing: 'AUTO', value: 0 },
      { sizing: 'FR', value: 1 }
    ])
    expect([props.gridColumnGap, props.gridRowGap]).toEqual([12, 8])
  })

  test('places children in the cells they are anchored to, aligned in them', () => {
    const graph = new SceneGraph()
    const { nodeType: _frame, ...frameProps } = nodeChangeToProps(GRID, [])
    const grid = graph.createNode('FRAME', graph.getPages()[0].id, frameProps)
    const { nodeType: _rect, ...childProps } = nodeChangeToProps(
      {
        type: 'RECTANGLE',
        gridColumnAnchor: guid(11),
        gridRowAnchor: guid(21),
        gridColumnSpan: 1,
        gridRowSpan: 1,
        gridChildHorizontalAlign: 'CENTER',
        gridChildVerticalAlign: 'MAX'
      } as NodeChange,
      []
    )
    const child = graph.createNode('RECTANGLE', grid.id, childProps)
    applyGridAnchors(graph, [grid])
    expect(graph.getNode(child.id)).toMatchObject({
      gridPosition: { column: 2, row: 2, columnSpan: 1, rowSpan: 1 },
      gridChildHorizontalAlign: 'CENTER',
      layoutAlignSelf: 'MAX'
    })
  })
})
