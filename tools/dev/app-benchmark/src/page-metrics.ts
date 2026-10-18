import type { CDPSession, Page } from '@playwright/test'
import * as v from 'valibot'

import { round, toMiB } from './stats'

const MetricsSchema = v.object({
  metrics: v.array(v.object({ name: v.string(), value: v.number() }))
})

const WATCHED = [
  'LayoutCount',
  'RecalcStyleCount',
  'LayoutDuration',
  'RecalcStyleDuration',
  'ScriptDuration',
  'TaskDuration',
  'JSHeapUsedSize',
  'JSHeapTotalSize',
  'Nodes',
  'Documents',
  'Frames',
  'JSEventListeners'
] as const
type MetricName = (typeof WATCHED)[number]
export type RendererMetrics = Record<MetricName, number>

/** Chromium's counters for the editor's renderer, iframes included (they share its process). */
export async function rendererMetrics(cdp: CDPSession): Promise<RendererMetrics> {
  const { metrics } = v.parse(MetricsSchema, await cdp.send('Performance.getMetrics'))
  const byName = new Map(metrics.map((metric) => [metric.name, metric.value]))
  return Object.fromEntries(WATCHED.map((name) => [name, byName.get(name) ?? 0])) as RendererMetrics
}

/** What changed between two readings, durations in milliseconds. */
export function metricsDelta(before: RendererMetrics, after: RendererMetrics) {
  const ms = (name: MetricName) => round((after[name] - before[name]) * 1000) ?? 0
  return {
    layouts: after.LayoutCount - before.LayoutCount,
    styleRecalcs: after.RecalcStyleCount - before.RecalcStyleCount,
    layoutMs: ms('LayoutDuration'),
    styleMs: ms('RecalcStyleDuration'),
    scriptMs: ms('ScriptDuration'),
    taskMs: ms('TaskDuration')
  }
}

export interface DocumentFootprint {
  jsHeapUsedMiB: number
  jsHeapTotalMiB: number
  domNodes: number
  documents: number
  frames: number
  eventListeners: number
  artboardIframes: number
  /** Images the canvas holds, with their decoded size where the browser knows it. */
  images: number
  imagePixelsMegapixels: number
  /** Whether CanvasKit is loaded: its WebAssembly was fetched, or an editor holds it. */
  canvasKitLoaded: boolean
  /** CanvasKit's WebAssembly memory, which V8's heap does not count. */
  canvasKitHeapMiB: number
}

export async function documentFootprint(page: Page, cdp: CDPSession): Promise<DocumentFootprint> {
  const metrics = await rendererMetrics(cdp)
  const inPage = await page.evaluate(() => {
    const frames = [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]')]
    const images = frames.flatMap((frame) => [...(frame.contentDocument?.images ?? [])])
    const pixels = images.reduce(
      (total, image) => total + image.naturalWidth * image.naturalHeight,
      0
    )
    let wasmBytes = 0
    let held = false
    try {
      // CanvasKit loads on demand; once it has, the editor holds it through its renderer.
      const store: unknown = window.kalka?.getStore?.()
      const renderer: unknown =
        store && typeof store === 'object' && 'renderer' in store ? store.renderer : null
      const ck: unknown =
        renderer && typeof renderer === 'object' && 'ck' in renderer ? renderer.ck : null
      held = !!ck
      if (ck && typeof ck === 'object' && 'HEAPU8' in ck && ck.HEAPU8 instanceof Uint8Array)
        wasmBytes = ck.HEAPU8.buffer.byteLength
      // oxlint-disable-next-line kalka/no-silent-catch -- The home screen has no editor to ask.
    } catch {}
    const canvasKit =
      held ||
      performance
        .getEntriesByType('resource')
        .some((entry) => /canvaskit[^/]*\.wasm/.test(entry.name))
    return { iframes: frames.length, images: images.length, pixels, canvasKit, wasmBytes }
  })
  return {
    jsHeapUsedMiB: toMiB(metrics.JSHeapUsedSize),
    jsHeapTotalMiB: toMiB(metrics.JSHeapTotalSize),
    domNodes: metrics.Nodes,
    documents: metrics.Documents,
    frames: metrics.Frames,
    eventListeners: metrics.JSEventListeners,
    artboardIframes: inPage.iframes,
    images: inPage.images,
    imagePixelsMegapixels: round(inPage.pixels / 1e6, 2) ?? 0,
    canvasKitLoaded: inPage.canvasKit,
    canvasKitHeapMiB: toMiB(inPage.wasmBytes)
  }
}
