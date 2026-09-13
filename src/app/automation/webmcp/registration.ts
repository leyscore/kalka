// eslint-disable-next-line open-pencil/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toJsonSchema as toJSONSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'
import type { WebMCP } from 'webmcp-types'

import { ALL_TOOLS, toolInputEntries, type ToolDef } from '@open-pencil/core/tools'

import { ATOMIC_TOOL_NAMES } from '@/app/automation/execution/atomic'

/** Reviewed inspection surface: no code execution, network or file access. */
const READ_TOOLS = new Set([
  'get_page_tree',
  'get_node',
  'find_nodes',
  'get_jsx',
  'list_pages',
  'get_current_page',
  'list_variables',
  'get_variable',
  'find_variables',
  'list_collections',
  'get_components',
  'analyze_colors',
  'analyze_typography',
  'analyze_spacing',
  'design_to_tokens',
  'design_to_component_map'
])

const MAX_RESULT_BYTES = 256 * 1024

export interface WebMCPExecutionTarget {
  execute: (def: ToolDef, args: Record<string, unknown>, signal: AbortSignal) => Promise<unknown>
}

export interface WebMCPRegistration {
  ready: Promise<void>
  dispose: () => void
}

/** Capture the document before invoking any asynchronous work. */
export function registerWebMCPTools(
  context: Pick<WebMCP.ModelContext, 'registerTool'> | undefined,
  getTarget: () => WebMCPExecutionTarget
): WebMCPRegistration {
  const lifetime = new AbortController()
  const dispose = () => lifetime.abort()
  const ready = (async () => {
    if (!context) return
    try {
      for (const def of ALL_TOOLS) {
        if (!READ_TOOLS.has(def.name) && !ATOMIC_TOOL_NAMES.has(def.name)) continue
        lifetime.signal.throwIfAborted()
        const schema = v.object(toolInputEntries(v, def.params))
        await context.registerTool(
          {
            name: def.name,
            description: `${def.description} Targets the active OpenPencil document.`,
            inputSchema: toJSONSchema(schema),
            annotations: { readOnlyHint: !def.mutates, untrustedContentHint: true },
            execute: async (input, options?: WebMCP.ToolExecuteCallbackOptions) => {
              // Early document.modelContext implementations omit execution options.
              const signal = options?.signal ?? new AbortController().signal
              lifetime.signal.throwIfAborted()
              signal.throwIfAborted()
              const args = v.parse(schema, input)
              const target = getTarget()
              const result = await target.execute(def, args, signal)
              // A synchronous mutation has committed; a later abort cannot roll it back.
              if (!def.mutates) signal.throwIfAborted()
              const text = JSON.stringify(result ?? null)
              if (new TextEncoder().encode(text).byteLength > MAX_RESULT_BYTES) {
                if (def.mutates) {
                  return JSON.stringify({
                    ok: true,
                    resultOmitted: true,
                    message:
                      'Edit committed. Result exceeds the size limit; inspect a smaller selection.'
                  })
                }
                throw new Error('Result too large. Narrow the query or reduce its depth/limit.')
              }
              return text
            }
          },
          { signal: lifetime.signal }
        )
      }
    } catch (error) {
      const disposed = lifetime.signal.aborted
      dispose()
      if (!disposed) throw error
    }
  })()
  return { ready, dispose }
}
