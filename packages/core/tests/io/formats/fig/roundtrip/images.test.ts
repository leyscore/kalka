import { expect, test } from 'bun:test'

import { collectAllNodes } from '#core-tests/helpers/fig/traversal'

import { exportFigFile, initCodec, parseFigFile, SceneGraph } from '@kalka/core'
import { computeImageHash } from '@kalka/scene-graph'

test('images stored under other names are written once, under the SHA-1 of their bytes', async () => {
  await initCodec()
  const graph = new SceneGraph()
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3])
  // Two names for the same bytes, as documents saved before image names were SHA-1 can hold.
  const names = [
    '0123456789abcdef0123456789abcdef01234567',
    'fedcba9876543210fedcba9876543210fedcba98'
  ]
  for (const [index, name] of names.entries()) {
    graph.images.set(name, png)
    graph.createNode('RECTANGLE', graph.getPages()[0].id, {
      name: `Photo ${index}`,
      width: 40,
      height: 40,
      fills: [
        {
          type: 'IMAGE',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          imageHash: name,
          imageScaleMode: 'FILL'
        }
      ]
    })
  }

  const read = await parseFigFile((await exportFigFile(graph)).buffer as ArrayBuffer)
  const figmaName = computeImageHash(png)
  const photos = collectAllNodes(read).filter((node) => node.name.startsWith('Photo'))

  expect(photos.map((photo) => photo.fills[0]?.imageHash)).toEqual([figmaName, figmaName])
  expect([...read.images.keys()]).toEqual([figmaName])
})

test('a cropped image stays cropped', async () => {
  await initCodec()
  const graph = new SceneGraph()
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3])
  const name = computeImageHash(png)
  graph.images.set(name, png)
  const imageTransform = { m00: 0.5, m01: 0, m02: 0.25, m10: 0, m11: 1, m12: 0 }
  graph.createNode('RECTANGLE', graph.getPages()[0].id, {
    name: 'Photo',
    width: 40,
    height: 40,
    fills: [
      {
        type: 'IMAGE',
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true,
        imageHash: name,
        imageScaleMode: 'CROP',
        imageTransform
      }
    ]
  })

  const read = await parseFigFile((await exportFigFile(graph)).buffer as ArrayBuffer)
  const photo = collectAllNodes(read).find((node) => node.name === 'Photo')

  expect(photo?.fills[0]).toMatchObject({ imageScaleMode: 'CROP', imageTransform })
})
