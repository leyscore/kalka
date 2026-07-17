import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'

import {
  fractionalPosition,
  mapToFigmaType,
  sceneNodeToKiwi,
  type FigNodeChangeExportRuntime
} from '../src/node-change'

describe('@open-pencil/fig SceneGraph export policy', () => {
  test('maps node types and sibling positions deterministically', () => {
    expect(mapToFigmaType('COMPONENT')).toBe('SYMBOL')
    expect([0, 93, 94, 188].map(fractionalPosition)).toEqual(['!', '~', '~!', '~~!'])
  })

  test('injects runtime glyph outlines into derived text data', () => {
    const graph = new SceneGraph()
    const text = graph.createNode('TEXT', graph.getPages()[0].id, {
      text: 'A',
      width: 20,
      height: 20,
      fontSize: 16
    })
    const blobs: Uint8Array[] = []
    const runtime: FigNodeChangeExportRuntime = {
      getGlyphOutlineMetrics: () => [
        {
          commands: [{ type: 'M', x: 0, y: 0 }, { type: 'L', x: 8, y: 16 }, { type: 'Z' }],
          x: 0,
          advance: 10
        }
      ]
    }

    const [change] = sceneNodeToKiwi(
      text,
      { sessionID: 1, localID: 1 },
      0,
      { value: 2 },
      graph,
      blobs,
      undefined,
      new Map([['Inter|Regular', new Uint8Array([1, 2, 3])]]),
      undefined,
      new Map(),
      undefined,
      undefined,
      runtime
    )

    expect(change.derivedTextData?.glyphs).toHaveLength(1)
    expect(blobs).toHaveLength(1)
  })
})
