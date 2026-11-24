<script setup lang="ts">
import { computed } from 'vue'

import type { ThinkingLevel } from '@/app/ai/models/types'
import { chatThinkingTheme } from '@/theme/chat/thinking'

const { level } = defineProps<{ level: ThinkingLevel }>()
const ui = chatThinkingTheme()

/** Stars per level. The provider default fills every star in grey: the provider decides. */
const FILLED: Record<ThinkingLevel, number> = {
  default: 5,
  off: 0,
  minimal: 1,
  low: 2,
  medium: 3,
  high: 4,
  xhigh: 5
}
const STARS = 5
const filled = computed(() => FILLED[level])
</script>

<template>
  <span :class="ui.meter()" :data-level="level" aria-hidden="true" data-slot="thinking-meter">
    <span v-for="index in STARS" :key="index" :class="ui.bar()" :data-filled="index <= filled" />
  </span>
</template>
