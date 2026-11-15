<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { toolDisplayName, toolSummary, type ToolCallPart } from '@/app/ai/chat/tool-calls/display'
import BrandSpinner from '@/components/brand/BrandSpinner.vue'
import { toolCallState } from '@/components/chat/tool/state'
import ToolCallCard from '@/components/chat/tool/ToolCallCard.vue'
import AppBadge from '@/components/ui/feedback/AppBadge.vue'
import { chatToolTheme } from '@/theme/chat/tool'
import { collapsibleContentMotion } from '@/theme/collapsible/collapsible'

/** `undone`: the calls whose edit the user undid. */
const { parts, undone } = defineProps<{ parts: ToolCallPart[]; undone?: ReadonlySet<string> }>()
const { ai } = useI18n()
const ui = chatToolTheme()

const latest = computed(() => parts.at(-1))
const running = computed(() => (latest.value ? toolCallState(latest.value) === 'pending' : false))
const failed = computed(() => parts.filter((part) => toolCallState(part) === 'error').length)
/**
 * A run of calls is one line: what the agent is doing while it works, how much it did once it
 * rests. The calls themselves open on a click.
 */
const label = computed(() => {
  const count = ai.value.toolActions({ count: parts.length })
  return failed.value ? `${count} · ${ai.value.toolStepsFailed({ count: failed.value })}` : count
})
</script>

<template>
  <ToolCallCard
    v-if="parts.length === 1 && latest"
    :part="latest"
    :undone="undone?.has(latest.toolCallId)"
  />
  <CollapsibleRoot v-else :class="ui.group()" data-slot="chat-tool-group">
    <CollapsibleTrigger :class="ui.groupTrigger()" :aria-label="label">
      <BrandSpinner v-if="running" />
      <icon-hugeicons-list-checks v-else :class="ui.groupIcon()" aria-hidden="true" />
      <template v-if="running && latest">
        <span :class="ui.groupNow()" aria-hidden="true">{{ toolDisplayName(latest) }}</span>
        <span :class="ui.groupNames()" aria-hidden="true">{{ toolSummary(latest) }}</span>
      </template>
      <span v-else :class="ui.groupNames()" aria-hidden="true">{{ label }}</span>
      <AppBadge v-if="failed && running" :ui="{ base: ui.groupFailed() }" aria-hidden="true">
        {{ ai.toolStepsFailed({ count: failed }) }}
      </AppBadge>
      <AppBadge v-if="running" aria-hidden="true">{{ parts.length }}</AppBadge>
      <icon-hugeicons-chevron-down :class="ui.chevron()" aria-hidden="true" />
    </CollapsibleTrigger>
    <CollapsibleContent :class="collapsibleContentMotion">
      <div :class="ui.groupItems()">
        <ToolCallCard
          v-for="part in parts"
          :key="part.toolCallId"
          :part="part"
          :undone="undone?.has(part.toolCallId)"
        />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
