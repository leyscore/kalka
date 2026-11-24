import { watch } from 'vue'

import { useAIChat } from '@/app/ai/chat/use'
import { appPreferences } from '@/app/settings/preferences/store'
import { activeTab } from '@/app/tabs'

/**
 * Opens each document on the panel the person's workflow starts from: the agent's conversation
 * when AI comes first for them, the layers otherwise. It happens once per document, so
 * coming back to a tab keeps the panel chosen since.
 */
export function watchWorkflowLanding(): void {
  const landed = new Set<string>()
  watch(
    activeTab,
    (tab) => {
      if (tab?.kind !== 'document' || landed.has(tab.id)) return
      landed.add(tab.id)
      if (appPreferences.value.workflow.focus === 'ai') useAIChat().activeTab.value = 'ai'
    },
    { immediate: true }
  )
}
