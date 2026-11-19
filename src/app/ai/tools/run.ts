import type { DocumentChange, PageSnapshot } from '@kalka/core/editor'
import type { StepBudget } from '@kalka/core/tools'
import type { UndoEntry } from '@kalka/scene-graph/undo'
import type { AgentEdit } from '@kalka/vue'

import { describeUndoneCalls, type CallRef } from '@/app/ai/chat/context'
import { DEFAULT_AGENT_STEPS, resolveAgentStepLimit } from '@/app/ai/chat/step-limit'
import type { PreviewFocus } from '@/app/ai/preview/canvas'
import { getActiveEditorStore } from '@/app/editor/active-store'
import type { EditorStore } from '@/app/editor/active-store'
import {
  finishWorking,
  keepWorking,
  markWorking,
  recordLayerActivity
} from '@/app/presence/activity'
import { placeAgent, showAgentEdit, stopCursorSweep } from '@/app/presence/edit-effect'
import { addAgent, agentPlacement, type AgentHandle } from '@/app/presence/registry'

/**
 * One reply's run: the page it works on, its step budget, and the edits it made. It ends once,
 * finished, stopped, or failed; a tool that was already running finishes into the run it
 * started in, even after that run ended, so its edit stays part of that reply.
 */
/** An undo entry one of a run's tool calls pushed. */
export interface RunUndoCall extends CallRef {
  entry: UndoEntry
}

/** The label of an AI tool call's undo entry, which Edit → Undo shows. */
export function aiUndoLabel(tool: string): string {
  return `AI: ${tool}`
}

export class Run {
  currentSteps = 0
  /** Captured for the message in progress; settings changes apply to the next one. */
  readonly maxSteps: number
  /** The page the run works on. The user's navigation does not move it; the agent's does. */
  pageId: string
  /** Each page as it was before the run first edited it, for `diff_changes`. */
  readonly baselines = new Map<string, PageSnapshot>()
  /** Undo entries the run's edits pushed, oldest first, with the calls that pushed them. */
  readonly undoCalls: RunUndoCall[] = []
  /** The run's own calls the model was told the user undid while the run went on. */
  readonly reportedUndone = new Set<string>()
  /** Tool calls that changed the document, which a stopped reply's transcript reports. */
  readonly changedCalls = new Set<string>()
  /** False once the reply finished, was stopped, or failed; its agent no longer moves. */
  active = true
  private toolsInFlight = 0
  private whenSettled: Promise<void> = Promise.resolve()
  private settle: () => void = () => undefined

  constructor(maxSteps: number, pageId: string) {
    this.maxSteps = resolveAgentStepLimit(maxSteps)
    this.pageId = pageId
  }

  hitLimit(): boolean {
    return this.currentSteps >= this.maxSteps
  }

  /** A tool started editing for this run; `settled` waits until every such tool is done. */
  beginTool(): void {
    if (this.toolsInFlight++ === 0) {
      this.whenSettled = new Promise((resolve) => {
        this.settle = resolve
      })
    }
  }

  endTool(): void {
    if (--this.toolsInFlight === 0) this.settle()
  }

  /** Resolves once no tool of this run is still editing. */
  settled(): Promise<void> {
    return this.whenSettled
  }
}

class RunState {
  run = new Run(DEFAULT_AGENT_STEPS, '')
  /** The chat's agent as other people see it; one per lane, kept between replies. */
  agent: AgentHandle | null = null
}

/**
 * The lane of the document's main chat. Named agents the person adds each run in a lane of
 * their own, named after them, so their runs, steps and edits never mix with the main chat's.
 */
export const LEAD_LANE = 'lead'

const runStates = new WeakMap<EditorStore, Map<string, RunState>>()

function getRunState(store?: EditorStore, lane = LEAD_LANE): RunState {
  const target = store ?? getActiveEditorStore()
  let lanes = runStates.get(target)
  if (!lanes) {
    lanes = new Map()
    runStates.set(target, lanes)
  }
  const existing = lanes.get(lane)
  if (existing) return existing
  const created = new RunState()
  lanes.set(lane, created)
  return created
}

/**
 * Begin a run on the page the user is viewing, as a message is sent. A named lane's agent goes
 * by the lane's name; the main chat's picks a callsign.
 */
export function startRun(
  store: EditorStore,
  maxSteps: number,
  model?: string,
  lane = LEAD_LANE
): Run {
  const state = getRunState(store, lane)
  const pageId = store.state.currentPageId
  state.run = new Run(maxSteps, pageId)
  state.agent ??= addAgent(store, 'chat', model, lane === LEAD_LANE ? undefined : lane)
  state.agent.update({ status: 'thinking', model, pageId })
  return state.run
}

