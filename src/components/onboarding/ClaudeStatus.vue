<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { claudeConnection } from '@/app/onboarding/claude'

/** A dot and a line saying how far Claude is from the canvas. */
const { welcome } = useI18n()

const label = computed(() => {
  const w = welcome.value
  return {
    connected: w.statusConnected,
    waiting: w.statusWaiting,
    starting: w.statusStarting,
    off: w.statusOff,
    web: w.statusWeb
  }[claudeConnection.value]
})
const tone = computed(
  () =>
    ({
      connected: 'bg-success',
      waiting: 'bg-amber-400 animate-pulse motion-reduce:animate-none',
      starting: 'bg-amber-400 animate-pulse motion-reduce:animate-none',
      off: 'bg-error',
      web: 'bg-muted'
    })[claudeConnection.value]
)
</script>

<template>
  <span class="inline-flex items-center gap-2" role="status">
    <span class="size-2 shrink-0 rounded-full" :class="tone" />
    <span>{{ label }}</span>
  </span>
</template>
