import { tool } from 'ai'

import { registerComponentCatalog, isAtomicTool, toolsToAI } from '@open-pencil/core/tools'

import { makeFigmaFromStore } from '@/app/automation/bridge/figma-factory'
import { executeAtomicEditorTool } from '@/app/automation/execution/editor'
import { recordToolCompleted, type AIDiagnosticContext } from '@/app/diagnostics/events/ai'
import type { EditorStore } from '@/app/editor/active-store'
import { ensureGraphFonts } from '@/app/editor/fonts'
import { useLibraryService } from '@/app/libraries'

import { aiToolDefinitions } from './catalog'
import { markRunWork, moveRunToPage, runPageId, stepBudget } from './run'

export { didHitStepLimit, endRun, recordStep, runPageId, startRun } from './run'

export function createAITools(store: EditorStore, diagnosticContext?: AIDiagnosticContext) {
  let before: { pageId: string; snapshot: ReturnType<EditorStore['snapshotPage']> } | null = null
  const libraryService = useLibraryService()
  libraryService.bindEditor(store)
  registerComponentCatalog(store.graph, libraryService)

  return toolsToAI(
    aiToolDefinitions,
    {
      getFigma: () => makeFigmaFromStore(store, runPageId(store)),
      executeTool: async (def, figma, args) => {
        const pageId = figma.currentPageId
        try {
          if (isAtomicTool(def)) {
            return await executeAtomicEditorTool(store, figma, def, args, { label: 'AI' })
          }
          if (!def.mutates) return await def.execute(figma, args)
          before = { pageId, snapshot: store.snapshotPage(pageId) }
          return await store.runMutationWithLayout(
            () => def.execute(figma, args),
            pageId,
            async () => {
              const pageNode = store.graph.getNode(pageId)
              if (pageNode) await ensureGraphFonts(store.graph, pageNode.childIds, store.renderer)
            }
          )
        } finally {
          // `switch_page` moves the run, and the user's view with it.
          if (figma.currentPageId !== pageId) await moveRunToPage(store, figma.currentPageId)
        }
      },
      onAfterExecute: async (def) => {
        if (isAtomicTool(def)) return
        if (def.mutates) {
          store.requestRender()
          if (before) {
            const { pageId, snapshot } = before
            const after = store.snapshotPage(pageId)
            store.pushUndoEntry({
              label: `AI: ${def.name}`,
              forward: () => store.restorePageFromSnapshot(after),
              inverse: () => store.restorePageFromSnapshot(snapshot)
            })
            before = null
          }
        }
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
          diagnosticContext
        )
      },
      getStepBudget: () => stepBudget(store)
    },
    { tool }
  )
}

export type AITools = ReturnType<typeof createAITools>
