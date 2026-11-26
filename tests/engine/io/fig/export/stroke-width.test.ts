import { describe, expect, test } from 'bun:test'

import { nodeChangeToProps } from '@kalka/fig/node-change'
import { SceneGraph, type StrokeBrush } from '@kalka/scene-graph'

import { sceneNodeToKiwi } from '#core/kiwi/fig/node-change/serialize'

const brush: StrokeBrush = {
  type: 'SCATTER',
  id: 'stars',
  gap: 2,
  wiggle: 0.5,
  sizeJitter: 0.25,
  angularJitter: 1,
  rotation: 15,
  reverse: false,
  seed: 9
}

function roundTrip(changes: Parameters<SceneGraph['createNode']>[2]) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode('VECTOR', page.id, changes)
  const [nc] = sceneNodeToKiwi(node, { sessionID: 1, localID: 1 }, 0, { value: 2 }, graph, [])
  return { nc, props: nodeChangeToProps(nc, []) }
}

describe('.fig variable width strokes and brushes', () => {
  test('a width profile is written as Figma’s variable width points and read back', () => {
    const strokeWidthProfile = [
      { position: 0, ascent: 0.1, descent: 0.1 },
      { position: 0.5, ascent: 0.75, descent: 0.25 },
      { position: 1, ascent: 0.1, descent: 0.1 }
    ]
    const { nc, props } = roundTrip({ strokeWidthProfile })
    expect(nc.variableWidthPoints).toEqual(strokeWidthProfile)
    expect(props.strokeWidthProfile).toEqual(strokeWidthProfile)
  })

  test('a plain stroke writes no width points', () => {
    const { nc, props } = roundTrip({})
    expect(nc.variableWidthPoints).toBeUndefined()
    expect(props.strokeWidthProfile).toEqual([])
    expect(props.strokeBrush).toBeNull()
  })

  test('a Kalka brush travels as plugin data', () => {
    const { props } = roundTrip({ strokeBrush: brush })
    expect(props.strokeBrush).toEqual(brush)
  })

  test('points Figma saved without some fields take its defaults', () => {
    const props = nodeChangeToProps(
      { type: 'VECTOR', variableWidthPoints: [{ position: 0.25 }, { ascent: 'x' }] },
      []
    )
    expect(props.strokeWidthProfile).toEqual([{ position: 0.25, ascent: 0.5, descent: 0.5 }])
  })
})
