import type { FigmaAPI } from '@kalka/core/figma-api'
import {
  ALL_TOOLS,
  registerComponentCatalog,
  isAtomicTool,
  isToolExposed,
  toolChangesDocument,
  type ToolDef
} from '@kalka/core/tools'
import type { JSONObject } from '@kalka/scene-graph/primitives'
import type { AgentEdit } from '@kalka/vue'

import {
  agentFinished,
  agentStarted,
  readAgentSession,
  touchedNodeIds
} from '@/app/automation/agents'
import { limitToSelection } from '@/app/automation/bridge/selection-scope'
import type { AutomationTarget } from '@/app/automation/bridge/target'
import {
  AUTOMATION_UNDO_LABEL,
  automationUndoLabel,
  executeAtomicEditorTool,
  executeWithPageUndo
} from '@/app/automation/execution/editor'
import { ensureGraphFonts } from '@/app/editor/fonts'
import { useLibraryService } from '@/app/libraries'
import { agentEditFromChange } from '@/app/presence/edit-effect'

type FigmaFactory = (store: AutomationTarget['store'], pageId?: string) => FigmaAPI

interface ToolResponse {
  result: unknown
  edited: boolean
  /** What the call created and wrote, for showing an agent's edit as it happens. */
  edit?: AgentEdit
}

/** Text a property edit may rewrite: the characters of the text layers its arguments name. */
function textsNamed(store: AutomationTarget['store'], args: unknown): Map<string, string> {
  const texts = new Map<string, string>()
  for (const id of touchedNodeIds(store, args, null)) {
    const node = store.graph.getNode(id)
    if (node?.type === 'TEXT') texts.set(id, node.text)
  }
  return texts
}

function rewrittenTexts(
  store: AutomationTarget['store'],
  before: ReadonlyMap<string, string>
): string[] {
  return [...before].flatMap(([id, characters]) => {
    const node = store.graph.getNode(id)
    return node?.type === 'TEXT' && node.text !== characters ? [id] : []
  })
}

export function createAutomationToolHandler(makeFigma: FigmaFactory) {
  return async function handleTool(target: AutomationTarget, args: unknown): Promise<unknown> {
    const toolName = (args as { name?: string }).name
    const requestedArgs = (args as { args?: Record<string, unknown> }).args ?? {}
    if (!toolName) throw new Error('Missing "name" in args')
    // An MCP server that shares only the selection marks its calls, and they stay inside it.
    const toolArgs =
      (args as { scope?: unknown }).scope === 'selection'
        ? limitToSelection(target.store, toolName, requestedArgs)
        : requestedArgs

    // A call from an MCP session shows as that session's agent, working where the call works.
    const session = readAgentSession((args as { agent?: unknown }).agent)
    const reply = session ? agentStarted(target.store, session, target.pageId) : 0
    const response = await runTool(target, toolName, toolArgs, session !== null)
    if (session) {
      agentFinished(target.store, session, {
        reply,
        pageId: target.pageId,
        nodeIds: touchedNodeIds(target.store, toolArgs, response.result),
        edited: response.edited,
        edit: response.edit
      })
    }
    return { ok: true, result: response.result }
  }

  /**
   * Runs one tool. A call from an agent pulses the layers it names while it edits them, and they
   * and what it made glow when it is done; other calls flash what they changed.
   */
  async function runTool(
    target: AutomationTarget,
    toolName: string,
    toolArgs: Record<string, unknown>,
    fromAgent: boolean
  ): Promise<ToolResponse> {
    const store = target.store
    const def = ALL_TOOLS.find((t) => t.name === toolName && isToolExposed(t, 'mcp'))
    if (!def) throw new Error(`Unknown tool: ${toolName}`)
    const libraryService = useLibraryService()
    libraryService.bindEditor(store)
    registerComponentCatalog(store.graph, libraryService)
    const figma = makeFigma(store, target.pageId)
    const pulsed = fromAgent && def.mutates ? touchedNodeIds(store, toolArgs, null) : []
    if (pulsed.length > 0) store.aiMarkActive(pulsed)
    try {
      const response = await executeTool(target, def, figma, toolArgs, fromAgent)
      if (def.mutates) {
        const changed = extractNodeIds(response.result)
        if (fromAgent) store.aiFlashDone(changed.filter((id) => !pulsed.includes(id)))
        else store.flashNodes(changed)
      }
      return response
    } finally {
      // The pulse turns into the glow of finished work.
      if (pulsed.length > 0) store.aiMarkDone(pulsed)
    }
  }

  async function executeTool(
    target: AutomationTarget,
    def: ToolDef,
    figma: FigmaAPI,
    toolArgs: Record<string, unknown>,
    fromAgent: boolean
  ): Promise<ToolResponse> {
    const store = target.store
    let result: unknown
    let edit: AgentEdit | undefined
    if (isAtomicTool(def)) {
      const texts = fromAgent ? textsNamed(store, toolArgs) : new Map<string, string>()
      result = await executeAtomicEditorTool(store, figma, def, toolArgs, {
        label: AUTOMATION_UNDO_LABEL
      })
      edit = { created: [], written: rewrittenTexts(store, texts) }
    } else if (def.mutates) {
      const pageId = writtenPageId(store.graph, toolArgs) ?? figma.currentPageId
      const mutate = () =>
        store.runMutationWithLayout(
          () => def.execute(figma, toolArgs),
          pageId,
          async () => {
            const pageNode = store.graph.getNode(pageId)
            if (pageNode) await ensureGraphFonts(store.graph, pageNode.childIds, store.renderer)
          }
        )
      // View tools (selection, viewport, pages) leave the document and its history alone.
      result = toolChangesDocument(def)
        ? await executeWithPageUndo(
            store,
            pageId,
            automationUndoLabel(def.name),
            mutate,
            (change) => {
              edit = agentEditFromChange(change)
            }
          )
        : await mutate()
    } else {
      result = await def.execute(figma, toolArgs)
    }

    if (def.mutates) store.requestRender()
    return { result, edited: def.mutates, edit }
  }
}

/**
 * A parent or a replaced layer on another page puts the new layers there, so that page lays out,
 * loads their fonts, and records the change in its history.
 */
function writtenPageId(
  graph: AutomationTarget['store']['graph'],
  args: Record<string, unknown>
): string | null {
  // As render places it: a replaced layer's parent wins over parent_id.
  const nodeId = args.replace_id ?? args.parent_id
  return typeof nodeId === 'string' ? pageIdOf(graph, nodeId) : null
}

function pageIdOf(graph: AutomationTarget['store']['graph'], nodeId: string): string | null {
  let node = graph.getNode(nodeId)
  while (node && node.type !== 'CANVAS')
    node = node.parentId ? graph.getNode(node.parentId) : undefined
  return node?.id ?? null
}

function extractNodeIds(result: unknown): string[] {
  if (!result || typeof result !== 'object') return []
  const obj = result as JSONObject
  if (typeof obj.deleted === 'string') return []
  const ids: string[] = []
  if (typeof obj.id === 'string') ids.push(obj.id)
  if (Array.isArray(obj.results)) {
    for (const item of obj.results) {
      if (item && typeof item === 'object' && typeof (item as JSONObject).id === 'string')
        ids.push((item as JSONObject).id as string)
    }
  }
  return ids
}
