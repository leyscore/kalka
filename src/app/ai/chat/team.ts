import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import { shallowRef, type ShallowRef } from 'vue'

import { BUILT_IN_AGENT_MENTION } from '@/app/comments/service'
import type { EditorStore } from '@/app/editor/active-store'

/** Agents that work in one document at once, the main chat's included. */
export const MAX_AGENTS = 3

/** An agent the person named with @Name, working beside the main chat in its own conversation. */
export interface TeamAgent {
  name: string
  chat: Chat<UIMessage>
}

const teams = new WeakMap<EditorStore, ShallowRef<readonly TeamAgent[]>>()

/** The named agents of a document, in the order they joined. */
export function teamOf(store: EditorStore): ShallowRef<readonly TeamAgent[]> {
  let team = teams.get(store)
  if (!team) {
    team = shallowRef([])
    teams.set(store, team)
  }
  return team
}

/** A name such as Fern or Orbit-2: a letter, then letters, digits, `-` or `_`. */
const MENTION = /^@(\p{L}[\p{L}\p{N}_-]{0,23})(?=\s|$)/u

/** The agent a message starts by addressing, as in "@Fern build the pricing section". */
export function leadingMention(text: string): string | null {
  return MENTION.exec(text.trimStart())?.[1] ?? null
}

/** Which named agent `name` is, ignoring case; the main chat's names are not named agents. */
export function findTeamAgent(store: EditorStore, name: string): TeamAgent | undefined {
  const wanted = name.toLowerCase()
  return teamOf(store).value.find((agent) => agent.name.toLowerCase() === wanted)
}

/** Whether `name` reaches the main chat: @agent, or the callsign it answers under. */
export function namesLeadAgent(name: string, leadName: string | undefined): boolean {
  const lower = name.toLowerCase()
  return lower === BUILT_IN_AGENT_MENTION.toLowerCase() || lower === leadName?.toLowerCase()
}

/** The system prompt of a named agent: who it is, and how it shares the document. */
export function teamInstructions(systemPrompt: string, name: string): string {
  return [
    systemPrompt,
    `## Working beside other agents\n\nYou are ${name}. Other agents may work in this document at the same time, each on frames of its own. Build what you were asked in frames you create or were pointed at. When a tool answers that another agent is building a frame, leave that frame alone: do your other steps first, then try once more, and if it is still taken, say so in your reply and name the agent, so the person can hand the work over.`
  ].join('\n\n')
}

export type JoinTeamResult = { agent: TeamAgent } | { error: 'full' } | { error: 'unsupported' }

/**
 * Add a named agent to the document, or return the one already there. It talks to the Design
 * model the person set up, through a direct connection, in a conversation kept in memory.
 */
export async function joinTeam(
  store: EditorStore,
  name: string,
  { onError }: { onError: (error: unknown) => void }
): Promise<JoinTeamResult> {
  const existing = findTeamAgent(store, name)
  if (existing) return { agent: existing }
  const team = teamOf(store)
  if (team.value.length + 1 >= MAX_AGENTS) return { error: 'full' }

  const [{ Chat }, { createAIModelRuntime }, transports, comments, { default: systemPrompt }] =
    await Promise.all([
      import('@ai-sdk/vue'),
      import('@/app/ai/models'),
      import('@/app/ai/chat/transports'),
      import('@/app/comments/agent-run'),
      import('@/app/ai/chat/system-prompt')
    ])
  const runtime = await createAIModelRuntime('design')
  if (runtime?.kind !== 'direct') return { error: 'unsupported' }
  // Another call may have added the same agent while the model loaded.
  const raced = findTeamAgent(store, name)
  if (raced) return { agent: raced }
  if (team.value.length + 1 >= MAX_AGENTS) return { error: 'full' }

  const transport = transports.createToolLoopTransport({
    store,
    ...transports.directModelOptions(runtime),
    onError,
    lane: name,
    instructions: teamInstructions(systemPrompt, name)
  })
  const chat: Chat<UIMessage> = new Chat<UIMessage>({
    transport,
    onError,
    onFinish: (event) => {
      if (
        comments.settleAgentComments(store.graph, {
          failed: event.isAbort || event.isDisconnect || event.isError,
          message: event.message,
          agentName: name
        }).length > 0
      )
        store.requestRender()
      if (event.isAbort || event.isDisconnect || event.isError) {
        void transports.settleEndedReply(chat, store, event.message.id, event.isAbort, name)
      }
    }
  })
  const agent: TeamAgent = { name, chat }
  team.value = [...team.value, agent]
  return { agent }
}

/** The named agent stops and leaves the document, its canvas cursor and its marks with it. */
export async function leaveTeam(store: EditorStore, name: string): Promise<void> {
  const agent = findTeamAgent(store, name)
  if (!agent) return
  const team = teamOf(store)
  team.value = team.value.filter((entry) => entry !== agent)
  await agent.chat.stop()
  const { dropLane } = await import('@/app/ai/tools')
  dropLane(store, agent.name)
}
