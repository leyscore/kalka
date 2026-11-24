import { computed, shallowRef } from 'vue'

import type { AgentAnswer, AgentQuestion } from '@kalka/core/figma-api'

/** Questions an agent asked, waiting for the person in the AI panel. */
export interface PendingQuestions {
  /** The agent asking, when the host knows its name. */
  agent: string | null
  /** The agent's session, so its questions leave with it; null for the in-app agent. */
  session: string | null
  questions: AgentQuestion[]
  resolve: (answers: AgentAnswer[] | null) => void
}

const queue = shallowRef<PendingQuestions[]>([])

/** The questions the AI panel shows now; others wait their turn. */
export const currentQuestions = computed(() => queue.value[0] ?? null)

/**
 * Puts an agent's questions in front of the person and resolves with their answers, or null when
 * they skip. Agents that ask at the same time wait in line. A session that asks again has given up
 * on its earlier questions, so those leave first.
 */
export function askUserInPanel(
  questions: AgentQuestion[],
  agent: string | null,
  session: string | null = null
): Promise<AgentAnswer[] | null> {
  if (session) dropSessionQuestions(session)
  return new Promise((resolve) => {
    queue.value = [...queue.value, { agent, session, questions, resolve }]
  })
}

/** Removes the questions of a session that ended or stopped waiting; nobody reads the answers. */
export function dropSessionQuestions(session: string): void {
  const dropped = queue.value.filter((entry) => entry.session === session)
  if (!dropped.length) return
  queue.value = queue.value.filter((entry) => entry.session !== session)
  for (const entry of dropped) entry.resolve(null)
}

function settle(answers: AgentAnswer[] | null): void {
  const entry = queue.value.at(0)
  if (!entry) return
  queue.value = queue.value.slice(1)
  entry.resolve(answers)
}

/** Sends the person's answers to the agent that asked. */
export function answerQuestions(answers: AgentAnswer[]): void {
  settle(answers)
}

/** Tells the agent the person skipped its questions. */
export function skipQuestions(): void {
  settle(null)
}