/**
 * The reply finished, failed, or was stopped: the agent stays listed but leaves the canvas.
 * Only the first call counts, and a later run is not ended by an earlier one's late call.
 */
export function endRun(store: EditorStore, run?: Run, lane = LEAD_LANE): void {
  const state = getRunState(store, lane)
  run ??= state.run
  if (!run.active) return
  run.active = false
  if (state.run !== run) return
  if (state.agent) {
    stopCursorSweep(state.agent)
    // The reply is over, so is its work: nothing stays marked as being built.
    finishWorking(store, state.agent)
  }
  state.agent?.update({
    status: 'idle',
    note: undefined,
    cursor: undefined,
    selection: undefined,
    outline: undefined
  })
}

/** The run of the reply in progress, or of the last one. */
export function currentRun(store: EditorStore, lane = LEAD_LANE): Run {
  return getRunState(store, lane).run
}

/** A named agent leaves: its reply ends and it leaves the canvas and the presence list. */
export function dropLane(store: EditorStore, lane: string): void {
  if (lane === LEAD_LANE) return
  const state = runStates.get(store)?.get(lane)
  if (!state) return
  endRun(store, state.run, lane)
  state.agent?.remove()
  runStates.get(store)?.delete(lane)
}

/** Whether the agent may still show where it works: its run is the latest and still going. */
function agentAtWork(store: EditorStore, lane: string): AgentHandle | null {
  const { agent, run } = getRunState(store, lane)
  return run.active ? agent : null
}

/**
 * Point the run's agent at JSX it is still streaming: the element that appeared last, with
 * outlines of what it builds, until the tool runs and `markRunWork` names the real layers.
 */
export function markRunPreview(store: EditorStore, focus: PreviewFocus, lane = LEAD_LANE): void {
  const agent = agentAtWork(store, lane)
  if (!agent) return
  const pageId = runPageId(store, lane)
  placeAgent(
    agent,
    { pageId, cursor: { ...focus.cursor, pageId }, selection: undefined, outline: focus.outline },
    { status: 'editing' }
  )
}

/** Point the run's agent at nodes a tool just created or changed. */
export function markRunWork(store: EditorStore, nodeIds: string[], lane = LEAD_LANE): void {
  const agent = agentAtWork(store, lane)
  const placement = agentPlacement(store, nodeIds, runPageId(store, lane))
  if (!agent || !placement) return
  placeAgent(agent, placement, { status: 'editing' })
}

/**
 * Point the run's agent at the layers a call changed, on whichever page they are, for calls such
 * as `eval` whose result names none. Only the outermost of them are outlined.
 */
export function markRunChange(store: EditorStore, change: DocumentChange, lane = LEAD_LANE): void {
  const { graph } = store
  const layers = new Set(
    [...change.created.map((node) => node.id), ...change.updated.map((update) => update.id)].filter(
      // Pages and the document root are where the agent works, not what it works on.
      (id) => id !== graph.rootId && graph.getNode(id)?.type !== 'CANVAS'
    )
  )
  const outermost = [...layers].filter((id) => {
    const parentId = graph.getNode(id)?.parentId
    return !parentId || !layers.has(parentId)
  })
  markRunWork(store, outermost, lane)
}

/** Replay a tool's edit on the canvas, with the run's agent moving through what it touched. */
export function showRunEdit(
  store: EditorStore,
  edit: AgentEdit,
  touched: readonly string[],
  lane = LEAD_LANE
): void {
  showAgentEdit(store, edit, {
    agent: getRunState(store, lane).agent,
    touched,
    pageId: runPageId(store, lane)
  })
}

/** The run's agent read these layers. */
export function recordRunReads(
  store: EditorStore,
  nodeIds: readonly string[],
  lane = LEAD_LANE
): void {
  const agent = agentAtWork(store, lane)
  if (!agent) return
  recordLayerActivity(store, agent, 'read', nodeIds)
  keepWorking(store, agent)
}

/** The run's agent wrote `written`, and builds `worked` until it finishes or its reply ends. */
export function recordRunWrites(
  store: EditorStore,
  written: readonly string[],
  worked: readonly string[],
  lane = LEAD_LANE
): void {
  const agent = agentAtWork(store, lane)
  if (!agent) return
  recordLayerActivity(store, agent, 'write', written)
  markWorking(store, agent, worked)
  keepWorking(store, agent)
}

