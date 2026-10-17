import type { PageChange } from '@kalka/core/editor'
import { planReveal, type AgentEdit, type RevealStep } from '@kalka/vue'

import type { EditorStore } from '@/app/editor/active-store'
import { animationsEnabled } from '@/app/shell/motion'

import { revealOnCanvas } from './canvas-scene'
import { agentPlacement, type AgentHandle } from './registry'

/** The agent's cursor visits at most this many layers per edit. */
export const MAX_CURSOR_STOPS = 6
/** Between two layers an edit changed without revealing anything, such as recolored ones. */
export const CURSOR_STOP_MS = 150

/** What an edit created and which text it wrote, from what it changed on its page. */
export function agentEditFromChange(change: PageChange): AgentEdit {
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

const sweeps = new WeakMap<AgentHandle, ReturnType<typeof setTimeout>[]>()

/** Stops moving an agent's cursor through an edit, as when its run ends or a new edit starts. */
export function stopCursorSweep(agent: AgentHandle): void {
  for (const timer of sweeps.get(agent) ?? []) clearTimeout(timer)
  sweeps.delete(agent)
}

function sweepCursor(
  store: EditorStore,
  agent: AgentHandle,
  stops: readonly CursorStop[],
  pageId: string
): void {
  stopCursorSweep(agent)
  if (stops.length === 0) return
  const timers = stops.map((stop) =>
    setTimeout(() => {
      const placement = agentPlacement(store, [stop.id], pageId)
      if (placement) agent.update({ status: 'editing', ...placement })
    }, stop.at)
  )
  sweeps.set(agent, timers)
}

/**
 * Show an agent's edit as it happens: its cursor moves through what it touched, new layers
 * appear in order and text types itself out. Only the canvas animates: the document already
 * holds the whole edit, and nothing here waits, so the tool's result is never delayed.
 */
export function showAgentEdit(
  store: EditorStore,
  edit: AgentEdit,
  options: { agent?: AgentHandle | null; touched?: readonly string[]; pageId: string }
): void {
  try {
    const reducedMotion = !animationsEnabled.value
    const steps = planReveal(store.graph, edit, { reducedMotion })
    revealOnCanvas(store, steps)
    if (!options.agent) return
    const stops = cursorStops(steps, options.touched ?? [], { reducedMotion })
    sweepCursor(store, options.agent, stops, options.pageId)
  } catch (error) {
    // Showing the edit is decoration; it must never turn a finished edit into a failed call.
    console.warn('[Agent edit effect]', error)
  }
}
