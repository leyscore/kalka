import type { Page } from '@playwright/test'
import * as v from 'valibot'

import { inputRange, workBreakdown, type WorkBreakdown } from '../breakdown'
import {
  measureRefreshInterval,
  startFrameRecorder,
  stopFrameRecorder,
  summarizeFrames,
  type FrameSummary
} from '../frames'
import { CANVAS, traceProcesses, type AppSession } from '../launch'
import { metricsDelta, rendererMetrics } from '../page-metrics'
import { pause } from '../stats'
import { renderingCost, startTrace, type RenderingCost } from '../trace'

export type GestureName = 'pan' | 'zoom' | 'drag' | 'resize' | 'type'
export const GESTURES: readonly GestureName[] = ['pan', 'zoom', 'drag', 'resize', 'type']

export interface GestureResult {
  gesture: GestureName
  durationMs: number
  frames: FrameSummary
  /** Chromium's counters over the gesture. */
  renderer: ReturnType<typeof metricsDelta>
  /** Style and layout work per input, from a devtools timeline trace. */
  rendering: RenderingCost
  /** Whether the gesture did what it plays: the view moved, the card moved or grew, text grew. */
  took: boolean
  /** Work per display frame by kind (JS, style, layout, paint, composite, GPU), from the trace. */
  perFrame: WorkBreakdown
}

/** Input at about 60 Hz, the rate a mouse or trackpad delivers. */
const INPUT_INTERVAL_MS = 16
const STEPS = 60
const TYPED = 'The quick brown fox jumps over the lazy dog'

interface Target {
  /** A card: a frame of ten layers inside the first artboard. */
  cardId: string
  textId: string
}

/** Screen box of a layer, from the store's viewport. */
async function screenBox(page: Page, id: string) {
  const canvas = await page.locator(CANVAS).boundingBox()
  if (!canvas) throw new Error('The canvas has no box')
  const box = await page.evaluate((nodeId) => {
    const store = window.kalka?.getStore?.()
    const node = store?.graph.getNode(nodeId)
    if (!store || !node) throw new Error(`No layer ${nodeId}`)
    const position = store.graph.getAbsolutePosition(nodeId)
    const { panX, panY, zoom } = store.state
    return {
      x: position.x * zoom + panX,
      y: position.y * zoom + panY,
      width: node.width * zoom,
      height: node.height * zoom
    }
  }, id)
  return { ...box, x: box.x + canvas.x, y: box.y + canvas.y }
}

/** Picks the first card of the first artboard and its first text layer. */
async function findTarget(page: Page): Promise<Target | null> {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) return null
    const [artboardId] = store.graph.getNode(store.state.currentPageId)?.childIds ?? []
    const cardId = artboardId ? store.graph.getNode(artboardId)?.childIds[0] : undefined
    const card = cardId ? store.graph.getNode(cardId) : undefined
    const textId = card?.childIds.find((id) => store.graph.getNode(id)?.type === 'TEXT')
    return cardId && textId ? { cardId, textId } : null
  })
}

/** Shows the whole page, as pan and zoom start from. */
async function fitPage(page: Page) {
  await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    store?.clearSelection?.()
    store?.zoomToFit()
  })
}

/** Shows `id` at 100 % in the middle of the canvas and selects it. */
async function focusLayer(page: Page, id: string, select: boolean) {
  const canvas = await page.locator(CANVAS).boundingBox()
  if (!canvas) throw new Error('The canvas has no box')
  await page.evaluate(
    ({ nodeId, width, height, select: selectIt }) => {
      const store = window.kalka?.getStore?.()
      const node = store?.graph.getNode(nodeId)
      if (!store || !node) throw new Error(`No layer ${nodeId}`)
      const position = store.graph.getAbsolutePosition(nodeId)
      store.state.zoom = 1
      store.state.panX = width / 2 - (position.x + node.width / 2)
      store.state.panY = height / 2 - (position.y + node.height / 2)
      store.requestRepaint()
      if (selectIt) store.select([nodeId])
      else store.clearSelection?.()
    },
    { nodeId: id, width: canvas.width, height: canvas.height, select }
  )
}

async function center(page: Page) {
  const canvas = await page.locator(CANVAS).boundingBox()
  if (!canvas) throw new Error('The canvas has no box')
  return { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 }
}

