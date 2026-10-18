import { resolveAutomationTarget } from '@/app/automation/bridge/target'
import type { EditorStore } from '@/app/editor/active-store'
import { getTabById } from '@/app/tabs'

import { webmcpMode } from './preferences'
import { createWebMCPRuntimeService } from './service'

const service = createWebMCPRuntimeService()
export const webmcpRuntime = service.state

function importToolCode() {
  return Promise.all([
    import('@/app/automation/bridge/figma-factory'),
    import('@/app/automation/bridge/tool-handlers'),
    import('@/app/automation/execution/editor')
  ]).then(
    ([{ makeFigmaFromStore }, { createAutomationToolHandler }, { executeAtomicEditorTool }]) => ({
      makeFigmaFromStore,
      executeAtomicEditorTool,
      handleTool: createAutomationToolHandler(makeFigmaFromStore)
    })
  )
}

let toolCode: ReturnType<typeof importToolCode> | null = null

/** The tool handlers, which load with the first call: most browsers never make one. */
function loadToolCode() {
  toolCode ??= importToolCode()
  return toolCode
}

/** Browser-native tools reuse the same editor targeting and handlers as remote MCP. */
export function startWebMCP(getStore: () => EditorStore): () => void {
  return service.start(
    typeof document === 'undefined' ? undefined : document.modelContext,
    webmcpMode,
    () => {
      const target = resolveAutomationTarget(getStore(), undefined)
      if (getTabById(target.documentId)?.kind !== 'document') {
        throw new Error('Open a document before using WebMCP tools')
      }
      return {
        execute: async (def, args, signal) => {
          signal.throwIfAborted()
          const { makeFigmaFromStore, executeAtomicEditorTool, handleTool } = await loadToolCode()
          signal.throwIfAborted()
          if (def.mutates) {
            return {
              ok: true,
              result: await executeAtomicEditorTool(
                target.store,
                makeFigmaFromStore(target.store, target.pageId),
                def,
                args,
                {
                  signal,
                  label: 'WebMCP',
                  isLive: () => getTabById(target.documentId)?.store === target.store
                }
              )
            }
          }
          return handleTool(target, { name: def.name, args })
        }
      }
    }
  )
}
