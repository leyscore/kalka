import type { Page } from '@playwright/test'

import type { Vector } from '@kalka/scene-graph'

import { inputRange, workBreakdown, type WorkBreakdown } from '../breakdown'
import { artboardStep, ensureGeneratedDocument } from '../documents'
import {
  measureRefreshInterval,
  startFrameRecorder,
  stopFrameRecorder,
  summarizeFrames,
  type FrameSummary
} from '../frames'
import {
  CANVAS,
  idle,
  traceProcesses,
  waitForHome,
  waitForMount,
  waitForSettledCanvas,
  type AppSession
} from '../launch'
import {
  documentFootprint,
  metricsDelta,
  rendererMetrics,
  type DocumentFootprint
} from '../page-metrics'
import { sampleMemory, type MemorySnapshot } from '../processes'
import { pause, round } from '../stats'
import { startTrace } from '../trace'
import { withApp, type BenchContext } from './context'
import { openAndMeasure, type OpenTiming } from './document'

export interface ArtboardView {
  memory: MemorySnapshot
  page: DocumentFootprint
  pan: { frames: FrameSummary; renderer: ReturnType<typeof metricsDelta>; perFrame: WorkBreakdown }
}

export interface ArtboardStepResult {
  artboards: number
  layers: number
  open: OpenTiming
  /** Every artboard on screen, zoomed to fit the page. */
  allVisible: ArtboardView
  /** Zoomed into the first artboard at 100 %: the others are off screen. */
  oneVisible: ArtboardView
}

const STEPS = 40

/** Pans back and forth and measures what it costs. */
async function measurePan(session: AppSession, refreshMs: number): Promise<ArtboardView['pan']> {
  const page = session.page
  const processes = await traceProcesses(session)
  const canvas = await page.locator(CANVAS).boundingBox()
  if (!canvas) throw new Error('The canvas has no box')
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2)
  const before = await rendererMetrics(session.cdp)
  const stopTrace = await startTrace(session.cdp)
  const recorder = await startFrameRecorder(page)
  for (let step = 0; step < STEPS; step++) {
    const direction = step < STEPS / 2 ? 1 : -1
    await page.mouse.wheel(14 * direction, 9 * direction)
    await pause(16)
  }
  await page.evaluate(() => new Promise(requestAnimationFrame))
  const recording = await stopFrameRecorder(recorder)
  const events = await stopTrace()
  const after = await rendererMetrics(session.cdp)
  return {
    frames: summarizeFrames(recording, refreshMs),
    renderer: metricsDelta(before, after),
    perFrame: workBreakdown(
      events,
      processes,
      refreshMs,
      inputRange(events, processes.renderer, ['wheel', 'mousewheel'])
    )
  }
}

async function view(
  session: AppSession,
  refreshMs: number,
  settleMs: number
): Promise<ArtboardView> {
  await waitForSettledCanvas(session.page)
  await idle(session.page, settleMs)
  return {
    memory: await sampleMemory(session.app),
    page: await documentFootprint(session.page, session.cdp),
    pan: await measurePan(session, refreshMs)
  }
}

async function fitAll(page: Page) {
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    store?.clearSelection()
    store?.zoomToFit()
  })
}

/** Shows the first artboard's top-left corner at 100 %. */
async function zoomIntoFirst(page: Page) {
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) return
    const [first] = store.graph.getNode(store.state.currentPageId)?.childIds ?? []
    if (!first) return
    const position = store.graph.getAbsolutePosition(first)
    store.state.zoom = 1
    store.state.panX = 40 - position.x
    store.state.panY = 40 - position.y
    store.requestRepaint()
  })
}

/**
 * What each artboard iframe costs: opens documents of 1 to 50 artboards (a hundred layers each),
 * samples memory and pans with all of them on screen, then again zoomed into one.
 */
export async function measureArtboardSteps(
  context: BenchContext,
  documents: string,
  steps: readonly number[]
): Promise<ArtboardStepResult[]> {
  const results: ArtboardStepResult[] = []
  for (const count of steps) {
    const spec = artboardStep(count)
    const path = await ensureGeneratedDocument(documents, spec)
    context.log(`artboards ${count}`)
    results.push(
      await withApp(context, async (session) => {
        await waitForMount(session.page)
        await waitForHome(session.page)
        await idle(session.page, context.settleMs)
        const opened = await openAndMeasure(session, { name: spec.name, path, artboards: count }, 0)
        const refreshMs = await measureRefreshInterval(session.page)
        await fitAll(session.page)
        const allVisible = await view(session, refreshMs, context.settleMs)
        await zoomIntoFirst(session.page)
        const oneVisible = await view(session, refreshMs, context.settleMs)
        return { artboards: count, layers: spec.leaves, open: opened.open, allVisible, oneVisible }
      })
    )
  }
  return results
}

/** Least-squares slope of `y` over `x`: the cost of one more artboard. */
export function slope(points: readonly Vector[]): number | null {
  if (points.length < 2) return null
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length
  const numerator = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0)
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  return denominator ? round(numerator / denominator, 2) : null
}
