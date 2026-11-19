import { computed, shallowRef } from 'vue'

import type { AgentAnswer, AgentQuestion } from '@kalka/core/figma-api'

/** Questions an agent asked, waiting for the person in the AI panel. */
export interface PendingQuestions {
  /** The agent asking, when the host knows its name. */
  agent: string | null
  questions: AgentQuestion[]
  resolve: (answers: AgentAnswer[] | null) => void
}

const queue = shallowRef<PendingQuestions[]>([])

/** The questions the AI panel shows now; others wait their turn. */
export const currentQuestions = computed(() => queue.value[0] ?? null)

/**
 * Puts an agent's questions in front of the person and resolves with their answers, or null when
 * they skip. Agents that ask at the same time wait in line.
 */
export function askUserInPanel(
  questions: AgentQuestion[],
  agent: string | null
): Promise<AgentAnswer[] | null> {
  return new Promise((resolve) => {
    queue.value = [...queue.value, { agent, questions, resolve }]
  })
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
