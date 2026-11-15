<script setup lang="ts">
import { ToolbarButton } from 'reka-ui'

import { useI18n } from '@kalka/vue'

import { useLeftPanel } from '@/app/shell/left-panel/use'
import Tip from '@/components/ui/overlay/Tip.vue'
import { agentField } from '@/theme/agent-field'

const { ai } = useI18n()
const { activePanel, show } = useLeftPanel()
const styles = agentField()
</script>

<template>
  <!-- A shortcut from where the hand already is: it opens the agent's conversation in the left panel. -->
  <Tip :label="ai.describeChange" side="top">
    <!-- One of the toolbar's own buttons, so the arrow keys, Home and End reach it too. -->
    <ToolbarButton
      type="button"
      data-test-id="agent-field"
      :aria-label="ai.describeChange"
      :data-active="activePanel === 'ai' || undefined"
      :class="styles.field()"
      @click="show('ai')"
    >
      <icon-hugeicons-sparkle :class="styles.icon()" aria-hidden="true" />
      <span :class="styles.label()">{{ ai.describeChange }}</span>
    </ToolbarButton>
  </Tip>
</template>
