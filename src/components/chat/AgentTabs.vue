<script setup lang="ts">
import { useAIMessages } from '@kalka/vue'

/** One agent in the chat's tab strip: the main chat, or one the person named with @Name. */
export interface AgentTab {
  /** Null for the main chat. */
  name: string | null
  label: string
  working: boolean
}

const { tabs, selected } = defineProps<{ tabs: readonly AgentTab[]; selected: string | null }>()
const emit = defineEmits<{ select: [name: string | null]; close: [name: string] }>()
const ai = useAIMessages()
</script>

<template>
  <div
    role="tablist"
    :aria-label="ai.agentTabs"
    class="flex gap-1 overflow-x-auto px-3 pb-2"
    data-slot="agent-tabs"
  >
    <div
      v-for="tab in tabs"
      :key="tab.name ?? ''"
      class="group flex shrink-0 items-center rounded-md text-xs text-muted hover:bg-hover data-[active]:bg-panel-selected data-[active]:text-surface"
      :data-active="selected === tab.name || undefined"
    >
      <button
        type="button"
        role="tab"
        class="flex items-center gap-1.5 py-1 pl-2"
        :class="tab.name ? 'pr-1' : 'pr-2'"
        :aria-selected="selected === tab.name"
        :data-agent="tab.name ?? 'main'"
        @click="emit('select', tab.name)"
      >
        <icon-hugeicons-loading-03 v-if="tab.working" class="size-3 animate-spin" />
        {{ tab.label }}
      </button>
      <button
        v-if="tab.name"
        type="button"
        class="mr-1 flex size-4 items-center justify-center rounded hover:bg-hover"
        :aria-label="ai.closeAgent({ name: tab.name })"
        @click="emit('close', tab.name)"
      >
        <icon-hugeicons-cancel-01 class="size-3" />
      </button>
    </div>
  </div>
</template>
