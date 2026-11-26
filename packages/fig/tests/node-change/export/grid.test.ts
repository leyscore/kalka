import { beforeAll, describe, expect, test } from 'bun:test'

import { applyGridAnchors } from '#fig/node-change/grid'
import { nodeChangeToProps, sceneNodeToKiwi } from '#fig/node-change/index'

import { getCompiledSchema, initCodec, type NodeChange } from '@kalka/kiwi/fig/codec'
import { SceneGraph } from '@kalka/scene-graph'

function gridDocument() {
  const graph = new SceneGraph()
  const grid = graph.createNode('FRAME', graph.getPages()[0].id, {
    width: 400,
    height: 300,
    layoutMode: 'GRID',
    paddingTop: 16,
    paddingLeft: 16,
    gridTemplateColumns: [
      { sizing: 'FIXED', value: 120 },
      { sizing: 'FR', value: 2 },
      { sizing: 'AUTO', value: 0 }
    ],
    gridTemplateRows: [
      { sizing: 'FR', value: 1 },
      { sizing: 'FR', value: 1 }
    ],
    gridColumnGap: 12,
    gridRowGap: 8
  })
  const child = graph.createNode('RECTANGLE', grid.id, {
    width: 40,
    height: 40,
    gridPosition: { column: 2, row: 2, columnSpan: 2, rowSpan: 1 },
    gridChildHorizontalAlign: 'CENTER',
    layoutAlignSelf: 'MAX'
  })
  return { graph, grid, child }
}

/** Encodes and decodes the records so the schema checks every grid field. */
function roundTrip(changes: NodeChange[]): NodeChange[] {
  const codec = getCompiledSchema()
  const encoded = codec.encodeMessage({ type: 'NODE_CHANGES', nodeChanges: changes })
  return (codec.decodeMessage(encoded) as { nodeChanges: NodeChange[] }).nodeChanges
}

describe('Figma grid layout export', () => {
  beforeAll(() => initCodec())

  test('writes a grid frame and its child as Figma saves them, and reads them back', () => {
    const { graph, grid } = gridDocument()
    const changes = sceneNodeToKiwi(grid, { sessionID: 0, localID: 1 }, 0, { value: 2 }, graph, [])
    const [gridChange, childChange] = roundTrip(changes)

    expect(gridChange.stackMode).toBe('GRID')
    expect(childChange.gridColumnSpan).toBe(2)

    const imported = new SceneGraph()
    const { nodeType: _frame, ...gridProps } = nodeChangeToProps(gridChange, [])
    const importedGrid = imported.createNode('FRAME', imported.getPages()[0].id, gridProps)
    const { nodeType: _rect, ...childProps } = nodeChangeToProps(childChange, [])
    const importedChild = imported.createNode('RECTANGLE', importedGrid.id, childProps)
    applyGridAnchors(imported, [importedGrid])

    expect(imported.getNode(importedGrid.id)).toMatchObject({
      layoutMode: 'GRID',
      paddingTop: 16,
      gridTemplateColumns: [
        { sizing: 'FIXED', value: 120 },
        { sizing: 'FR', value: 2 },
        { sizing: 'AUTO', value: 0 }
      ],
      gridTemplateRows: [
        { sizing: 'FR', value: 1 },
        { sizing: 'FR', value: 1 }
      ],
      gridColumnGap: 12,
      gridRowGap: 8
    })
    expect(imported.getNode(importedChild.id)).toMatchObject({
      gridPosition: { column: 2, row: 2, columnSpan: 2, rowSpan: 1 },
      gridChildHorizontalAlign: 'CENTER',
      layoutAlignSelf: 'MAX'
    })
  })

  test('keeps an imported grid track ids while the tracks are unchanged', () => {
    const { graph, grid, child } = gridDocument()
    const track = (localID: number, position: string) => ({
      id: { sessionID: 3, localID },
      position
    })
    grid.source.fig.rawNodeFields.gridColumns = {
      entries: [track(30, ' '), track(31, '!'), track(32, '"')]
    }
    const changes = sceneNodeToKiwi(grid, { sessionID: 0, localID: 1 }, 0, { value: 2 }, graph, [])
    const ids = (changes[0].gridColumns as { entries: { id: unknown }[] }).entries.map(
      (entry) => entry.id
    )
    expect(ids).toEqual([
      { sessionID: 3, localID: 30 },
      { sessionID: 3, localID: 31 },
      { sessionID: 3, localID: 32 }
    ])
    expect(changes.find((change) => change.name === child.name)?.gridColumnAnchor).toEqual({
      sessionID: 3,
      localID: 31
    })
  })
})
