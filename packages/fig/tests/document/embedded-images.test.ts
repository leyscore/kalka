import { expect, test } from 'bun:test'

import { materializeDocument } from '@kalka/fig'
import type { NodeChange } from '@kalka/kiwi/fig/codec'

const guid = (localID: number) => ({ sessionID: 1, localID })
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
const HASH = new Uint8Array(20).fill(0xab)

function imageFill(dataBlob: number): NodeChange['fillPaints'] {
  return [
    {
      type: 'IMAGE',
      opacity: 1,
      visible: true,
      image: { hash: HASH, dataBlob },
      imageScaleMode: 'FILL'
    }
  ]
}

// Documents saved before Figma kept images beside the message hold them in its blobs, with the
// paint naming both the image and the blob.
test('reads images a document keeps in its own blobs', () => {
  const changes: NodeChange[] = [
    { guid: guid(0), type: 'DOCUMENT' },
    { guid: guid(1), type: 'CANVAS', parentIndex: { guid: guid(0), position: '!' } },
    {
      guid: guid(2),
      type: 'SYMBOL',
      size: { x: 40, y: 40 },
      parentIndex: { guid: guid(1), position: '!' },
      fillPaints: imageFill(0)
    },
    {
      guid: guid(3),
      type: 'INSTANCE',
      parentIndex: { guid: guid(1), position: '"' },
      size: { x: 40, y: 40 },
      symbolData: { symbolID: guid(2) }
    }
  ]
  const { graph, sources } = materializeDocument(changes, [PNG])
  const name = 'ab'.repeat(20)
  expect(graph.images.get(name)).toEqual(PNG)
  const instance = graph.getNode(sources.get('1:3') ?? '')
  expect(instance?.fills[0]?.imageHash).toBe(name)
})

test('keeps an image the archive stores beside the message over a blob of the same name', () => {
  const stored = new Uint8Array([9, 9, 9])
  const name = 'ab'.repeat(20)
  const changes: NodeChange[] = [
    { guid: guid(0), type: 'DOCUMENT' },
    { guid: guid(1), type: 'CANVAS', parentIndex: { guid: guid(0), position: '!' } },
    {
      guid: guid(2),
      type: 'RECTANGLE',
      size: { x: 40, y: 40 },
      parentIndex: { guid: guid(1), position: '!' },
      fillPaints: imageFill(0)
    }
  ]
  const { graph } = materializeDocument(changes, [PNG], { images: new Map([[name, stored]]) })
  expect(graph.images.get(name)).toEqual(stored)
})
