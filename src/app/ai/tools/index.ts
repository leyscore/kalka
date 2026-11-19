import { tool } from 'ai'
import { isPlainObject } from 'es-toolkit'

import { graphFromPageSnapshot, isEmptyDocumentChange } from '@kalka/core/editor'
import type { FigmaAPI } from '@kalka/core/figma-api'
import {
  registerComponentCatalog,
  isAtomicTool,
  toolChangesDocument,
  toolsToAI,
  type ToolDef
} from '@kalka/core/tools'

import { targetNodeIds, touchedNodeIds } from '@/app/automation/agents'
import { attachCanvasKit, makeFigmaFromStore } from '@/app/automation/bridge/figma-factory'
import { executeAtomicEditorTool } from '@/app/automation/execution/editor'
import { recordToolCompleted, type AIDiagnosticContext } from '@/app/diagnostics/events/ai'
import { noteAgentEdit } from '@/app/document/versions/bursts'
import type { EditorStore } from '@/app/editor/active-store'
import { ensureGraphFonts } from '@/app/editor/fonts'
import { useLibraryService } from '@/app/libraries'
import { workedLayers, writtenLayers } from '@/app/presence/activity'
import { frameHeldMessage, heldByOtherAgent } from '@/app/presence/claims'
import { agentEditFromChange, holdAgentCreations } from '@/app/presence/edit-effect'

import { aiToolDefinitions } from './catalog'
import { recordToolChange } from './changes/capture'
import { createMutex } from './mutex'
import {
  aiUndoLabel,
  currentRun,
  LEAD_LANE,
  runAgentId,
  finishRunWork,
  runAgentName,
  setRunStatus,
  markRunChange,
  markRunWork,
  moveRunToPage,
  recordRunBaseline,
  recordRunReads,
  recordRunUndoEntry,
  recordRunWrites,
  runBaseline,
  runPageId,
  showRunEdit,
  stepBudget,
  takeRunUndoNote
} from './run'

export {
  currentRun,
  didHitStepLimit,
  dropLane,
  endRun,
  LEAD_LANE,
  markRunPreview,
  recordStep,
  runAgentId,
  runPageId,
  runUndoEntries,
  startRun
} from './run'

/**
 * A result with the run's note about edits the user undid meanwhile, so the model does not
 * build on them; other results stay as they are.
 */
function withUndoNote(result: unknown, note: string): unknown {
  if (!note) return result
  return isPlainObject(result) ? { ...result, undoNote: note } : { result, undoNote: note }
}

/**
 * The tools a chat's agent calls. `lane` is the agent's: the main chat's, or a named agent's,
 * whose runs, edits and presence stay apart from the others'.
 */
