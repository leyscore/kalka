import { tool } from 'ai'
import { isPlainObject } from 'es-toolkit'

import { graphFromPageSnapshot, isEmptyPageChange } from '@kalka/core/editor'
import type { FigmaAPI } from '@kalka/core/figma-api'
import {
  registerComponentCatalog,
  isAtomicTool,
  toolChangesDocument,
  toolsToAI,
  type ToolDef
} from '@kalka/core/tools'

import { makeFigmaFromStore } from '@/app/automation/bridge/figma-factory'
import { executeAtomicEditorTool } from '@/app/automation/execution/editor'
import { recordToolCompleted, type AIDiagnosticContext } from '@/app/diagnostics/events/ai'
import type { EditorStore } from '@/app/editor/active-store'
import { ensureGraphFonts } from '@/app/editor/fonts'
import { useLibraryService } from '@/app/libraries'
import { agentEditFromChange } from '@/app/presence/edit-effect'

import { aiToolDefinitions } from './catalog'
import { recordToolChange } from './changes/capture'
import { createMutex } from './mutex'
import {
  aiUndoLabel,
  currentRun,
  markRunWork,
  moveRunToPage,
  recordRunBaseline,
  recordRunUndoEntry,
  runBaseline,
  runPageId,
  showRunEdit,
  stepBudget,
  takeRunUndoNote
} from './run'

export {
  currentRun,
  didHitStepLimit,
  endRun,
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

export function createAITools(store: EditorStore, diagnosticContext?: AIDiagnosticContext) {
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

  /** Runs one call; an edit is snapshotted, recorded for undo, and shown where it happened. */
  async function executeCall(
    def: ToolDef,
    figma: FigmaAPI,
    args: Record<string, unknown>,
    { toolCallId }: { toolCallId: string }
  ): Promise<unknown> {
    const pageId = figma.currentPageId
    if (!def.mutates) return def.execute(figma, args)
    // The call belongs to the reply that made it, even if a later one starts meanwhile.
    const run = currentRun(store)
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
    const undoBefore = store.undo.peekUndo()
    const finishChange = store.capturePageChange(pageId)
    try {
      return await runTool(def, figma, args, pageId)
    } finally {
      const change = finishChange()
      if (!isEmptyPageChange(change)) run.changedCalls.add(toolCallId)
      // Atomic tools record their own undo entry; an edit that changed nothing records none.
      if (!isAtomicTool(def) && !isEmptyPageChange(change)) {
        store.pushUndoEntry({
          label: aiUndoLabel(def.name),
          forward: () => store.restorePageChange(change, 'after'),
          inverse: () => store.restorePageChange(change, 'before')
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
        showRunEdit(
          store,
          agentEditFromChange(change),
          change.updated.map((update) => update.id)
        )
      }
      try {
        // `switch_page` moves the run, and the user's view with it.
        if (figma.currentPageId !== pageId) {
          await moveRunToPage(store, run, figma.currentPageId)
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
        const figma = makeFigmaFromStore(store, runPageId(store))
        figma.changeBaseline = (pageId) => {
          const baseline = runBaseline(store, pageId)
          return baseline ? graphFromPageSnapshot(store.graph, baseline) : null
        }
        return figma
      },
      executeTool: async (def, figma, args, options) =>
        withUndoNote(await executeCall(def, figma, args, options), takeRunUndoNote(store)),
      onAfterExecute: (def) => {
        if (def.mutates && !isAtomicTool(def)) store.requestRender()
      },
      onFlashNodes: (nodeIds) => {
        markRunWork(store, nodeIds)
        store.renderer?.aiClearActive()
        if (nodeIds.length > 0) {
          store.aiFlashDone(nodeIds)
        }
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
      getStepBudget: () => stepBudget(store)
    },
    { tool }
  )
}

export type AITools = ReturnType<typeof createAITools>
