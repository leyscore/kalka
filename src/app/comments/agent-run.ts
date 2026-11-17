import type { UIMessage } from 'ai'

import { documentComments, replyToComment, setCommentAgentState } from '@kalka/scene-graph'
import type { SceneGraph } from '@kalka/scene-graph'

import { BUILT_IN_AGENT_MENTION } from '@/app/comments/service'

/** How much of the agent's last message a thread takes when the agent did not answer there. */
const MAX_FALLBACK_REPLY = 1200

function replyText(message: UIMessage | undefined): string {
  const text = (message?.parts ?? [])
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
  return text.length > MAX_FALLBACK_REPLY ? `${text.slice(0, MAX_FALLBACK_REPLY)}…` : text
}

/**
 * The document's agent finished a reply: the threads it was working on are answered, with its
 * last message when it did not answer in the thread itself, or stopped when the reply failed or
 * was stopped, so the person can retry from the pin.
 */
export function settleAgentComments(
  graph: SceneGraph,
  outcome: { failed: boolean; message?: UIMessage; agentName?: string }
): string[] {
  const working = documentComments(graph).filter(
    (thread) =>
      !thread.resolved &&
      thread.agent?.name === BUILT_IN_AGENT_MENTION &&
      thread.agent.state === 'working'
  )
  for (const thread of working) {
    if (outcome.failed) {
      setCommentAgentState(graph, thread.id, 'failed')
      continue
    }
    const text = replyText(outcome.message)
    if (text)
      replyToComment(graph, thread.id, { kind: 'agent', name: outcome.agentName ?? 'Agent' }, text)
    else setCommentAgentState(graph, thread.id, 'answered')
  }
  return working.map((thread) => thread.id)
}