export function createAITools(
  store: EditorStore,
  diagnosticContext?: AIDiagnosticContext,
  lane = LEAD_LANE
) {
  const acquireMutation = createMutex()
  const libraryService = useLibraryService()
  libraryService.bindEditor(store)
  registerComponentCatalog(store.graph, libraryService)

  async function runTool(
    def: ToolDef,
    figma: FigmaAPI,
    args: Record<string, unknown>,
    pageId: string
  ): Promise<unknown> {
    if (isAtomicTool(def)) {
      return executeAtomicEditorTool(store, figma, def, args, { label: 'AI' })
    }
    return store.runMutationWithLayout(
      () => def.execute(figma, args),
      pageId,
      async () => {
        const pageNode = store.graph.getNode(pageId)
        if (pageNode) await ensureGraphFonts(store.graph, pageNode.childIds, store.renderer)
      }
    )
  }

  /** Refuses an edit inside a frame another agent is building, naming that agent. */
  function frameHeldError(args: Record<string, unknown>): { error: string } | null {
    const parent = typeof args.parent_id === 'string' ? [args.parent_id] : []
    const targets = [...targetNodeIds(store, args), ...parent]
    const held = heldByOtherAgent(store, runAgentId(store, lane), targets)
    return held ? { error: frameHeldMessage(held) } : null
  }

  /** Runs one call; an edit is snapshotted, recorded for undo, and shown where it happened. */
  async function executeCall(
    def: ToolDef,
    figma: FigmaAPI,
    args: Record<string, unknown>,
    { toolCallId }: { toolCallId: string }
  ): Promise<unknown> {
    const pageId = figma.currentPageId
    if (!def.mutates) {
      // Set by the host hook, which TypeScript cannot see run.
      const call = { released: false }
      figma.finishWorking = (ids) => {
        call.released = true
        return finishRunWork(store, ids, lane)
      }
      figma.setAgentStatus = (text) => setRunStatus(store, text, lane)
      figma.commentAuthorName = runAgentName(store, lane)
      const result = await def.execute(figma, args)
      // Letting go of layers is not reading them.
      if (!call.released) recordRunReads(store, touchedNodeIds(store, args, result), lane)
      return result
    }
    // The call belongs to the reply that made it, even if a later one starts meanwhile.
    const run = currentRun(store, lane)
    // Another agent is building the frame this call edits: it waits or works elsewhere.
    const held = toolChangesDocument(def) ? frameHeldError(args) : null
    if (held) return held
    // A step's calls may run concurrently; whole-page snapshots must not interleave.
    const release = await acquireMutation()
    // Stopped while waiting for its turn: the reply is over, so nothing more is edited.
    if (!run.active) {
      release()
      return { error: 'Stopped before this call ran; nothing was changed.' }
    }
    run.beginTool()
    // The run's first edit to a page keeps the whole page, which `changeBaseline` diffs.
    if (toolChangesDocument(def) && !run.baselines.has(pageId)) {
      recordRunBaseline(run, store.snapshotPage(pageId))
    }
    // The agent's change keeps the page as it was, so it can be put back from its list.
    if (toolChangesDocument(def)) noteAgentEdit(store, runAgentName(store, lane) ?? 'Agent', pageId)
    const undoBefore = store.undo.peekUndo()
    const finishChange = store.captureDocumentChange(pageId)
    // The agent's new layers stay hidden until the edit's reveal plays them in.
    const hold = toolChangesDocument(def) ? holdAgentCreations(store) : null
    try {
      return await runTool(def, figma, args, pageId)
    } catch (error) {
      hold?.release()
      throw error
    } finally {
      hold?.stop()
      const change = finishChange()
      if (!isEmptyDocumentChange(change)) run.changedCalls.add(toolCallId)
      // Atomic tools record their own undo entry; an edit that changed nothing records none.
      if (!isAtomicTool(def) && !isEmptyDocumentChange(change)) {
        store.pushUndoStep({
          label: aiUndoLabel(def.name),
          forward: () => store.restoreDocumentChange(change, 'after'),
          inverse: () => store.restoreDocumentChange(change, 'before')
        })
      }
      // Every entry the run pushes belongs to its turn; atomic and page edits both label
      // their entries this way. View tools change nothing on the page and push none.
      recordRunUndoEntry(store, run, { tool: def.name, toolCallId }, undoBefore)
      // View tools (selection, viewport, pages) cannot change the document.
      if (toolChangesDocument(def)) {
        try {
          recordToolChange(store, toolCallId, change)
        } catch (error) {
          // The change record is a review aid; the edit and its undo entry already stand.
          console.warn('Could not record AI tool change', error)
        }
        recordRunWrites(
          store,
          writtenLayers(change),
          workedLayers(store.graph, change, targetNodeIds(store, args)),
          lane
        )
        showRunEdit(store, agentEditFromChange(change), lane)
        // The agent shows where it edited, even on another page; layers the result names
        // refine this once the call returns.
        markRunChange(store, change, lane)
      }
      try {
        // `switch_page` moves the run, and the user's view with it.
        if (figma.currentPageId !== pageId) {
          await moveRunToPage(store, run, figma.currentPageId, lane)
        }
      } finally {
        release()
        run.endTool()
      }
    }
  }

  return toolsToAI(
    aiToolDefinitions,
    {
      getFigma: () => {
        const figma = makeFigmaFromStore(store, runPageId(store, lane))
        figma.changeBaseline = (pageId) => {
          const baseline = runBaseline(store, pageId, lane)
          return baseline ? graphFromPageSnapshot(store.graph, baseline) : null
        }
        return figma
      },
      executeTool: async (def, figma, args, options) => {
        await attachCanvasKit(store, figma)
        return withUndoNote(
          await executeCall(def, figma, args, options),
          takeRunUndoNote(store, currentRun(store, lane))
        )
      },
      onAfterExecute: (def) => {
        if (def.mutates && !isAtomicTool(def)) store.requestRender()
      },
      onFlashNodes: (nodeIds) => {
        // The reveal and the work marks show the edit; the agent ends up pointing at it.
        markRunWork(store, nodeIds, lane)
      },
      onToolLog: (entry) => {
        recordToolCompleted(
          {
            tool: entry.tool,
            durationMs: entry.durationMs,
            mutates: entry.mutates,
            failed: Boolean(entry.error)
          },
          diagnosticContext,
          entry.cause
        )
      },
      getStepBudget: () => stepBudget(store, lane)
    },
    { tool }
  )
}

export type AITools = ReturnType<typeof createAITools>
