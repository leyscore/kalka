import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import { fieldsFromStyle, layerCSS } from '@kalka/scene-graph/css-model'

function cellIn(layoutMode: 'GRID' | 'HORIZONTAL') {
  const graph = new SceneGraph()
  const grid = graph.createNode('FRAME', graph.getPages()[0].id, {
    width: 300,
    height: 200,
    layoutMode,
    gridTemplateColumns: [
      { sizing: 'FR', value: 1 },
      { sizing: 'FR', value: 1 }
    ]
  })
  const cell = graph.createNode('RECTANGLE', grid.id, {
    width: 40,
    height: 40,
    gridChildHorizontalAlign: 'CENTER',
    layoutAlignSelf: 'MAX'
  })
  return { grid, cell }
}

describe('alignment in a grid cell', () => {
  test('places the child across its cell with justify-self and down it with align-self', () => {
    const { grid, cell } = cellIn('GRID')
    expect(layerCSS(cell, grid)).toMatchObject({
      'justify-self': 'center',
      'align-self': 'flex-end'
    })
  })

  test('reads back from the CSS', () => {
    const { grid, cell } = cellIn('GRID')
    const changes = fieldsFromStyle({ ...cell, gridChildHorizontalAlign: 'AUTO' }, grid, {
      'justify-self': 'end'
    })
    expect(changes.gridChildHorizontalAlign).toBe('MAX')
  })

  test('writes nothing outside a grid', () => {
    const { grid, cell } = cellIn('HORIZONTAL')
    expect(layerCSS(cell, grid)['justify-self']).toBeUndefined()
  })
})
