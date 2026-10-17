import { convertToModelMessages } from 'ai'
import type { ModelMessage, ToolSet, UIMessage } from 'ai'

import { requestMessages } from '@/app/ai/chat/history/continuation'

import { fingerprint } from './fingerprint'
import type { RunTrace } from './types'

/** The reply's parts before its `step`th step, each of which starts with a `step-start` part. */
function stepsBefore(reply: UIMessage, step: number): UIMessage | null {
  let seen = 0
  const end = reply.parts.findIndex((part) => part.type === 'step-start' && seen++ === step)
  const parts = end === -1 ? reply.parts : reply.parts.slice(0, end)
  return parts.length > 0 ? { ...reply, parts } : null
}

/**
 * The messages a run's `step` sent to the model, rebuilt from the conversation: what the run
 * sent, as `requestMessages` prepared it, then the reply's earlier steps.
 */
export async function rebuildStepMessages(
  conversation: UIMessage[],
  run: Pick<RunTrace, 'input'>,
  step: number,
  tools: ToolSet
): Promise<ModelMessage[]> {
  const through = conversation.findIndex((message) => message.id === run.input.through)
  const sent = requestMessages(conversation.slice(0, through + 1))
  const reply = conversation.at(through + 1)
  const earlier = reply?.role === 'assistant' && step > 0 ? stepsBefore(reply, step) : null
  return convertToModelMessages(earlier ? [...sent, earlier] : sent, { tools })
}

/** Whether the rebuilt request of a run's step is the one the model received. */
export async function matchesRecordedStep(
  conversation: UIMessage[],
  run: RunTrace,
  step: number,
  tools: ToolSet
): Promise<boolean> {
  const recorded = run.steps.find((entry) => entry.index === step)
  if (!recorded) return false
  const rebuilt = await rebuildStepMessages(conversation, run, step, tools)
  return (await fingerprint(rebuilt)) === recorded.request.hash
}
