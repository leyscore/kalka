import type { JSHandle, Page } from '@playwright/test'

import { median, percentile, round } from './stats'

/** What the page records while a gesture plays: frame times, long tasks and input latency. */
export interface FrameRecording {
  /** `performance.now()` at each `requestAnimationFrame` callback. */
  frames: number[]
  longTasks: { start: number; duration: number }[]
  /** Time from an input event to the first animation frame callback after it, in ms. */
  inputToFrame: number[]
  /** Input events seen, by type. */
  inputs: Record<string, number>
}

interface PageRecorder {
  stop(): FrameRecording
}

const WATCHED_INPUTS = ['pointermove', 'wheel', 'keydown'] as const

/**
 * Starts recording in the page. Listens on the editor's document and on every artboard iframe's,
 * since typing in a text layer happens inside its artboard.
 */
export function startFrameRecorder(page: Page): Promise<JSHandle<PageRecorder>> {
  return page.evaluateHandle((inputs) => {
    const recording: FrameRecording = { frames: [], longTasks: [], inputToFrame: [], inputs: {} }
    let running = true
    let pending: number[] = []
    const tick = () => {
      const now = performance.now()
      recording.frames.push(now)
      for (const at of pending) recording.inputToFrame.push(now - at)
      pending = []
      if (running) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        recording.longTasks.push({ start: entry.startTime, duration: entry.duration })
    })
    observer.observe({ type: 'longtask' })
    const targets: EventTarget[] = [
      window,
      ...[...document.querySelectorAll('iframe')].flatMap((frame) =>
        frame.contentWindow ? [frame.contentWindow] : []
      )
    ]
    const listener = (event: Event) => {
      recording.inputs[event.type] = (recording.inputs[event.type] ?? 0) + 1
      // An iframe's event times count from its own time origin.
      const view = (event.target as Node | null)?.ownerDocument?.defaultView ?? window
      pending.push(event.timeStamp + view.performance.timeOrigin - performance.timeOrigin)
    }
    for (const target of targets)
      for (const type of inputs) target.addEventListener(type, listener, { capture: true })
    return {
      stop() {
        running = false
        observer.disconnect()
        for (const target of targets)
          for (const type of inputs) target.removeEventListener(type, listener, { capture: true })
        return recording
      }
    }
  }, WATCHED_INPUTS)
}

export async function stopFrameRecorder(handle: JSHandle<PageRecorder>): Promise<FrameRecording> {
  try {
    return await handle.evaluate((recorder) => recorder.stop())
  } finally {
    await handle.dispose()
  }
}

export interface FrameSummary {
  frames: number
  /** The display's frame interval, read from idle frames before the gesture. */
  refreshMs: number
  p50Ms: number | null
  p95Ms: number | null
  p99Ms: number | null
  maxMs: number | null
  /** Frames the display showed without a new one from the page. */
  droppedFrames: number
  /** Share of display frames the page missed. */
  droppedRatio: number | null
  /** Intervals longer than 50 ms: a visible hitch. */
  hitches: number
  longTasks: number
  longTaskTotalMs: number
  longTaskMaxMs: number
  inputToFrameP50Ms: number | null
  inputToFrameP95Ms: number | null
  inputs: Record<string, number>
}

/** Frame pacing for a recording, against a display interval of `refreshMs`. */
export function summarizeFrames(recording: FrameRecording, refreshMs: number): FrameSummary {
  const intervals = recording.frames.slice(1).map((time, index) => time - recording.frames[index])
  const dropped = intervals.reduce(
    (total, interval) => total + Math.max(0, Math.round(interval / refreshMs) - 1),
    0
  )
  const displayFrames = intervals.reduce(
    (total, interval) => total + Math.max(1, Math.round(interval / refreshMs)),
    0
  )
  const durations = recording.longTasks.map((task) => task.duration)
  return {
    frames: recording.frames.length,
    refreshMs: round(refreshMs, 2) ?? refreshMs,
    p50Ms: round(median(intervals)),
    p95Ms: round(percentile(intervals, 95)),
    p99Ms: round(percentile(intervals, 99)),
    maxMs: round(intervals.length ? Math.max(...intervals) : null),
    droppedFrames: dropped,
    droppedRatio: displayFrames ? round(dropped / displayFrames, 3) : null,
    hitches: intervals.filter((interval) => interval > 50).length,
    longTasks: durations.length,
    longTaskTotalMs: round(durations.reduce((total, value) => total + value, 0)) ?? 0,
    longTaskMaxMs: round(durations.length ? Math.max(...durations) : 0) ?? 0,
    inputToFrameP50Ms: round(median(recording.inputToFrame)),
    inputToFrameP95Ms: round(percentile(recording.inputToFrame, 95)),
    inputs: recording.inputs
  }
}

/** The display's frame interval: the median interval of frames while nothing happens. */
export async function measureRefreshInterval(page: Page, frames = 60): Promise<number> {
  const times = await page.evaluate(
    (count) =>
      new Promise<number[]>((resolve) => {
        const collected: number[] = []
        const tick = (time: number) => {
          collected.push(time)
          if (collected.length > count) resolve(collected)
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
    frames
  )
  const intervals = times.slice(1).map((time, index) => time - times[index])
  return median(intervals) ?? 1000 / 60
}
