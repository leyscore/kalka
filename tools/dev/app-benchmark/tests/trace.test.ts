import { describe, expect, test } from 'bun:test'

import { workBreakdown } from '#bench/breakdown'
import { renderingCost, type TraceEvent } from '#bench/trace'

const RENDERER = 10
const GPU = 20
const MAIN = 1
const thread = (pid: number, tid: number, name: string): TraceEvent => ({
  name: 'thread_name',
  ph: 'M',
  pid,
  tid,
  args: { name }
})
const complete = (
  name: string,
  ts: number,
  dur: number,
  args: Record<string, unknown> = {}
): TraceEvent => ({
  name,
  ph: 'X',
  pid: RENDERER,
  tid: MAIN,
  ts,
  dur,
  args
})
const pointerMove = (ts: number) =>
  complete('EventDispatch', ts, 100, { data: { type: 'pointermove' } })
const layout = (ts: number, frame: string, dirtyObjects: number, totalObjects: number) =>
  complete('Layout', ts, 200, { beginData: { frame, dirtyObjects, totalObjects } })

describe('renderingCost', () => {
  test('splits layout work between the editor and the artboards', () => {
    const events = [
      pointerMove(0),
      pointerMove(16_000),
      layout(1_000, 'editor', 20, 1000),
      layout(2_000, 'artboard-a', 4, 150),
      layout(17_000, 'artboard-a', 150, 150),
      complete('UpdateLayoutTree', 500, 50, { elementCount: 3, beginData: { frame: 'artboard-a' } })
    ]
    const cost = renderingCost(events, ['pointermove'], 'editor')
    expect(cost.inputEvents).toBe(2)
    expect(cost.editor.layouts).toBe(1)
    expect(cost.artboards.layouts).toBe(2)
    expect(cost.artboards.layoutsPerInput).toBe(1)
    expect(cost.artboards.fullLayouts).toBe(1)
    expect(cost.artboards.layoutTotalObjectsMax).toBe(150)
    expect(cost.artboards.styleElementsP50).toBe(3)
    expect(cost.artboards.documents).toBe(1)
  })
})

describe('workBreakdown', () => {
  test('files main-thread self time by kind and other threads by process', () => {
    const events = [
      thread(RENDERER, MAIN, 'CrRendererMain'),
      thread(RENDERER, 2, 'Compositor'),
      thread(GPU, 3, 'CrGpuMain'),
      // A 10 ms script that forced a 4 ms layout: 6 ms of script, 4 ms of layout.
      complete('FunctionCall', 0, 10_000),
      complete('Layout', 2_000, 4_000),
      // A second display frame with a paint.
      complete('Paint', 17_000, 1_000),
      { ...complete('RunTask', 1_000, 3_000), tid: 2 },
      { ...complete('RunTask', 0, 2_000), pid: GPU, tid: 3 }
    ]
    const work = workBreakdown(events, { renderer: RENDERER, gpu: GPU }, 16, {
      from: 0,
      to: 20_000
    })
    expect(work.windows).toBe(2)
    expect(work.js.totalMs).toBe(6)
    expect(work.layout.totalMs).toBe(4)
    expect(work.paint.totalMs).toBe(1)
    expect(work.composite.totalMs).toBe(3)
    expect(work.gpu.totalMs).toBe(2)
    expect(work.paint.p95Ms).toBe(1)
  })

  test('files unfiled work under its filed ancestor, or as other at the top of a task', () => {
    const events = [
      thread(RENDERER, MAIN, 'CrRendererMain'),
      complete('Layout', 0, 4_000),
      complete('LayoutBlockChild', 1_000, 2_000),
      complete('HitTest', 5_000, 3_000)
    ]
    const work = workBreakdown(events, { renderer: RENDERER, gpu: null }, 16)
    expect(work.layout.totalMs).toBe(4)
    expect(work.other.totalMs).toBe(3)
    expect(work.topMainThread[0]).toEqual({ name: 'HitTest', kind: 'other', ms: 3 })
  })
})