async function play(page: Page, gesture: GestureName, target: Target) {
  const mouse = page.mouse
  switch (gesture) {
    case 'pan': {
      const at = await center(page)
      await mouse.move(at.x, at.y)
      for (let step = 0; step < STEPS; step++) {
        const direction = step < STEPS / 2 ? 1 : -1
        await mouse.wheel(14 * direction, 9 * direction)
        await pause(INPUT_INTERVAL_MS)
      }
      return
    }
    case 'zoom': {
      const at = await center(page)
      await mouse.move(at.x, at.y)
      await page.keyboard.down('Control')
      for (let step = 0; step < STEPS; step++) {
        await mouse.wheel(0, step < STEPS / 2 ? -8 : 8)
        await pause(INPUT_INTERVAL_MS)
      }
      await page.keyboard.up('Control')
      return
    }
    case 'drag':
    case 'resize': {
      const box = await screenBox(page, target.cardId)
      const start =
        gesture === 'drag'
          ? { x: box.x + box.width / 2, y: box.y + box.height / 2 }
          : { x: box.x + box.width, y: box.y + box.height }
      await mouse.move(start.x, start.y)
      await mouse.down()
      for (let step = 1; step <= STEPS; step++) {
        await mouse.move(start.x + step * 3, start.y + step * 2)
        await pause(INPUT_INTERVAL_MS)
      }
      await mouse.up()
      return
    }
    case 'type': {
      await page.keyboard.press('End')
      for (const character of TYPED) {
        await page.keyboard.type(character)
        await pause(INPUT_INTERVAL_MS * 3)
      }
    }
  }
}

/** What a gesture changes, read before and after it to check it took. */
async function observed(page: Page, gesture: GestureName, target: Target): Promise<string> {
  return page.evaluate(
    ({ kind, cardId, textId }) => {
      const store = window.kalka?.getStore?.()
      if (!store) return ''
      if (kind === 'pan' || kind === 'zoom')
        return `${store.state.panX}:${store.state.panY}:${store.state.zoom}`
      if (kind === 'type') return store.graph.getNode(textId)?.text ?? ''
      const card = store.graph.getNode(cardId)
      return card ? `${card.x}:${card.y}:${card.width}:${card.height}` : ''
    },
    { kind: gesture, ...target }
  )
}

/** Gets the canvas ready for `gesture`: the whole page, or one card at 100 %. */
async function prepare(session: AppSession, gesture: GestureName, target: Target) {
  const page = session.page
  if (gesture === 'pan' || gesture === 'zoom') await fitPage(page)
  else if (gesture === 'type') {
    await focusLayer(page, target.textId, false)
    const box = await screenBox(page, target.textId)
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
    // Double-click enters the card; a second one edits the text inside it.
    const editing = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]')].some(
          (frame) =>
            frame.contentDocument?.activeElement?.getAttribute('contenteditable') === 'true'
        )
      )
    if (!(await editing())) await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]')].some(
          (frame) =>
            frame.contentDocument?.activeElement?.getAttribute('contenteditable') === 'true'
        ),
      undefined,
      { timeout: 10_000 }
    )
  } else await focusLayer(page, target.cardId, true)
  await page.evaluate(() => new Promise(requestAnimationFrame))
  await pause(500)
}

const INPUT_TYPES: Record<GestureName, string[]> = {
  pan: ['wheel', 'mousewheel'],
  zoom: ['wheel', 'mousewheel'],
  drag: ['pointermove', 'mousemove'],
  resize: ['pointermove', 'mousemove'],
  type: ['keydown']
}

const FrameTree = v.object({ frameTree: v.object({ frame: v.object({ id: v.string() }) }) })

/** The editor document's frame id, which trace events name their document by. */
async function mainFrameId(session: AppSession): Promise<string> {
  return v.parse(FrameTree, await session.cdp.send('Page.getFrameTree')).frameTree.frame.id
}

/** Plays every gesture on the open document and measures each. */
export async function measureGestures(
  session: AppSession,
  gestures: readonly GestureName[],
  log: (message: string) => void
): Promise<{ refreshMs: number; results: GestureResult[]; skipped: string[] }> {
  const page = session.page
  const target = await findTarget(page)
  const refreshMs = await measureRefreshInterval(page)
  const processes = await traceProcesses(session)
  const editorFrame = await mainFrameId(session)
  const results: GestureResult[] = []
  const skipped: string[] = []
  for (const gesture of gestures) {
    if (!target) {
      skipped.push(`${gesture}: no card to act on`)
      continue
    }
    log(`  gesture ${gesture}`)
    try {
      await prepare(session, gesture, target)
      const state = await observed(page, gesture, target)
      const before = await rendererMetrics(session.cdp)
      const stopTrace = await startTrace(session.cdp)
      const recorder = await startFrameRecorder(page)
      const started = performance.now()
      await play(page, gesture, target)
      await page.evaluate(() => new Promise(requestAnimationFrame))
      const durationMs = performance.now() - started
      const recording = await stopFrameRecorder(recorder)
      const events = await stopTrace()
      const after = await rendererMetrics(session.cdp)
      if (gesture === 'type') await page.keyboard.press('Escape')
      const took = (await observed(page, gesture, target)) !== state
      results.push({
        gesture,
        durationMs: Math.round(durationMs),
        took,
        frames: summarizeFrames(recording, refreshMs),
        renderer: metricsDelta(before, after),
        rendering: renderingCost(events, INPUT_TYPES[gesture], editorFrame),
        perFrame: workBreakdown(
          events,
          processes,
          refreshMs,
          inputRange(events, processes.renderer, INPUT_TYPES[gesture])
        )
      })
    } catch (error) {
      skipped.push(
        `${gesture}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`
      )
    }
  }
  return { refreshMs, results, skipped }
}
