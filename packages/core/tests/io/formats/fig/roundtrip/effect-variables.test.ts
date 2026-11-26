import { describe, expect, setDefaultTimeout, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { exportFigFile, initCodec, parseFigFile, SceneGraph } from '@kalka/core'

setDefaultTimeout(60_000)

describe('effect variable roundtrip', () => {
  test('variables bound to a shadow survive export → re-import', async () => {
    await initCodec()

    const graph = new SceneGraph()
    const col = graph.createCollection('Elevation')
    const shadow = graph.createVariable('shadow', 'COLOR', col.id, { r: 0, g: 0, b: 0, a: 0.3 })
    const blur = graph.createVariable('blur', 'FLOAT', col.id, 16)
    const card = graph.createNode('RECTANGLE', graph.getPages()[0].id, {
      name: 'Card',
      width: 80,
      height: 40,
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          offset: { x: 0, y: 16 },
          radius: 16,
          spread: 0,
          visible: true
        }
      ]
    })
    graph.bindVariable(card.id, 'effects/0/color', shadow.id)
    graph.bindVariable(card.id, 'effects/0/radius', blur.id)
    graph.bindVariable(card.id, 'effects/0/offsetY', blur.id)

    const exported = await exportFigFile(graph)
    const reimported = await parseFigFile(exported.buffer as ArrayBuffer)
    const reopened = expectDefined(
      [...reimported.getAllNodes()].find((node) => node.name === 'Card'),
      'card'
    )
    const names = Object.fromEntries(
      Object.entries(reopened.boundVariables).map(([field, id]) => [
        field,
        reimported.variables.get(id)?.name
      ])
    )
    expect(names).toEqual({
      'effects/0/color': 'shadow',
      'effects/0/radius': 'blur',
      'effects/0/offsetY': 'blur'
    })
  })
})