/** The name the run's agent goes by, which its comment replies carry. */
export function runAgentName(store: EditorStore, lane = LEAD_LANE): string | undefined {
  return getRunState(store, lane).agent?.name
}

/** The run's agent says what it is doing now, shown by its name; an empty text clears it. */
export function setRunStatus(store: EditorStore, text: string, lane = LEAD_LANE): void {
  getRunState(store, lane).agent?.update({ note: text || undefined })
}

/** The run's agent is done with `nodeIds`, or all it builds; returns what it let go of. */
export function finishRunWork(
  store: EditorStore,
  nodeIds: readonly string[] | null,
  lane = LEAD_LANE
): string[] {
  const agent = getRunState(store, lane).agent
  return agent ? finishWorking(store, agent, nodeIds) : []
}

export function recordStep(store?: EditorStore, lane = LEAD_LANE): void {
  getRunState(store, lane).run.currentSteps++
}

export function stepBudget(store: EditorStore, lane = LEAD_LANE): StepBudget {
  const { currentSteps, maxSteps } = getRunState(store, lane).run
  return { current: currentSteps, max: maxSteps }
}

export function didHitStepLimit(store?: EditorStore, lane = LEAD_LANE): boolean {
  return getRunState(store, lane).run.hitLimit()
}

/** The run's page, or the viewed page when no run has started or its page was deleted. */
export function runPageId(store: EditorStore, lane = LEAD_LANE): string {
  const { pageId } = getRunState(store, lane).run
  return pageId && store.graph.getNode(pageId)?.type === 'CANVAS'
    ? pageId
    : store.state.currentPageId
}

/** Move the run to `pageId`, and the user's view with it, as the agent's `switch_page` does. */
export async function moveRunToPage(
  store: EditorStore,
  run: Run,
  pageId: string,
  lane = LEAD_LANE
): Promise<void> {
  // A stopped reply's late `switch_page` no longer takes the view anywhere.
  if (!run.active) return
  run.pageId = pageId
  getRunState(store, lane).agent?.update({ pageId })
  if (store.state.currentPageId !== pageId) await store.switchPage(pageId)
}

/** The built-in chat's agent in this document, once it has replied. */
export function runAgentId(store: EditorStore, lane = LEAD_LANE): string | undefined {
  return getRunState(store, lane).agent?.id
}

/** Keep `snapshot` as the run's starting state of its page unless the run already edited it. */
export function recordRunBaseline(run: Run, snapshot: PageSnapshot): void {
  const pageId = snapshot.values().next().value?.id
  if (pageId && !run.baselines.has(pageId)) run.baselines.set(pageId, snapshot)
}

export function runBaseline(
  store: EditorStore,
  pageId: string,
  lane = LEAD_LANE
): PageSnapshot | null {
  return getRunState(store, lane).run.baselines.get(pageId) ?? null
}

/**
 * Note the entry an edit just pushed, if it carries the run's label (`AI: <tool>`). An edit that
 * changed nothing pushes none, so the entry on top before it, `previous`, is not the edit's.
 */
export function recordRunUndoEntry(
  store: EditorStore,
  run: Run,
  call: CallRef,
  previous: UndoEntry | undefined
): void {
  const entry = store.undo.peekUndo()
  if (
    entry &&
    entry !== previous &&
    entry.label === aiUndoLabel(call.tool) &&
    !run.undoCalls.some((recorded) => recorded.entry === entry)
  ) {
    run.undoCalls.push({ ...call, entry })
  }
}

export function runUndoEntries(store: EditorStore, lane = LEAD_LANE): readonly UndoEntry[] {
  return getRunState(store, lane).run.undoCalls.map(({ entry }) => entry)
}

/**
 * A note for the run's next tool result when the user undid or redid some of the run's own
 * edits since the model last heard; empty when nothing changed. Taking it counts as telling.
 */
export function takeRunUndoNote(store: EditorStore, run = currentRun(store)): string {
  const undone: CallRef[] = []
  const redone: CallRef[] = []
  for (const { entry, tool, toolCallId } of run.undoCalls) {
    const state = store.undo.stateOf(entry)
    if (state === 'undone' && !run.reportedUndone.has(toolCallId)) {
      undone.push({ tool, toolCallId })
      run.reportedUndone.add(toolCallId)
    } else if (state === 'applied' && run.reportedUndone.has(toolCallId)) {
      redone.push({ tool, toolCallId })
      run.reportedUndone.delete(toolCallId)
    }
  }
  return describeUndoneCalls({ undone, redone })
}
