<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import { useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { latch } from '@/app/shell/latch'
import { agentDock } from '@/theme/agent-dock'

// The chat, its model SDKs and markdown load when the agent first opens, then stay mounted.
const ChatPanel = defineAsyncComponent(() => import('@/components/ChatPanel.vue'))
const { activeTab } = useAIChat()
const { panels } = useI18n()
const chatUsed = latch(() => activeTab.value === 'ai')
const styles = agentDock()
</script>

<template>
  <section
    v-if="chatUsed"
    v-show="activeTab === 'ai'"
    role="tabpanel"
    :aria-label="panels.ai"
    data-test-id="agent-dock"
    data-canvas-obstacle
    :class="styles.panel()"
  >
    <ChatPanel />
  </section>
</template>
