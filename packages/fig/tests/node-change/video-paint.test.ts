import { expect, test } from 'bun:test'

import { convertFills, fillToKiwiPaint } from '#fig/node-change/paint'
import { importVideoPlayback } from '#fig/node-change/video'

import type { NodeChange, Paint } from '@kalka/kiwi/fig/codec'
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

test("a layer's trimmed playback reads Figma's milliseconds as seconds", () => {
  const nc = {
    videoPlayback: { autoplay: true, showControls: true, startTimeMs: 1500, endTimeMs: 6000 }
  } as NodeChange
  expect(importVideoPlayback(nc).videoPlayback).toEqual({
    autoplay: true,
    loop: false,
    muted: false,
    showControls: true,
    startTime: 1.5,
    endTime: 6
  })
})

test('an end time of zero, or one before the start, plays to the end of the clip', () => {
  const zero = { videoPlayback: { startTimeMs: 0, endTimeMs: 0 } } as NodeChange
  expect(importVideoPlayback(zero).videoPlayback).toMatchObject({ startTime: 0, endTime: null })
  const backwards = { videoPlayback: { startTimeMs: 3000, endTimeMs: 2000 } } as NodeChange
  expect(importVideoPlayback(backwards).videoPlayback).toMatchObject({
    startTime: 3,
    endTime: null
  })
})
