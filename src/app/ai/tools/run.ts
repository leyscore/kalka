import type { StepBudget } from '@open-pencil/core/tools'

import { DEFAULT_AGENT_STEPS, resolveAgentStepLimit } from '@/app/ai/chat/step-limit'
import { getActiveEditorStore } from '@/app/editor/active-store'
import type { EditorStore } from '@/app/editor/active-store'

class RunState {
  currentSteps = 0
  /** Captured for the message in progress; settings changes apply to the next one. */
  maxSteps = DEFAULT_AGENT_STEPS
  /** The page the run works on. The user's navigation does not move it; the agent's does. */
  pageId: string | null = null

  start(maxSteps: number, pageId: string): void {
    this.currentSteps = 0
    this.maxSteps = resolveAgentStepLimit(maxSteps)
    this.pageId = pageId
  }

  hitLimit(): boolean {
    return this.currentSteps >= this.maxSteps
  }
}

const runStates = new WeakMap<EditorStore, RunState>()

function getRunState(store?: EditorStore): RunState {
  const target = store ?? getActiveEditorStore()
  const existing = runStates.get(target)
  if (existing) return existing
  const created = new RunState()
  runStates.set(target, created)
  return created
}

/** Begin a run on the page the user is viewing. */
export function startRun(store: EditorStore, maxSteps: number): void {
  getRunState(store).start(maxSteps, store.state.currentPageId)
}

export function recordStep(store?: EditorStore): void {
  getRunState(store).currentSteps++
}

export function stepBudget(store: EditorStore): StepBudget {
  const { currentSteps, maxSteps } = getRunState(store)
  return { current: currentSteps, max: maxSteps }
}

export function didHitStepLimit(store?: EditorStore): boolean {
  return getRunState(store).hitLimit()
}

/** The run's page, or the viewed page when no run has started or its page was deleted. */
export function runPageId(store: EditorStore): string {
  const { pageId } = getRunState(store)
  return pageId && store.graph.getNode(pageId)?.type === 'CANVAS'
    ? pageId
    : store.state.currentPageId
}

/** Move the run to `pageId`, and the user's view with it, as the agent's `switch_page` does. */
export async function moveRunToPage(store: EditorStore, pageId: string): Promise<void> {
  getRunState(store).pageId = pageId
  if (store.state.currentPageId !== pageId) await store.switchPage(pageId)
}
