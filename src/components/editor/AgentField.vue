<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { agentDock } from '@/theme/agent-dock'

const { ai, panels } = useI18n()
const { activeTab } = useAIChat()
const styles = agentDock()

// The panel offers its own provider setup while no agent is connected.
function toggle(): void {
  activeTab.value = activeTab.value === 'ai' ? 'design' : 'ai'
}
</script>

<template>
  <!-- A tab of its own: it opens the conversation panel above the toolbar and closes it again. -->
  <div role="tablist" :aria-label="panels.ai" :class="styles.tablist()">
    <button
      type="button"
      role="tab"
      data-test-id="properties-tab-ai"
      :aria-label="panels.ai"
      :aria-selected="activeTab === 'ai'"
      :data-state="activeTab === 'ai' ? 'active' : 'inactive'"
      :class="styles.field()"
      @click="toggle"
    >
      <icon-lucide-bot :class="styles.fieldIcon()" aria-hidden="true" />
      <span :class="styles.fieldLabel()">{{ ai.describeChange }}</span>
    </button>
  </div>
</template>
