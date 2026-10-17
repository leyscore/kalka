import {
  isSelectionScopeTool,
  SELECTION_SCOPE_FILE_OUTPUT_ERROR,
  SELECTION_SCOPE_TOOLS
} from '@kalka/mcp/tools'

import type { EditorStore } from '@/app/editor/active-store'

/** Tools the scope points at the selection when a call names no nodes. */
const READS_SELECTION_BY_DEFAULT: ReadonlySet<string> = new Set(['describe', 'export_image'])

/** Tools with Figma's `nodeId` that read the selection themselves when a call names no node. */
const READ_SELECTION_THEMSELVES: ReadonlySet<string> = new Set([
  'get_metadata',
  'get_variable_defs'
])

/** Tools that search the selection, through their `within` argument, when a call names no node. */
const SEARCH_WITHIN_SELECTION: ReadonlySet<string> = new Set(['find_nodes'])

/** A node ID as the tools read it: the `1-2` form of Figma links means `1:2`. */
const toNodeId = (id: string) => id.trim().replace(/^(\d+)-(\d+)$/, '$1:$2')

function namedIds(value: unknown): string[] {
  if (typeof value === 'string') return [toNodeId(value)]
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map(toNodeId)
  }
  return []
}

/**
 * A tool call's arguments limited to the user's selection, for an MCP server that shares only the
 * selection: every node the call names must be a selected layer or inside one, `describe` and
 * `export_image` read the selection when they name none, and `find_nodes` then searches only it.
 * Throws when the call reaches further.
 */
export function limitToSelection(
  store: EditorStore,
  toolName: string,
  toolArgs: Record<string, unknown>
): Record<string, unknown> {
  if (!isSelectionScopeTool(toolName)) {
    throw new Error(`${toolName} is unavailable while Kalka shares only the selection`)
  }
  // The MCP side writes a `path` to disk, which the selection does not extend to.
  if (toolArgs.path !== undefined) throw new Error(SELECTION_SCOPE_FILE_OUTPUT_ERROR)
  const fields = SELECTION_SCOPE_TOOLS[toolName]
  const selected = [...store.state.selectedIds]
  if (selected.length === 0) {
    throw new Error('Nothing is selected in Kalka. Ask the user to select the layers to use.')
  }

  const ids = fields.flatMap((field) => namedIds(toolArgs[field]))
  for (const id of ids) {
    if (!selected.some((root) => store.graph.isDescendant(id, root))) {
      throw new Error(`${id} is outside the selection Kalka shares; use get_selection`)
    }
  }
  if (ids.length === 0 && SEARCH_WITHIN_SELECTION.has(toolName)) {
    return { ...toolArgs, within: 'selection' }
  }
  if (ids.length > 0 || fields.length === 0 || READ_SELECTION_THEMSELVES.has(toolName)) {
    return toolArgs
  }
  if (READS_SELECTION_BY_DEFAULT.has(toolName)) return { ...toolArgs, ids: selected }
  throw new Error(`${toolName} needs ${fields.join(' or ')}: a node from get_selection`)
}
