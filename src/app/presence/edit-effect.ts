import type { DocumentChange } from '@kalka/core/editor'
import { planReveal, revealEnd, type AgentEdit, type AgentTrace, type RevealStep } from '@kalka/vue'

import type { EditorStore } from '@/app/editor/active-store'
import { flyToCreation } from '@/app/presence/fly-to-work'
import { agentAnimationsEnabled } from '@/app/shell/motion'

import { holdOnCanvas, releaseOnCanvas, revealOnCanvas, showAgentTraces } from './canvas-scene'
import { CURSOR_GLIDE_MS } from './motion'
import { agentPlacement, localAgentColor, type AgentHandle } from './registry'
import type { AgentPresence } from './types'

/** The agent's cursor visits at most this many layers per edit. */
export const MAX_CURSOR_STOPS = 6
/** Between two layers an edit changed without revealing anything, such as recolored ones. */
export const CURSOR_STOP_MS = 150
/** New layers one edit keeps hidden until its reveal; the outermost come first. */
export const MAX_HELD_LAYERS = 64
/**
 * An agent's edit waits at most this long for its previous edits to finish revealing, so edits
 * play one after another instead of over each other, and a fast agent never falls far behind.
 * Held layers show by themselves after a few seconds, which this stays well within.
 */
export const MAX_REVEAL_QUEUE_MS = 2000

/** What an edit created and which text it wrote, from what it changed on its page. */
export function agentEditFromChange(change: DocumentChange): AgentEdit {
  return {
    // Parents first, which is also how a reveal chooses among many.
    created: change.created.map((node) => node.id),
    written: change.updated
      .filter((update) => update.fields !== null && 'text' in update.fields.after)
      .map((update) => update.id)
  }
}

/** One place the cursor goes during an edit, and when, after the edit. */
export interface CursorStop {
  id: string
  at: number
}

/**
 * Where the agent's cursor goes while an edit replays: the layers it reveals as they appear, or
 * else the layers it touched one after another. Evenly picked when there are many; none when
 * motion is reduced, so the cursor goes straight to where the edit left it.
 */
export function cursorStops(
  steps: readonly RevealStep[],
  touched: readonly string[],
  options: { reducedMotion: boolean }
): CursorStop[] {
  if (options.reducedMotion) return []
  const all: CursorStop[] =
    steps.length > 0
      ? steps.map((step) => ({ id: step.id, at: step.delay }))
      : touched.map((id, index) => ({ id, at: index * CURSOR_STOP_MS }))
  if (all.length < 2) return []
  if (all.length <= MAX_CURSOR_STOPS) return all
  // The first and last stay, so the cursor starts where the edit starts and ends where it ends.
  return Array.from(
    { length: MAX_CURSOR_STOPS },
    (_, index) => all[Math.round((index * (all.length - 1)) / (MAX_CURSOR_STOPS - 1))]
  )
}

/** What placing an agent changes: where its cursor is and what it outlines. */
export type AgentPlacement = Pick<AgentPresence, 'pageId' | 'cursor' | 'selection' | 'outline'>

/** An agent's cursor moving through an edit's reveal, and where it goes once that is over. */
interface Sweep {
  timers: ReturnType<typeof setTimeout>[]
  end: ReturnType<typeof setTimeout> | null
  /** Where the agent was placed meanwhile, applied when the sweep ends. */
  final: AgentPlacement | null
}

const sweeps = new WeakMap<AgentHandle, Sweep>()
/** When each agent's queued reveals end, on the `performance.now()` clock. */
const revealQueues = new WeakMap<AgentHandle, number>()

/** Stops moving an agent's cursor through edits, as when its run ends; nothing queued plays. */
export function stopCursorSweep(agent: AgentHandle): void {
  const sweep = sweeps.get(agent)
  if (sweep) {
    for (const timer of sweep.timers) clearTimeout(timer)
    if (sweep.end) clearTimeout(sweep.end)
  }
  sweeps.delete(agent)
  revealQueues.delete(agent)
}

/**
 * Point an agent at where it works: `now` applies at once, such as its status, and `placement`
 * too unless its cursor is still moving through an edit's reveal, which then ends there. One
 * path at a time moves the cursor, so it glides through the build instead of jumping between
 * what the reveal shows and what a call reported.
 */
export function placeAgent(
  agent: AgentHandle,
  placement: AgentPlacement | null,
  now: Partial<Omit<AgentPresence, 'id' | 'name' | 'kind'>> = {}
): void {
  const sweep = sweeps.get(agent)
  if (sweep && placement) {
    sweep.final = placement
    if (Object.keys(now).length > 0) agent.update(now)
    return
  }
  agent.update({ ...now, ...placement })
}

