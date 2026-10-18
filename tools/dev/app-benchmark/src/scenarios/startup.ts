import { loadCost, workBreakdown, type WorkBreakdown } from '../breakdown'
import { builtFiles, bundleReport, loadedPaths, type BundleReport } from '../bundle'
import {
  idle,
  traceProcesses,
  waitForEditor,
  waitForHome,
  waitForHomeRendered,
  waitForMount,
  waitForSettledCanvas,
  waitForSplashGone
} from '../launch'
import type { AppSession } from '../launch'
import { documentFootprint, type DocumentFootprint } from '../page-metrics'
import { sampleMemory, type MemorySnapshot } from '../processes'
import { median, round } from '../stats'
import { startTrace } from '../trace'
import { withApp, type BenchContext } from './context'
import type { OpenDocument } from './document'

export interface StartupRun {
  firstWindowMs: number
  mountedMs: number
  /** The home screen's content is in the page, under the splash. */
  homeMs: number
  /** The splash left: when the home screen can be seen and used. */
  splashGoneMs: number
  /** From clicking New design to an editor whose canvas has settled. */
  emptyDocumentMs: number
}

export interface StartupResult {
  runs: StartupRun[]
  median: StartupRun
  memory: { home: MemorySnapshot; emptyDocument: MemorySnapshot }
  page: { home: DocumentFootprint; emptyDocument: DocumentFootprint }
  /** Windows the main process holds once the home screen is idle (hidden raster windows count). */
  windowsAtIdle: number
  bundle: BundleReport
  /** The renderer's work while the home screen reloads, attributed to scripts and WebAssembly. */
  reload: {
    homeMs: number
    work: WorkBreakdown
    cost: ReturnType<typeof loadCost>
  }
  /** Launching with a document, as double-clicking it in the Finder does. */
  launchWithDocument?: { name: string; settledMs: number }
}

/** What the last launch samples besides its timings. */
interface Samples {
  memory: StartupResult['memory']
  page: StartupResult['page']
  windowsAtIdle: number
  reload: StartupResult['reload']
  paths: { home: string[]; emptyDocument: string[] }
}

/** Samples the idle home screen, then reloads it under a trace. */
async function sampleHome(context: BenchContext, session: AppSession) {
  await idle(session.page, context.settleMs)
  const memory = await sampleMemory(session.app)
  const windows = await session.app.evaluate(
    ({ BrowserWindow }) => BrowserWindow.getAllWindows().length
  )
  // Resource timing keeps 250 entries by default, fewer than the app's chunks: the reload
  // below starts with room for all of them, so the code it lists is complete.
  await session.cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'performance.setResourceTimingBufferSize(100000)'
  })
  const processes = await traceProcesses(session)
  const stopTrace = await startTrace(session.cdp)
  const reloaded = performance.now()
  await session.page.reload()
  await waitForHome(session.page)
  const homeAfterReload = performance.now() - reloaded
  const events = await stopTrace()
  await idle(session.page, context.settleMs)
  return {
    memory,
    windows,
    reload: {
      homeMs: round(homeAfterReload) ?? 0,
      work: workBreakdown(events, processes, homeAfterReload),
      cost: loadCost(events, processes.renderer)
    },
    page: await documentFootprint(session.page, session.cdp),
    paths: await loadedPaths(session.page)
  }
}

/** One launch to an empty document; with `sample`, also memory, code and a reload trace. */
async function launchOnce(
  context: BenchContext,
  sample: boolean
): Promise<{ run: StartupRun; samples: Samples | null }> {
  return withApp(context, async (session) => {
    const since = () => performance.now() - session.launchedAt
    await waitForMount(session.page)
    const mountedMs = since()
    await waitForHomeRendered(session.page)
    const homeMs = since()
    await waitForSplashGone(session.page)
    const splashGoneMs = since()
    const home = sample ? await sampleHome(context, session) : null
    const clicked = performance.now()
    await session.page
      .getByRole('button', { name: /^New design/ })
      .first()
      .click()
    await waitForEditor(session.page)
    await waitForSettledCanvas(session.page)
    const emptyDocumentMs = performance.now() - clicked
    const run = {
      firstWindowMs: session.firstWindowMs,
      mountedMs,
      homeMs,
      splashGoneMs,
      emptyDocumentMs
    }
    if (!home) return { run, samples: null }
    await idle(session.page, context.settleMs)
    return {
      run,
      samples: {
        memory: { home: home.memory, emptyDocument: await sampleMemory(session.app) },
        page: {
          home: home.page,
          emptyDocument: await documentFootprint(session.page, session.cdp)
        },
        windowsAtIdle: home.windows,
        reload: home.reload,
        paths: { home: home.paths, emptyDocument: await loadedPaths(session.page) }
      }
    }
  })
}

/** Launches with `doc` as an argument and times it until its canvas settled. */
async function launchWith(context: BenchContext, doc: OpenDocument) {
  context.log(`startup with ${doc.name}`)
  return withApp(
    context,
    async (session) => {
      await session.page.waitForFunction(
        (artboards) =>
          document.querySelectorAll('iframe[data-kalka-artboard]').length >= Math.max(1, artboards),
        doc.artboards,
        { timeout: 120_000 }
      )
      await waitForSettledCanvas(session.page, doc.artboards)
      return { name: doc.name, settledMs: round(performance.now() - session.launchedAt) ?? 0 }
    },
    [doc.path]
  )
}

/** Launches the app `runs` times; samples memory and loaded code on the last launch. */
export async function measureStartup(
  context: BenchContext,
  runs: number,
  launchDocument?: OpenDocument
): Promise<StartupResult> {
  const results: StartupRun[] = []
  let samples: Samples | null = null
  for (let index = 0; index < runs; index++) {
    context.log(`startup ${index + 1}/${runs}`)
    const launch = await launchOnce(context, index === runs - 1)
    results.push(launch.run)
    samples = launch.samples ?? samples
  }
  if (!samples) throw new Error('Startup ran no launch')
  const launchWithDocument = launchDocument ? await launchWith(context, launchDocument) : null
  const rounded = (run: StartupRun): StartupRun => ({
    firstWindowMs: round(run.firstWindowMs) ?? 0,
    mountedMs: round(run.mountedMs) ?? 0,
    homeMs: round(run.homeMs) ?? 0,
    splashGoneMs: round(run.splashGoneMs) ?? 0,
    emptyDocumentMs: round(run.emptyDocumentMs) ?? 0
  })
  const pick = (key: keyof StartupRun) => median(results.map((run) => run[key])) ?? 0
  return {
    runs: results.map(rounded),
    median: rounded({
      firstWindowMs: pick('firstWindowMs'),
      mountedMs: pick('mountedMs'),
      homeMs: pick('homeMs'),
      splashGoneMs: pick('splashGoneMs'),
      emptyDocumentMs: pick('emptyDocumentMs')
    }),
    memory: samples.memory,
    page: samples.page,
    windowsAtIdle: samples.windowsAtIdle,
    reload: samples.reload,
    ...(launchWithDocument ? { launchWithDocument } : {}),
    bundle: bundleReport(
      await builtFiles(context.dist),
      samples.paths.home,
      samples.paths.emptyDocument
    )
  }
}
