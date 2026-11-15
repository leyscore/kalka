import { computed, ref } from 'vue'

import { useAIChat } from '@/app/ai/chat/use'

export type DocumentPanel = 'file' | 'assets' | 'versions'
export type RailPanel = DocumentPanel | 'code' | 'lint'

const documentPanel = ref<DocumentPanel>('file')

/**
 * What the left panel shows, chosen from the editor's icon rail. Code and the design check are
 * opened from elsewhere too (a canvas marker, a shortcut, the tour) through the shared properties
 * tab; while one of them is asked for, it is what the panel shows.
 */
export function useLeftPanel() {
  const { activeTab } = useAIChat()
  const activePanel = computed<RailPanel>(() =>
    activeTab.value === 'code' || activeTab.value === 'lint' ? activeTab.value : documentPanel.value
  )

  function show(panel: RailPanel): void {
    if (panel === 'code' || panel === 'lint') {
      activeTab.value = panel
      return
    }
    documentPanel.value = panel
    if (activeTab.value === 'code' || activeTab.value === 'lint') activeTab.value = 'design'
  }

  return { activePanel, show }
}
