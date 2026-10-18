import * as v from 'valibot'

import { percentile, round } from './stats'
import type { TraceEvent } from './trace'

export const WORK_KINDS = [
  'js',
  'style',
  'layout',
  'paint',
  'composite',
  'other',
  'gpu',
  'worker'
] as const
export type WorkKind = (typeof WORK_KINDS)[number]

/** Main-thread trace events by the kind of work devtools files them under. */
const KIND_BY_NAME: Record<string, WorkKind> = {
  FunctionCall: 'js',
  EvaluateScript: 'js',
  'v8.compile': 'js',
  'v8.compileModule': 'js',
  'v8.evaluateModule': 'js',
  'v8.produceCache': 'js',
  'V8.CompileCode': 'js',
  'v8.callFunction': 'js',
  'v8.run': 'js',
  TimerFire: 'js',
  FireAnimationFrame: 'js',
  FireIdleCallback: 'js',
  EventDispatch: 'js',
  RunMicrotasks: 'js',
  // Promise reactions run here without a FunctionCall of their own: Vue's scheduler, awaits.
  BlinkScheduler_PerformMicrotaskCheckpoint: 'js',
  MajorGC: 'js',
  MinorGC: 'js',
  'V8.GCScavenger': 'js',
  'V8.GCFinalizeMC': 'js',
  'wasm.SyncCompile': 'js',
  'wasm.AsyncCompile': 'js',
  'v8.wasm.compiledModule': 'js',
  'v8.wasm.streamFromResponseCallback': 'js',
  ParseHTML: 'js',
  UpdateLayoutTree: 'style',
  RecalculateStyles: 'style',
  ParseAuthorStyleSheet: 'style',
  Layout: 'layout',
  PrePaint: 'paint',
  Paint: 'paint',
  PaintImage: 'paint',
  'Decode Image': 'paint',
  ImageDecodeTask: 'paint',
  Layerize: 'composite',
  UpdateLayer: 'composite',
  UpdateLayerTree: 'composite',
  CompositeLayers: 'composite',
  Commit: 'composite'
}

/** The processes a breakdown reads: the editor's renderer and the GPU process. */
export interface TraceProcesses {
  renderer: number
  gpu: number | null
}

interface Interval {
  start: number
  end: number
  kind: WorkKind
  name: string
  selfMs: number
}

const ThreadName = v.looseObject({ name: v.string() })

function threadNames(events: readonly TraceEvent[]): Map<string, string> {
  const names = new Map<string, string>()
  for (const event of events) {
    if (event.ph !== 'M' || event.name !== 'thread_name') continue
    const parsed = v.safeParse(ThreadName, event.args ?? {})
    if (parsed.success) names.set(`${event.pid}:${event.tid}`, parsed.output.name)
  }
  return names
}

/**
 * Self time of each complete event on one thread, filed by kind: an event's own time excludes
 * the events nested in it, so a forced layout inside a script counts as layout, not script. An
 * event devtools does not file takes its closest filed ancestor's kind, and is `other` at the
 * top of a task: scheduling, hit testing, lifecycle steps the trace does not name.
 */
function selfTimes(events: readonly TraceEvent[]): Interval[] {
  const sorted = events
    .filter((event) => event.ph === 'X' && event.ts !== undefined && event.dur !== undefined)
    .map((event) => ({
      start: event.ts ?? 0,
      end: (event.ts ?? 0) + (event.dur ?? 0),
      own: KIND_BY_NAME[event.name],
      name: event.name,
      selfMs: (event.dur ?? 0) / 1000
    }))
    .sort((a, b) => a.start - b.start || b.end - a.end)
  const stack: Interval[] = []
  const intervals: Interval[] = []
  for (const event of sorted) {
    while (stack.length && (stack.at(-1)?.end ?? 0) <= event.start) stack.pop()
    const parent = stack.at(-1)
    if (parent) parent.selfMs -= (event.end - event.start) / 1000
    const interval: Interval = {
      start: event.start,
      end: event.end,
      kind: event.own ?? parent?.kind ?? 'other',
      name: event.name,
      selfMs: event.selfMs
    }
    intervals.push(interval)
    stack.push(interval)
  }
  return intervals
}

/** Busy time of a thread: its outermost events. */
function busyIntervals(events: readonly TraceEvent[], kind: WorkKind): Interval[] {
  const sorted = events
    .filter((event) => event.ph === 'X' && event.ts !== undefined && event.dur !== undefined)
    .map((event) => ({ start: event.ts ?? 0, end: (event.ts ?? 0) + (event.dur ?? 0) }))
    .sort((a, b) => a.start - b.start)
  const outer: Interval[] = []
  let reach = -Infinity
  for (const interval of sorted) {
    if (interval.start < reach) continue
    reach = interval.end
    outer.push({ ...interval, kind, name: '', selfMs: (interval.end - interval.start) / 1000 })
  }
  return outer
}

export interface KindStats {
  totalMs: number
  /** Per display frame of the gesture. */
  p50Ms: number | null
  p95Ms: number | null
}

export type WorkBreakdown = Record<WorkKind, KindStats> & {
  windows: number
  /** Trace events with the most main-thread self time, for what `other` and JS hold. */
  topMainThread: { name: string; kind: WorkKind; ms: number }[]
}

