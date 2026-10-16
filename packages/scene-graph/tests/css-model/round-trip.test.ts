import { describe, expect, it } from 'bun:test'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { readLayerStyle, writeLayerStyle } from '@kalka/scene-graph/css-model'

import { SAMPLES, type NodeType, type Sample } from './samples'

/** Fields compare at the precision CSS keeps, so 0.2 read from a color is 0.2. */
function rounded(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, field: unknown) =>
      typeof field === 'number' ? Math.round(field * 1000) / 1000 : field
    )
  ) as unknown
}

function layer(graph: SceneGraph, type: NodeType, parentId: string, fields: Partial<SceneNode>) {
  return graph.createNode(type, parentId, { width: 100, height: 100, ...fields })
}

/** Writes a layer's CSS as the projection does, then reads it into a new layer of its kind. */
function roundTrip({ type = 'FRAME', fields, parent: parentFields }: Sample) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const parent = parentFields ? layer(graph, 'FRAME', page.id, parentFields) : undefined
  const node = layer(graph, type, parent?.id ?? page.id, fields)
  const style = writeLayerStyle(node, { parent, css: (_field, literal) => literal })

  const read = graph.createNode(type, parent?.id ?? page.id, {})
  readLayerStyle(read, style, { projected: { parent } })
  return { style, read }
}

describe('CSS mapping table', () => {
  for (const sample of SAMPLES) {
    it(`reads back ${sample.name}`, () => {
      const { style, read } = roundTrip(sample)
      for (const [field, value] of Object.entries(sample.fields)) {
        const actual = read[field as keyof SceneNode]
        expect({ field, value: rounded(actual), style }).toEqual({
          field,
          value: rounded(value),
          style
        })
      }
    })
  }
})
