import type { AgentAnswer, AgentQuestion } from '@kalka/core/figma-api'

import { useAIChat } from '@/app/ai/chat/use'

import { askUserInPanel } from './queue'

/** Opens the AI panel on an agent's questions and resolves with the person's answers. */
export function askInAIPanel(
  questions: AgentQuestion[],
  agent: string | null,
  session: string | null = null
): Promise<AgentAnswer[] | null> {
  useAIChat().activeTab.value = 'ai'
  return askUserInPanel(questions, agent, session)
}