function sweepCursor(
  store: EditorStore,
  agent: AgentHandle,
  stops: readonly CursorStop[],
  pageId: string
): void {
  const last = stops.at(-1)
  if (!last) return
  const sweep = sweeps.get(agent) ?? { timers: [], end: null, final: null }
  sweeps.set(agent, sweep)
  const visit = (stop: CursorStop) => {
    const placement = agentPlacement(store, [stop.id], pageId)
    // The frame shows the layer; an outline jumping along with the cursor would flicker.
    if (placement)
      agent.update({ status: 'editing', ...placement, selection: undefined, outline: undefined })
  }
  for (const stop of stops) {
    // A stop due now is visited now, so the agent is where its edit starts as the call returns.
    if (stop.at <= 0) visit(stop)
    else sweep.timers.push(setTimeout(() => visit(stop), stop.at))
  }
  if (sweep.end) clearTimeout(sweep.end)
  sweep.end = setTimeout(() => {
    sweeps.delete(agent)
    if (sweep.final) agent.update(sweep.final)
  }, last.at + CURSOR_GLIDE_MS)
}

/**
 * When an agent's edit starts revealing: after its edits still revealing, waiting at most
 * `MAX_REVEAL_QUEUE_MS`. Records when this one ends, so the next one waits for it.
 */
function queueReveal(
  agent: AgentHandle | null | undefined,
  steps: readonly RevealStep[],
  now: number
): number {
  if (!agent || steps.length === 0) return 0
  const wait = Math.min(MAX_REVEAL_QUEUE_MS, Math.max(0, (revealQueues.get(agent) ?? 0) - now))
  revealQueues.set(agent, now + wait + revealEnd(steps))
  return wait
}

/** A trace around each layer that appears, drawn as it appears, in the agent's color. */
export function revealTraces(
  steps: readonly RevealStep[],
  color: AgentTrace['color'],
  now: number
): AgentTrace[] {
  return steps
    .filter((step) => step.kind === 'appear')
    .map((step) => ({ nodeId: step.id, color, start: now + step.delay, duration: step.duration }))
}

/**
 * Show an agent's edit as it happens: after its earlier edits have played, new layers appear
 * one by one in document order, each traced by a rectangle in the agent's color, text types
 * itself out, and its cursor glides along. Only the canvas animates: the document already
 * holds the whole edit, and nothing here waits, so the tool's result is never delayed.
 */
export function showAgentEdit(
  store: EditorStore,
  edit: AgentEdit,
  options: { agent?: AgentHandle | null; touched?: readonly string[]; pageId: string }
): void {
  try {
    flyToCreation(store, edit.created)
    const reducedMotion = !agentAnimationsEnabled.value
    const planned = planReveal(store.graph, edit, { reducedMotion })
    const now = performance.now()
    const wait = queueReveal(options.agent, planned, now)
    const steps = planned.map((step) => ({ ...step, delay: step.delay + wait }))
    revealOnCanvas(store, steps)
    showAgentTraces(store, revealTraces(steps, localAgentColor(store), now), now)
    // New layers the reveal leaves out, past its limit or hidden, show now.
    const revealed = new Set(steps.map((step) => step.id))
    releaseOnCanvas(
      store,
      edit.created.filter((id) => !revealed.has(id))
    )
    if (!options.agent) return
    const stops = cursorStops(steps, options.touched ?? [], { reducedMotion })
    sweepCursor(store, options.agent, stops, options.pageId)
  } catch (error) {
    // Showing the edit is decoration; it must never turn a finished edit into a failed call.
    console.warn('[Agent edit effect]', error)
    releaseOnCanvas(store, edit.created)
  }
}

/** New layers an agent's call is creating, kept hidden until `showAgentEdit` reveals them. */
export interface CreationHold {
  /** Stops holding layers created from now on; those held wait for their reveal. */
  stop(): void
  /** Shows every layer held, as when the call failed and nothing will be revealed. */
  release(): void
}

/**
 * Keeps the layers an agent's call creates hidden from the moment they exist, so they do not
 * show while the call lays them out and loads their fonts and then disappear to animate in.
 * Only the outermost new layers are held, since their children show with them. Nothing is
 * held when agents' edits do not animate, and each held layer shows by itself after a while.
 */
export function holdAgentCreations(store: EditorStore): CreationHold {
  if (!agentAnimationsEnabled.value) return { stop: () => undefined, release: () => undefined }
  const created = new Set<string>()
  const held: string[] = []
  const stopListening = store.onEditorEvent('node:created', (node) => {
    created.add(node.id)
    if (held.length >= MAX_HELD_LAYERS || (node.parentId && created.has(node.parentId))) return
    held.push(node.id)
    holdOnCanvas(store, [node.id])
  })
  return {
    stop: stopListening,
    release: () => {
      stopListening()
      releaseOnCanvas(store, held)
    }
  }
}
