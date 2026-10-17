import { describe, expect, mock, test } from 'bun:test'

import type { Fill, SceneNode } from '@kalka/scene-graph'

import { makeImageFillLocalMatrix } from '#core/canvas/fills'

import { asRenderer } from './helpers'

function createRenderer() {
  return asRenderer({
    ck: {
      Matrix: {
        identity: mock(() => ['identity']),
        invert: mock((matrix) => ['invert', matrix]),
        multiply: mock((...matrices) => ['multiply', ...matrices]),
        scaled: mock((x, y) => ['scaled', x, y]),
        translated: mock((x, y) => ['translated', x, y])
      }
    }
  })
}

const node = {
  width: 120,
  height: 80
} as SceneNode

describe('canvas image fills', () => {
  test.each([
    { width: 100, height: 100, scale: 0.8, x: 20, y: 0 },
    { width: 240, height: 80, scale: 0.5, x: 0, y: 20 },
    { width: 60, height: 40, scale: 2, x: 0, y: 0 }
  ])(
    'centers FIT images without stretching ($width × $height)',
    ({ width, height, scale, x, y }) => {
      const renderer = createRenderer()
      const fill = { type: 'IMAGE', imageScaleMode: 'FIT' } as Fill
      expect<unknown>(makeImageFillLocalMatrix(renderer, fill, node, width, height)).toEqual([
        'multiply',
        ['translated', x, y],
        ['scaled', scale, scale]
      ])
    }
  )

  test('keeps untransformed tile fills in image pixel space', () => {
    const renderer = createRenderer()
    const fill = { type: 'IMAGE', imageScaleMode: 'TILE' } as Fill

    const matrix = makeImageFillLocalMatrix(renderer, fill, node, 24, 16)

    expect<unknown>(matrix).toEqual(['identity'])
    expect(renderer.ck.Matrix.identity).toHaveBeenCalled()
    expect(renderer.ck.Matrix.scaled).not.toHaveBeenCalled()
  })

  test('tiles at the image size times its scale, ignoring the image transform as Figma does', () => {
    const renderer = createRenderer()
    const fill = {
      type: 'IMAGE',
      imageScaleMode: 'TILE',
      scale: 0.5,
      imageTransform: { m00: 3, m01: 0, m02: 0, m10: 0, m11: 3, m12: 0 }
    } as Fill

    const matrix = makeImageFillLocalMatrix(renderer, fill, node, 40, 40)

    expect<unknown>(matrix).toEqual(['scaled', 0.5, 0.5])
    expect(renderer.ck.Matrix.invert).not.toHaveBeenCalled()
  })
})
