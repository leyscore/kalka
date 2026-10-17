import type { InputRequiredResult, McpServer, ServerContext } from '@modelcontextprotocol/server'
import * as v from 'valibot'

import { ok, type MCPResult } from '#mcp/result'
import { askChoice, choiceAnswer, type Choice } from '#mcp/tool/interaction/choice'
import { clientCan, negotiatedRevision } from '#mcp/tool/interaction/client'

type RPCSender = (body: Record<string, unknown>) => Promise<unknown>

/** The document and page a call names, as the client passed them. */
export interface CallTarget {
  document_id?: string
  page_id?: string
}

/** What a tool needs to ask the user in the middle of a call. */
export interface DecisionSession {
  server: McpServer
  ctx: ServerContext
  sendRPC: RPCSender
  /** Whether this session's transport can carry a request from the server during a call. */
  transportCarriesRequests: boolean
}

/** A call goes on, possibly with arguments the user chose, or ends with this result. */
export type Decision<T> = { proceed: true; args: T } | { proceed: false; result: Ask }

type Ask = MCPResult | InputRequiredResult

const OpenDocument = v.looseObject({
  id: v.string(),
  name: v.string(),
  path: v.optional(v.string()),
  active: v.boolean(),
  unsaved: v.optional(v.boolean()),
  current_page_id: v.string()
})
export type OpenDocument = v.InferOutput<typeof OpenDocument>

const DocumentList = v.looseObject({
  result: v.looseObject({ documents: v.array(OpenDocument) })
})

/** The open document a call reaches: the one it names, or the active one. */
export async function targetDocument(
  sendRPC: RPCSender,
  target: CallTarget
): Promise<OpenDocument | null> {
  const parsed = v.safeParse(DocumentList, await sendRPC({ command: 'list_documents', args: {} }))
  if (!parsed.success) return null
  const { documents } = parsed.output.result
  return (
    documents.find((document) =>
      target.document_id ? document.id === target.document_id : document.active
    ) ?? null
  )
}

function stop(result: Ask): { proceed: false; result: Ask } {
  return { proceed: false, result }
}

// ── close_file with unsaved changes ──

type UnsavedChoice = 'save' | 'discard' | 'keep'

function unsavedChoice(name: string, canSave: boolean): Choice<UnsavedChoice> {
  return {
    key: 'unsaved',
    title: 'Unsaved changes',
    message: `“${name}” has unsaved changes. The agent wants to close it.`,
    options: [
      ...(canSave ? [{ value: 'save' as const, title: 'Save, then close' }] : []),
      { value: 'discard', title: 'Discard the changes and close' },
      { value: 'keep', title: 'Keep the document open' }
    ]
  }
}

/**
 * Whether to save or discard the changes of a document the client closes without saying: asked
 * only when the document has unsaved changes, the client can show a form, and the call named no
 * choice. Without a form the call goes on as before and the app refuses to drop the changes.
 * "Save" is offered when the document has a file or the call gave a path to save to.
 */
export async function decideUnsaved(
  session: DecisionSession,
  target: CallTarget,
  pathGiven: boolean
): Promise<Decision<{ unsaved?: 'save' | 'discard' }>> {
  if (!clientCan(session.server, 'elicitation', session.transportCarriesRequests)) {
    return { proceed: true, args: {} }
  }
  const answer = choiceAnswer(session.ctx, unsavedChoice('', true))
  if (answer) {
    if (answer.picked && answer.value !== 'keep') {
      return { proceed: true, args: { unsaved: answer.value } }
    }
    return stop(ok({ closed: false, reason: 'The user kept the document open.' }))
  }
  const document = await targetDocument(session.sendRPC, target)
  if (!document?.unsaved) return { proceed: true, args: {} }
  const choice = unsavedChoice(document.name, document.path !== undefined || pathGiven)
  return stop(askChoice(choice, negotiatedRevision(session.server)))
}

// ── delete_collection reaching bound layers ──

const CollectionUsage = v.looseObject({
  result: v.looseObject({ name: v.string(), variables: v.number(), layers: v.number() })
})

type CollectionChoice = 'delete' | 'keep'

function collectionChoice(message: string): Choice<CollectionChoice> {
  return {
    key: 'confirm',
    title: 'Delete the collection?',
    message,
    options: [
      { value: 'delete', title: 'Delete it' },
      { value: 'keep', title: 'Keep it' }
    ]
  }
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

/**
 * Asks before a collection whose variables layers are bound to goes: undo does not bring the
 * variables back, and every one of those layers loses its binding. A collection no layer uses
 * goes without asking, as does any collection for a client that cannot show a form.
 */
async function confirmCollectionDelete(
  session: DecisionSession,
  target: CallTarget,
  args: Record<string, unknown>
): Promise<Ask | null> {
  const answer = choiceAnswer(session.ctx, collectionChoice(''))
  if (answer) {
    if (answer.picked && answer.value === 'delete') return null
    return ok({ deleted: false, reason: 'The user kept the collection.' })
  }
  if (typeof args.id !== 'string') return null
  let usage: unknown
  try {
    usage = await session.sendRPC({ command: 'collection_usage', args: { ...target, id: args.id } })
  } catch {
    // An unknown collection is the tool's to report.
    return null
  }
  const parsed = v.safeParse(CollectionUsage, usage)
  if (!parsed.success || parsed.output.result.layers === 0) return null
  const { name, variables, layers } = parsed.output.result
  const message =
    `The agent wants to delete the variable collection “${name}” with ${plural(variables, 'variable')}. ` +
    `${plural(layers, 'layer')} bound to them will lose their bindings, and undo does not bring the variables back.`
  return askChoice(collectionChoice(message), negotiatedRevision(session.server))
}

type Confirmation = (
  session: DecisionSession,
  target: CallTarget,
  args: Record<string, unknown>
) => Promise<Ask | null>

/** Core tools that ask the user before a change undo cannot reverse. Keep this list short. */
const CONFIRMATIONS: Partial<Record<string, Confirmation>> = {
  delete_collection: confirmCollectionDelete
}

/**
 * The result to end a Core tool call with instead of running it, when the user must confirm it
 * first or declined to; null to run it.
 */
export async function confirmCoreTool(
  name: string,
  session: DecisionSession,
  target: CallTarget,
  args: Record<string, unknown>
): Promise<Ask | null> {
  const confirm = CONFIRMATIONS[name]
  if (!confirm || !clientCan(session.server, 'elicitation', session.transportCarriesRequests)) {
    return null
  }
  return confirm(session, target, args)
}
