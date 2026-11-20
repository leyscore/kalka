import type { DocumentChange } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'
import { planReveal, revealEnd, type AgentEdit, type RevealStep } from '@kalka/vue'

import type { EditorStore } from '@/app/editor/active-store'
import { flyToCreation } from '@/app/presence/fly-to-work'
import { agentAnimationsEnabled } from '@/app/shell/motion'

import { holdOnCanvas, releaseOnCanvas, revealOnCanvas, showAgentSkeletons } from './canvas-scene'
import type { AgentHandle } from './registry'
import { SKELETON_EXIT_MS, type AgentSkeleton } from './skeletons'

/** New layers one edit keeps hidden until its reveal; the outermost come first. */
export const MAX_HELD_LAYERS = 64
/**
 * An agent's edit waits at most this long for its previous edits to finish revealing, so edits
 * play one after another instead of over each other, and a fast agent never falls far behind.
 * Held layers show by themselves after a few seconds, which this stays well within.
 */
export const MAX_REVEAL_QUEUE_MS = 2000
/** A new layer shows as a skeleton block this long before its content fades in. */
export const SKELETON_LEAD_MS = 400

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

/** When each agent's queued reveals end, on the `performance.now()` clock. */
const revealQueues = new WeakMap<AgentHandle, number>()

/** Forgets an agent's queued reveals, as when its run ends. */
export function stopAgentReveals(agent: AgentHandle): void {
  revealQueues.delete(agent)
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
  revealQueues.set(agent, now + wait + SKELETON_LEAD_MS + revealEnd(steps))
  return wait
}

/**
 * When each block of an edit starts loading, in painter's order: a block waits until the block
 * holding it has started to show its content, so a frame's background is there before what sits
 * on it, the page's first and the cards last. Steps come in document order, parents first, and
 * keep at least the delay they were planned with.
 */
export function paintersOrder(graph: SceneGraph, steps: readonly RevealStep[]): RevealStep[] {
  const contentAt = new Map<string, number>()
  const ordered: RevealStep[] = []
  for (const step of steps) {
    let holder = graph.getNode(step.id)?.parentId
    while (holder && !contentAt.has(holder)) holder = graph.getNode(holder)?.parentId
    const delay = Math.max(step.delay, holder ? (contentAt.get(holder) ?? 0) : 0)
    contentAt.set(step.id, delay + SKELETON_LEAD_MS)
    ordered.push({ ...step, delay })
  }
  return ordered
}

/**
 * A skeleton block for each layer that appears: it shows at the layer's turn and fades as the
 * layer's content fades in `SKELETON_LEAD_MS` later.
 */
export function revealSkeletons(
  steps: readonly RevealStep[],
  owner: string,
  start: number
): AgentSkeleton[] {
  return steps
    .filter((step) => step.kind === 'appear')
    .map((step) => ({
      key: `${owner}:${step.id}`,
      nodeId: step.id,
      from: start + step.delay,
      until: start + step.delay + SKELETON_LEAD_MS,
      fade: SKELETON_EXIT_MS
    }))
}

/**
 * Show an agent's edit as it happens: after its earlier edits have played, its new blocks load
 * one by one in painter's order, top to bottom and each frame's background before what it holds,
 * each first a skeleton that then fades into its content. Only the canvas animates: the document already holds the whole edit, and nothing
 * here waits, so the tool's result is never delayed.
 */
export function showAgentEdit(
  store: EditorStore,
  edit: AgentEdit,
  options: { agent?: AgentHandle | null }
): void {
  try {
    flyToCreation(store, edit.created)
    const reducedMotion = !agentAnimationsEnabled.value
    const planned = paintersOrder(
      store.graph,
      planReveal(store.graph, edit, { reducedMotion, typing: false, blocks: true })
    )
    const now = performance.now()
    const owner = options.agent?.id ?? 'agent'
    const wait = queueReveal(options.agent, planned, now)
    const steps = planned.map((step) => ({
      ...step,
      delay: step.delay + wait + SKELETON_LEAD_MS
    }))
    revealOnCanvas(store, steps)
    showAgentSkeletons(store, revealSkeletons(planned, owner, now + wait), now)
    // New layers the reveal leaves out, past its limit or hidden, show now.
    const revealed = new Set(steps.map((step) => step.id))
    releaseOnCanvas(
      store,
      edit.created.filter((id) => !revealed.has(id))
    )
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
