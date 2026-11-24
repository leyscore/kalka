import { computed, ref } from 'vue'

import { useAIChat } from '@/app/ai/chat/use'
import { aiHidden } from '@/app/settings/preferences/store'

/**
 * `file` is the layers of the document; `folder` is its files on the computer; `history` is the
 * versions it keeps in Git; `instructions` is what its agents are told; `comments` is the threads
 * pinned on its design.
 */
export type DocumentPanel = 'file' | 'assets' | 'folder' | 'history' | 'instructions' | 'comments'
/** The panels the shared properties tab asks for: code, the design check and the agent. */
const REQUESTED = ['code', 'lint', 'ai'] as const
type RequestedPanel = (typeof REQUESTED)[number]
export type RailPanel = DocumentPanel | RequestedPanel

function isRequested(tab: string): tab is RequestedPanel {
  return REQUESTED.some((panel) => panel === tab)
}

const documentPanel = ref<DocumentPanel>('file')

/**
 * What the left panel shows, chosen from the editor's icon rail. Code, the design check and the
 * agent's conversation are opened from elsewhere too (a canvas marker, a shortcut, the toolbar, the
 * tour) through the shared properties tab; while one of them is asked for, it is what the panel
 * shows.
 */
export function useLeftPanel() {
  const { activeTab } = useAIChat()
  const activePanel = computed<RailPanel>(() => {
    // Without AI the agent's conversation is never what the panel shows, whatever asked for it.
    if (activeTab.value === 'ai' && aiHidden.value) return documentPanel.value
    return isRequested(activeTab.value) ? activeTab.value : documentPanel.value
  })

  function show(panel: RailPanel): void {
    if (isRequested(panel)) {
      activeTab.value = panel
      return
    }
    documentPanel.value = panel
    if (isRequested(activeTab.value)) activeTab.value = 'design'
  }

  /** Opens the agent's conversation, or goes back to the document panel shown before it. */
  function toggleAgent(): void {
    if (aiHidden.value) return
    activeTab.value = activeTab.value === 'ai' ? 'design' : 'ai'
  }

  return { activePanel, show, toggleAgent }
}
