import type { Page } from '@playwright/test'

import { workBreakdown, type WorkBreakdown } from '../breakdown'
import {
  idle,
  openInApp,
  traceProcesses,
  waitForHome,
  waitForMount,
  waitForSettledCanvas,
  type AppSession
} from '../launch'
import { documentFootprint, type DocumentFootprint } from '../page-metrics'
import { sampleMemory, type MemorySnapshot } from '../processes'
import { round, toMiB } from '../stats'
import { startTrace } from '../trace'
import { withApp, type BenchContext } from './context'
import { measureGestures, type GestureName, type GestureResult } from './gestures'

export interface OpenDocument {
  name: string
  path: string
  /** Top-level layers the page should show once open; 1 when unknown. */
  artboards: number
}

export interface OpenTiming {
  /** From handing the file over to a new editor whose graph holds the page: read, parse, import. */
  importMs: number
  /** From the graph being ready to the canvas settled: projection, fonts, layout, first paint. */
  firstRenderMs: number
  totalMs: number
  /** Work over the whole open, by kind; worker is the `.fig` parse. */
  work: WorkBreakdown
}

export interface DocumentResult {
  name: string
  open: OpenTiming
  /** JS heap when the graph was ready, before the canvas drew it. */
  heapAtImportMiB: number
  memory: MemorySnapshot
  page: DocumentFootprint
  gestures?: { refreshMs: number; results: GestureResult[]; skipped: string[] }
}

async function storeSignature(page: Page): Promise<string> {
  return page.evaluate(() => {
    try {
      const store = window.kalka?.getStore?.()
      return store ? `${store.state.currentPageId}:${store.graph.nodes.size}` : ''
    } catch {
      return ''
    }
  })
}

/** Opens `doc` in a running app on its home screen and times import and first render apart. */
export async function openAndMeasure(
  session: AppSession,
  doc: OpenDocument,
  settleMs: number
): Promise<Omit<DocumentResult, 'name' | 'gestures'>> {
  const page = session.page
  const processes = await traceProcesses(session)
  const before = await storeSignature(page)
  const stopTrace = await startTrace(session.cdp)
  const started = performance.now()
  await openInApp(session, doc.path)
  await page.waitForFunction(
    ({ previous, artboards }) => {
      try {
        const store = window.kalka?.getStore?.()
        if (!store) return false
        const top = store.graph.getNode(store.state.currentPageId)?.childIds.length ?? 0
        const signature = `${store.state.currentPageId}:${store.graph.nodes.size}`
        return signature !== previous && top >= artboards
      } catch {
        return false
      }
    },
    { previous: before, artboards: doc.artboards },
    { timeout: 180_000, polling: 16 }
  )
  const imported = performance.now()
  const heap = await session.cdp.send('Runtime.getHeapUsage')
  await waitForSettledCanvas(page, doc.artboards)
  const settled = performance.now()
  const events = await stopTrace()
  await idle(page, settleMs)
  return {
    open: {
      importMs: round(imported - started) ?? 0,
      firstRenderMs: round(settled - imported) ?? 0,
      totalMs: round(settled - started) ?? 0,
      work: workBreakdown(events, processes, settled - started)
    },
    heapAtImportMiB: toMiB(heap.usedSize),
    memory: await sampleMemory(session.app),
    page: await documentFootprint(page, session.cdp)
  }
}

/** Starts the app, opens `doc` from its home screen, samples it, then plays `gestures`. */
export async function measureDocument(
  context: BenchContext,
  doc: OpenDocument,
  gestures: readonly GestureName[]
): Promise<DocumentResult> {
  context.log(`document ${doc.name}`)
  return withApp(context, async (session) => {
    await waitForMount(session.page)
    await waitForHome(session.page)
    await idle(session.page, context.settleMs)
    const result = await openAndMeasure(session, doc, context.settleMs)
    return {
      name: doc.name,
      ...result,
      ...(gestures.length
        ? { gestures: await measureGestures(session, gestures, context.log) }
        : {})
    }
  })
}
