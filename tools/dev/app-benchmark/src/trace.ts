import type { CDPSession } from '@playwright/test'
import * as v from 'valibot'

import { median, percentile, round } from './stats'

const TRACE_CATEGORIES = [
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'blink.user_timing',
  'toplevel',
  'v8',
  'v8.wasm',
  '__metadata'
]

const TraceEventSchema = v.looseObject({
  name: v.string(),
  ph: v.optional(v.string()),
  pid: v.optional(v.number()),
  tid: v.optional(v.number()),
  ts: v.optional(v.number()),
  dur: v.optional(v.number()),
  args: v.optional(v.record(v.string(), v.unknown()))
})
export type TraceEvent = v.InferOutput<typeof TraceEventSchema>

/** Records a Chromium trace on `session` until the returned stop resolves with its events. */
export async function startTrace(session: CDPSession): Promise<() => Promise<TraceEvent[]>> {
  const events: TraceEvent[] = []
  const collect = ({ value }: { value: unknown[] }) => {
    for (const entry of value) {
      const parsed = v.safeParse(TraceEventSchema, entry)
      if (parsed.success) events.push(parsed.output)
    }
  }
  session.on('Tracing.dataCollected', collect)
  await session.send('Tracing.start', {
    categories: TRACE_CATEGORIES.join(','),
    transferMode: 'ReportEvents'
  })
  return async () => {
    const complete = new Promise<void>((resolve) => {
      session.once('Tracing.tracingComplete', () => resolve())
    })
    await session.send('Tracing.end')
    await complete
    session.off('Tracing.dataCollected', collect)
    return events
  }
}

const LayoutData = v.looseObject({
  beginData: v.optional(
    v.looseObject({
      dirtyObjects: v.optional(v.number()),
      totalObjects: v.optional(v.number()),
      frame: v.optional(v.string())
    })
  )
})
const StyleData = v.looseObject({
  elementCount: v.optional(v.number()),
  beginData: v.optional(v.looseObject({ frame: v.optional(v.string()) }))
})
const EventData = v.looseObject({
  data: v.optional(v.looseObject({ type: v.optional(v.string()) }))
})

/** Style and layout work in one kind of document: the editor's own, or the artboards'. */
export interface DocumentCost {
  layouts: number
  layoutsPerInput: number | null
  /** Layout objects each layout had to lay out, and what its document holds. */
  layoutDirtyObjectsP50: number | null
  layoutTotalObjectsMax: number | null
  /** Share of its document's layout objects a layout touched, at the median. */
  layoutDirtyShareP50: number | null
  /** Layouts that walked the whole document rather than a dirty subtree. */
  fullLayouts: number
  layoutMs: number
  styleRecalcs: number
  styleElementsP50: number | null
  styleElementsMax: number | null
  styleMs: number
  paints: number
  paintMs: number
  /** Documents of this kind that laid out at all. */
  documents: number
}

export interface RenderingCost {
  /** Pointer moves, wheel turns or key presses the page dispatched. */
  inputEvents: number
  /** The editor's own document: panels, rulers, the SVG overlay. */
  editor: DocumentCost
  /** The artboard iframes, where the design is drawn. */
  artboards: DocumentCost
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const durationMs = (list: readonly TraceEvent[]) =>
  round(sum(list.map((event) => event.dur ?? 0)) / 1000) ?? 0

function frameOf(event: TraceEvent): string | undefined {
  const args = event.args ?? {}
  const begin = v.safeParse(LayoutData, args)
  if (begin.success && begin.output.beginData?.frame) return begin.output.beginData.frame
  const data = args.data
  return typeof data === 'object' && data && 'frame' in data && typeof data.frame === 'string'
    ? data.frame
    : undefined
}

function documentCost(events: readonly TraceEvent[], inputs: number): DocumentCost {
  const layouts = events.filter((event) => event.name === 'Layout')
  const styles = events.filter((event) => event.name === 'UpdateLayoutTree')
  const paints = events.filter((event) => event.name === 'Paint')
  const layoutData = layouts.map((event) => {
    const parsed = v.safeParse(LayoutData, event.args ?? {})
    return parsed.success ? (parsed.output.beginData ?? {}) : {}
  })
  const dirty = layoutData.flatMap((data) =>
    data.dirtyObjects === undefined ? [] : [data.dirtyObjects]
  )
  const total = layoutData.flatMap((data) =>
    data.totalObjects === undefined ? [] : [data.totalObjects]
  )
  const shares = layoutData.flatMap((data) =>
    data.dirtyObjects !== undefined && data.totalObjects
      ? [data.dirtyObjects / data.totalObjects]
      : []
  )
  const elementCounts = styles.flatMap((event) => {
    const parsed = v.safeParse(StyleData, event.args ?? {})
    const count = parsed.success ? parsed.output.elementCount : undefined
    return count === undefined ? [] : [count]
  })
  return {
    layouts: layouts.length,
    layoutsPerInput: inputs ? round(layouts.length / inputs, 2) : null,
    layoutDirtyObjectsP50: median(dirty),
    layoutTotalObjectsMax: total.length ? Math.max(...total) : null,
    layoutDirtyShareP50: round(median(shares), 3),
    fullLayouts: layoutData.filter(
      (data) => data.totalObjects !== undefined && data.dirtyObjects === data.totalObjects
    ).length,
    layoutMs: durationMs(layouts),
    styleRecalcs: styles.length,
    styleElementsP50: median(elementCounts),
    styleElementsMax: percentile(elementCounts, 100),
    styleMs: durationMs(styles),
    paints: paints.length,
    paintMs: durationMs(paints),
    documents: new Set([...layouts, ...styles].flatMap((event) => frameOf(event) ?? [])).size
  }
}

/**
 * How much style, layout and paint work a gesture caused, read from a devtools timeline trace
 * and split between the editor's document (`editorFrame`) and the artboard iframes. A gesture
 * drawn as a transform preview lays out nothing in the artboards per input; one that patches
 * an artboard's DOM lays out its dirty part, or all of it when the change dirties the document.
 */
export function renderingCost(
  events: readonly TraceEvent[],
  inputTypes: readonly string[],
  editorFrame: string
): RenderingCost {
  const complete = events.filter(
    (event) => event.ph === 'X' && ['Layout', 'UpdateLayoutTree', 'Paint'].includes(event.name)
  )
  const inputs = events.filter((event) => {
    if (event.ph !== 'X' || event.name !== 'EventDispatch') return false
    const parsed = v.safeParse(EventData, event.args ?? {})
    return parsed.success && inputTypes.includes(parsed.output.data?.type ?? '')
  }).length
  const inEditor = complete.filter((event) => frameOf(event) === editorFrame)
  const inArtboards = complete.filter((event) => {
    const frame = frameOf(event)
    return frame !== undefined && frame !== editorFrame
  })
  return {
    inputEvents: inputs,
    editor: documentCost(inEditor, inputs),
    artboards: documentCost(inArtboards, inputs)
  }
}
