import { resolve } from 'node:path'

import type {
  McpServer,
  RegisteredTool,
  ServerContext,
  ToolCallback,
  ToolAnnotations
} from '@modelcontextprotocol/server'
// eslint-disable-next-line kalka/no-mixed-case-acronym-identifiers -- Upstream export spelling.
import { toStandardJsonSchema as toStandardJSONSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'

import { CODEGEN_PROMPT, returnsFile } from '@kalka/core/tools'

import type { RPCJSONObject } from '#mcp/json'
import { fail, ok } from '#mcp/result'
import { confirmCoreTool, decideUnsaved, type DecisionSession } from '#mcp/tool/decisions'
import { clientCan, type ClientRequestKind } from '#mcp/tool/interaction/client'
import { createToolDescriptors, getMCPToolDefinitions } from '#mcp/tool/manifest'
import type { ToolDescriptor, ToolEffect, ToolPolicy } from '#mcp/tool/metadata'
import {
  NAME_LAYERS_DESCRIPTION,
  NAME_LAYERS_TOOL,
  nameLayers,
  nameLayersInput
} from '#mcp/tool/naming'
import { resolveSafePath, writeToolOutput } from '#mcp/tool/output'
import { isToolEnabled } from '#mcp/tool/policy'
import {
  documentTarget,
  fileDeliveryInput,
  fileResult,
  isFileResult,
  withDocument,
  type FileDelivery
} from '#mcp/tool/response'
import { SELECTION_SCOPE_FILE_OUTPUT_ERROR } from '#mcp/tool/scope'

export type RPCSender = (body: Record<string, unknown>) => Promise<unknown>

const automationTargetSchema = {
  document_id: v.optional(
    v.pipe(v.string(), v.description('Optional Kalka document/tab ID to target'))
  ),
  page_id: v.optional(
    v.pipe(v.string(), v.description('Optional page ID to target within the document'))
  )
}

function splitAutomationTarget(args: Record<string, unknown>): {
  target: { document_id?: string; page_id?: string }
  args: Record<string, unknown>
} {
  const { document_id, page_id, ...rest } = args
  const target: { document_id?: string; page_id?: string } = {}
  if (typeof document_id === 'string') target.document_id = document_id
  if (typeof page_id === 'string') target.page_id = page_id
  return { target, args: rest }
}

type RPCResponse = {
  ok?: boolean
  result?: unknown
  target?: unknown
  /** Where the server serves a file the call returned, when it keeps one. */
  asset?: unknown
  error?: string
}

async function sendCommand(
  sendRPC: RPCSender,
  command: string,
  args: Record<string, unknown>
): Promise<RPCResponse> {
  const res = (await sendRPC({ command, args })) as RPCResponse
  if (res.ok === false) throw new Error(res.error)
  return res
}

function withTarget<T extends object>(body: T, res: RPCResponse): T & { target?: unknown } {
  return res.target ? { ...body, target: res.target } : body
}

/** Who sends a session's tool calls: any MCP client, or an ACP or Pi harness chat in the app. */
export const MCP_AGENT_KINDS = ['mcp', 'acp', 'harness'] as const
export type MCPAgentKind = (typeof MCP_AGENT_KINDS)[number]

/** The session tool calls come from, so the app can show the client as an agent at work. */
export interface MCPAgentSession {
  id: string
  kind: MCPAgentKind
}

export interface RegisterToolsOptions {
  policy: ToolPolicy
  mcpRoot?: string | null
  sendRPC: RPCSender
  agentSession?: MCPAgentSession
  /**
   * Whether the transport can carry a request from the server while a tool call is open, which
   * asking the user (elicitation) or the client's model (sampling) needs. Defaults to true; an HTTP
   * session that answers with plain JSON cannot.
   */
  transportCarriesRequests?: boolean
}

function toolAnnotations(effect: ToolEffect): ToolAnnotations {
  return {
    readOnlyHint: effect === 'read',
    destructiveHint: effect === 'write'
  }
}

function descriptorByName(descriptors: readonly ToolDescriptor[]): Map<string, ToolDescriptor> {
  return new Map(descriptors.map((descriptor) => [descriptor.name, descriptor]))
}

/** The tools registered on one MCP server, which can follow a later change of policy. */
export interface ToolRegistration {
  /**
   * Lists and serves the tools `policy` enables, adding and removing only the ones that change; the
   * server then tells a connected client that its tool list changed.
   */
  applyPolicy: (policy: ToolPolicy) => void
}

export function registerTools(
  mcpServer: McpServer,
  options: RegisterToolsOptions
): ToolRegistration {
  const { sendRPC, agentSession } = options
  const transportCarriesRequests = options.transportCarriesRequests ?? true
  const decisionSession = (ctx: ServerContext): DecisionSession => ({
    server: mcpServer,
    ctx,
    sendRPC,
    transportCarriesRequests
  })
  // Handlers read the policy when called, so a later `applyPolicy` reaches tools already listed.
  const current = { policy: options.policy }
  // Sent with each tool call: the session, and the client's name once it has introduced itself.
  const agent = () =>
    agentSession
      ? {
          session: agentSession.id,
          kind: agentSession.kind,
          client: mcpServer.server.getClientVersion()?.name
        }
      : undefined
  const resolvedRoot = options.mcpRoot ? resolve(options.mcpRoot) : null
  const descriptors = descriptorByName(createToolDescriptors(resolvedRoot !== null))
  const entries = new Map<
    string,
    {
      descriptor: ToolDescriptor
      add: () => RegisteredTool
      registered: RegisteredTool | null
      requires?: ClientRequestKind
    }
  >()
  // A tool that needs something of the client is listed once the client has said it can.
  const listed = (descriptor: ToolDescriptor, requires: ClientRequestKind | undefined) =>
    isToolEnabled(descriptor, current.policy) &&
    (!requires || clientCan(mcpServer, requires, transportCarriesRequests))
  const register = <InputArgs extends v.GenericSchema>(
    name: string,
    toolOptions: { description?: string; inputSchema: InputArgs; requires?: ClientRequestKind },
    handler: ToolCallback<ReturnType<typeof toStandardJSONSchema<InputArgs>>>
  ) => {
    const descriptor = descriptors.get(name)
    if (!descriptor) throw new Error(`Missing MCP tool descriptor for "${name}"`)
    const add = () =>
      mcpServer.registerTool(
        name,
        {
          description: toolOptions.description ?? descriptor.description,
          inputSchema: toStandardJSONSchema(toolOptions.inputSchema),
          annotations: toolAnnotations(descriptor.effect),
          _meta: { 'kalka/capabilities': descriptor.capabilities }
        },
        handler
      )
    entries.set(name, {
      descriptor,
      add,
      registered: listed(descriptor, toolOptions.requires) ? add() : null,
      requires: toolOptions.requires
    })
  }

  for (const def of getMCPToolDefinitions()) {
    const entries: v.ObjectEntries = { ...def.input.entries, ...automationTargetSchema }
    // A tool that returns a file lets the client choose between the file and a link to it.
    if (returnsFile(def)) entries.delivery = fileDeliveryInput
    register(
      def.name,
      { description: def.description, inputSchema: v.strictObject(entries) },
      async (args: Record<string, unknown>, ctx) => {
        try {
          const { delivery: requestedDelivery, ...callArgs } = args
          const delivery: FileDelivery = requestedDelivery === 'url' ? 'url' : 'inline'
          const { target, args: toolArgs } = splitAutomationTarget(callArgs)
          if (current.policy.scope === 'selection' && toolArgs.path !== undefined) {
            return fail(new Error(SELECTION_SCOPE_FILE_OUTPUT_ERROR))
          }
          const stopped = await confirmCoreTool(def.name, decisionSession(ctx), target, toolArgs)
          if (stopped) return stopped
          const result = await sendRPC({
            command: 'tool',
            args: {
              ...target,
              name: def.name,
              args: toolArgs,
              agent: agent(),
              // A client limited to the selection says so, whatever the server's own scope.
              ...(current.policy.scope === 'selection' ? { scope: current.policy.scope } : {})
            }
          })
          const res = result as RPCResponse
          if (res.ok === false) return fail(new Error(res.error))
          const r = res.result as RPCJSONObject | undefined
          const document = documentTarget(res.target, current.policy.scope)
          const filePath = typeof toolArgs.path === 'string' ? toolArgs.path : null
          if (r && filePath && resolvedRoot) {
            const written = await writeToolOutput(def.name, r, filePath, resolvedRoot)
            if (written) return withDocument(written, document)
          }
          if (isFileResult(r)) {
            return withDocument(fileResult(def.name, r, res.asset, delivery), document)
          }
          return withDocument(ok(r, def.name), document)
        } catch (e) {
          return fail(e)
        }
      }
    )
  }

  register(
    'list_documents',
    {
      description:
        'List open Kalka documents/tabs with their IDs, file paths, current pages, and pages.',
      inputSchema: v.strictObject({})
    },
    async () => {
      try {
        const result = await sendRPC({ command: 'list_documents', args: {} })
        const res = result as { ok?: boolean; result?: unknown; error?: string }
        if (res.ok === false) return fail(new Error(res.error))
        return ok(res.result ?? {})
      } catch (e) {
        return fail(e)
      }
    }
  )

  register(
    'save_file',
    {
      description: resolvedRoot
        ? 'Save the current document to disk. If path is provided, it must be inside the configured MCP root.'
        : 'Save the current document to disk. Uses the existing file path if available, otherwise prompts for a location.',
      inputSchema: resolvedRoot
        ? v.strictObject({
            path: v.optional(
              v.pipe(
                v.string(),
                v.minLength(1),
                v.description('Path for the .fig file, absolute or relative to the MCP root')
              )
            ),
            ...automationTargetSchema
          })
        : v.strictObject({ ...automationTargetSchema })
    },
    async (args: { path?: string; document_id?: string; page_id?: string }) => {
      try {
        const safePath =
          args.path !== undefined && resolvedRoot
            ? await resolveSafePath(args.path, resolvedRoot)
            : undefined
        const { target } = splitAutomationTarget(args)
        const result = await sendRPC({
          command: 'save_file',
          args: { ...target, path: safePath?.realPath }
        })
        const res = result as { ok?: boolean; result?: unknown; target?: unknown; error?: string }
        if (res.ok === false) return fail(new Error(res.error))
        const response: { saved: true; path?: string; target?: unknown } = { saved: true }
        if (safePath) response.path = safePath.resolved
        if (res.target) response.target = res.target
        return ok(response)
      } catch (e) {
        return fail(e)
      }
    }
  )

  if (resolvedRoot) {
    register(
      'open_file',
      {
        description: 'Open a .fig or .pen file from inside the configured MCP root.',
        inputSchema: v.strictObject({
          path: v.pipe(
            v.string(),
            v.minLength(1),
            v.description('Path to the design file, absolute or relative to the MCP root')
          ),
          ...automationTargetSchema
        })
      },
      async (args: { path: string; document_id?: string; page_id?: string }) => {
        try {
          const safe = await resolveSafePath(args.path, resolvedRoot)
          const { target } = splitAutomationTarget(args)
          const result = await sendRPC({
            command: 'open_file',
            args: { ...target, path: safe.realPath }
          })
          const res = result as { ok?: boolean; result?: unknown; target?: unknown; error?: string }
          if (res.ok === false) return fail(new Error(res.error))
          const response: { opened: true; target?: unknown } = { opened: true }
          if (res.target) response.target = res.target
          return ok(response)
        } catch (e) {
          return fail(e)
        }
      }
    )

    register(
      'new_document',
      {
        description:
          'Create a new empty document with an optional save path inside the configured MCP root.',
        inputSchema: v.strictObject({
          path: v.optional(
            v.pipe(
              v.string(),
              v.minLength(1),
              v.description('Path for the new file, absolute or relative to the MCP root')
            )
          ),
          ...automationTargetSchema
        })
      },
      async (args: { path?: string; document_id?: string; page_id?: string }) => {
        try {
          const safePath =
            args.path !== undefined ? await resolveSafePath(args.path, resolvedRoot) : undefined
          const { target } = splitAutomationTarget(args)
          const result = await sendRPC({
            command: 'new_document',
            args: { ...target, path: safePath?.realPath }
          })
          const res = result as { ok?: boolean; result?: unknown; target?: unknown; error?: string }
          if (res.ok === false) return fail(new Error(res.error))
          const response: { created: true; target?: unknown } = { created: true }
          if (res.target) response.target = res.target
          return ok(response)
        } catch (e) {
          return fail(e)
        }
      }
    )
  }

  const closeEntries = {
    unsaved: v.optional(
      v.pipe(
        v.picklist(['error', 'save', 'discard']),
        v.description(
          'What to do with unsaved changes: "error" (default) fails, "save" saves first, "discard" drops them'
        )
      )
    ),
    ...automationTargetSchema
  }

  register(
    'close_file',
    {
      inputSchema: resolvedRoot
        ? v.strictObject({
            ...closeEntries,
            path: v.optional(
              v.pipe(
                v.string(),
                v.minLength(1),
                v.description(
                  'With unsaved "save": .fig path for a document never saved, inside the MCP root'
                )
              )
            )
          })
        : v.strictObject(closeEntries)
    },
    async (
      args: {
        unsaved?: 'error' | 'save' | 'discard'
        path?: string
        document_id?: string
        page_id?: string
      },
      ctx
    ) => {
      try {
        const safePath =
          args.path !== undefined && resolvedRoot
            ? await resolveSafePath(args.path, resolvedRoot)
            : undefined
        const { target } = splitAutomationTarget(args)
        let unsaved = args.unsaved
        if (unsaved === undefined) {
          const decision = await decideUnsaved(decisionSession(ctx), target, safePath !== undefined)
          if (!decision.proceed) return decision.result
          unsaved = decision.args.unsaved
        }
        const rpcArgs: Record<string, unknown> = { ...target }
        if (unsaved) rpcArgs.unsaved = unsaved
        if (safePath) rpcArgs.path = safePath.realPath
        const res = await sendCommand(sendRPC, 'close_file', rpcArgs)
        const closed = (res.result as { closed?: boolean } | undefined)?.closed === true
        return ok(withTarget({ closed }, res))
      } catch (e) {
        return fail(e)
      }
    }
  )

  register(
    'activate_document',
    {
      inputSchema: v.strictObject({
        document_id: v.pipe(v.string(), v.description('Document/tab ID from list_documents')),
        page_id: automationTargetSchema.page_id
      })
    },
    async (args: { document_id: string; page_id?: string }) => {
      try {
        const { target } = splitAutomationTarget(args)
        const res = await sendCommand(sendRPC, 'activate_document', target)
        return ok(withTarget({ activated: true }, res))
      } catch (e) {
        return fail(e)
      }
    }
  )

  for (const command of ['undo', 'redo'] as const) {
    register(
      command,
      { inputSchema: v.strictObject({ ...automationTargetSchema }) },
      async (args) => {
        try {
          const { target } = splitAutomationTarget(args)
          const res = await sendCommand(sendRPC, command, target)
          return ok(withTarget({ ...(res.result as RPCJSONObject | undefined) }, res))
        } catch (e) {
          return fail(e)
        }
      }
    )
  }

  register('get_settings', { inputSchema: v.strictObject({}) }, async () => {
    try {
      const res = await sendCommand(sendRPC, 'get_settings', {})
      return ok(res.result ?? {})
    } catch (e) {
      return fail(e)
    }
  })

  register(
    'update_settings',
    {
      inputSchema: v.strictObject({
        settings: v.pipe(
          v.record(v.string(), v.unknown()),
          v.description(
            'Partial settings, e.g. {"appearance":{"theme":"light"},"editing":{"snapping":{"pixelGrid":false}}}. Unknown keys and invalid values are rejected.'
          )
        )
      })
    },
    async (args: { settings: Record<string, unknown> }) => {
      try {
        // Echo only the applied patch: with get_settings disabled, writing must not read.
        await sendCommand(sendRPC, 'update_settings', { settings: args.settings })
        return ok({ updated: args.settings })
      } catch (e) {
        return fail(e)
      }
    }
  )

  register(
    NAME_LAYERS_TOOL,
    {
      description: NAME_LAYERS_DESCRIPTION,
      inputSchema: v.strictObject({ ...nameLayersInput, ...automationTargetSchema }),
      requires: 'sampling'
    },
    async (
      args: { root_id?: string; apply?: boolean; document_id?: string; page_id?: string },
      ctx
    ) => {
      try {
        const { target, args: toolArgs } = splitAutomationTarget(args)
        return await nameLayers({
          session: decisionSession(ctx),
          target,
          args: toolArgs,
          scope: current.policy.scope,
          agent: agent()
        })
      } catch (e) {
        return fail(e)
      }
    }
  )

  register(
    'get_codegen_prompt',
    {
      description:
        'Get design-to-code generation guidelines. Call before generating frontend code.',
      inputSchema: v.strictObject({})
    },
    async () => ok({ prompt: CODEGEN_PROMPT })
  )

  const applyPolicy = (next: ToolPolicy) => {
    current.policy = next
    for (const entry of entries.values()) {
      const enabled = listed(entry.descriptor, entry.requires)
      if (enabled && !entry.registered) entry.registered = entry.add()
      if (!enabled && entry.registered) {
        entry.registered.remove()
        entry.registered = null
      }
    }
  }
  // The client names what it can do in its handshake, after the tools were first registered.
  const initialized = mcpServer.server.oninitialized
  mcpServer.server.oninitialized = () => {
    initialized?.()
    applyPolicy(current.policy)
  }

  return { applyPolicy }
}