/** The threads a breakdown reads, as intervals: the editor's main thread apart from the rest. */
function threadIntervals(events: readonly TraceEvent[], processes: TraceProcesses) {
  const names = threadNames(events)
  const byThread = new Map<string, TraceEvent[]>()
  for (const event of events) {
    if (event.pid !== processes.renderer && event.pid !== processes.gpu) continue
    const key = `${event.pid}:${event.tid}`
    const list = byThread.get(key)
    if (list) list.push(event)
    else byThread.set(key, [event])
  }
  const others: Interval[] = []
  const main: Interval[] = []
  for (const [key, threadEvents] of byThread) {
    const name = names.get(key) ?? ''
    const kind = threadKind(name, Number(key.split(':')[0]) === processes.gpu)
    if (kind === 'main') main.push(...selfTimes(threadEvents))
    else if (kind) others.push(...busyIntervals(threadEvents, kind))
  }
  return { main, others }
}

/** What a thread's busy time counts as; `main` is split by event, null is left out. */
function threadKind(name: string, inGpuProcess: boolean): WorkKind | 'main' | null {
  if (inGpuProcess) return /CrGpuMain|VizCompositor/.test(name) ? 'gpu' : null
  if (name === 'CrRendererMain') return 'main'
  if (name === 'Compositor') return 'composite'
  return name.startsWith('DedicatedWorker') ? 'worker' : null
}

/** Main-thread events with the most self time between `from` and `to`. */
function topSelfTime(main: readonly Interval[], from: number, to: number, count: number) {
  const byName = new Map<string, { name: string; kind: WorkKind; ms: number }>()
  for (const interval of main) {
    if (interval.start < from || interval.start > to || interval.selfMs <= 0) continue
    const key = `${interval.kind}:${interval.name}`
    const entry = byName.get(key) ?? { name: interval.name, kind: interval.kind, ms: 0 }
    entry.ms += interval.selfMs
    byName.set(key, entry)
  }
  return [...byName.values()]
    .map((entry) => ({ ...entry, ms: round(entry.ms) ?? 0 }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, count)
}

/**
 * Work by kind in each display frame between `from` and `to` (trace microseconds), or over the
 * whole trace when they are omitted. The editor's main thread is split by kind; its compositor
 * thread counts as composite, the GPU process's threads as GPU, and dedicated workers (where a
 * `.fig` parses) as worker.
 */
export function workBreakdown(
  events: readonly TraceEvent[],
  processes: TraceProcesses,
  refreshMs: number,
  range?: { from: number; to: number }
): WorkBreakdown {
  const { main, others } = threadIntervals(events, processes)
  const all = [...others, ...main]
  const from = range?.from ?? Math.min(...all.map((interval) => interval.start))
  const to = range?.to ?? Math.max(...all.map((interval) => interval.end))
  const windowUs = refreshMs * 1000
  const windows = Math.max(1, Math.ceil((to - from) / windowUs))
  const perWindow = Object.fromEntries(
    WORK_KINDS.map((kind) => [kind, Array.from({ length: windows }, () => 0)])
  )
  for (const interval of all) {
    if (interval.start < from || interval.start > to) continue
    const index = Math.min(windows - 1, Math.floor((interval.start - from) / windowUs))
    perWindow[interval.kind][index] += Math.max(0, interval.selfMs)
  }
  const stats = (kind: WorkKind): KindStats => {
    const values = perWindow[kind]
    return {
      totalMs: round(values.reduce((total, value) => total + value, 0)) ?? 0,
      p50Ms: round(percentile(values, 50), 2),
      p95Ms: round(percentile(values, 95), 2)
    }
  }
  return {
    js: stats('js'),
    style: stats('style'),
    layout: stats('layout'),
    paint: stats('paint'),
    composite: stats('composite'),
    other: stats('other'),
    gpu: stats('gpu'),
    worker: stats('worker'),
    windows,
    topMainThread: topSelfTime(main, from, to, 8)
  }
}

/** Trace time of the first and last input event of `types` on the editor's renderer. */
export function inputRange(
  events: readonly TraceEvent[],
  renderer: number,
  types: readonly string[]
): { from: number; to: number } | undefined {
  const times = events.flatMap((event) => {
    if (event.pid !== renderer || event.name !== 'EventDispatch' || event.ts === undefined)
      return []
    const data = event.args?.data
    const type = typeof data === 'object' && data && 'type' in data ? data.type : undefined
    return typeof type === 'string' && types.includes(type) ? [event.ts] : []
  })
  if (times.length === 0) return undefined
  return { from: Math.min(...times), to: Math.max(...times) }
}

/**
 * Where the editor's renderer spent a page load: module graph evaluation (V8 reports it as one
 * event without script URLs), script compilation, WebAssembly compilation, and how long its main
 * thread was busy at all; the rest of the wall time it waited.
 */
export function loadCost(events: readonly TraceEvent[], renderer: number) {
  const names = threadNames(events)
  const main = events.filter(
    (event) => event.pid === renderer && names.get(`${event.pid}:${event.tid}`) === 'CrRendererMain'
  )
  const total = (match: (name: string) => boolean) =>
    round(
      main
        .filter((event) => event.ph === 'X' && match(event.name))
        .reduce((sum, event) => sum + (event.dur ?? 0), 0) / 1000
    ) ?? 0
  return {
    evaluateModuleMs: total((name) => name === 'v8.evaluateModule' || name === 'EvaluateScript'),
    compileMs: total((name) => name === 'v8.compile' || name === 'v8.compileModule'),
    wasmCompileMs: total((name) => /wasm/i.test(name)),
    mainThreadBusyMs:
      round(busyIntervals(main, 'js').reduce((sum, interval) => sum + interval.selfMs, 0)) ?? 0
  }
}
