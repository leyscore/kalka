import { expect, test } from 'bun:test'

import { convertFills, fillToKiwiPaint } from '#fig/node-change/paint'

import type { Paint } from '@kalka/kiwi/fig/codec'
import { drawsImage } from '@kalka/scene-graph'

const POSTER = 'aa'.repeat(20)
const CLIP = 'bb'.repeat(20)

const videoPaint = {
  type: 'VIDEO',
  opacity: 1,
  visible: true,
  image: { hash: POSTER },
  video: { hash: CLIP },
  imageScaleMode: 'FILL'
} as Paint

test('a video paint keeps its poster frame, which it draws, and its clip', () => {
  const [fill] = convertFills([videoPaint])
  expect(fill).toMatchObject({ type: 'VIDEO', imageHash: POSTER, videoHash: CLIP })
  expect(drawsImage(fill)).toBe(true)
})

test('a video paint is written back with its poster frame and its clip', () => {
  const [fill] = convertFills([videoPaint])
  const paint = fillToKiwiPaint(fill)
  expect(paint.type).toBe('VIDEO')
  expect(paint.image?.hash).toEqual(Uint8Array.from(Buffer.from(POSTER, 'hex')))
  expect(paint.video?.hash).toEqual(Uint8Array.from(Buffer.from(CLIP, 'hex')))
})

test('a video paint without a poster frame draws nothing', () => {
  expect(drawsImage({ type: 'VIDEO' })).toBe(false)
})
