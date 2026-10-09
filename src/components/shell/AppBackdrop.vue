<script setup lang="ts">
import { computed } from 'vue'

import { activeTab } from '@/app/tabs'

/**
 * The brand backdrop behind the whole app: two soft lights over the page color with even film
 * grain. Panels are frosted glass over it. On Home the lights sit toward the middle of the page;
 * in the editor they move to the edges, behind the side panels. It drifts only where asked:
 * glass over moving light is recomputed every frame.
 */
const { drift = false, fill = 'fixed' } = defineProps<{
  drift?: boolean
  fill?: 'fixed' | 'absolute'
}>()

const layout = computed(() => (activeTab.value?.kind === 'home' ? 'home' : 'editor'))
</script>

<template>
  <div
    aria-hidden="true"
    :data-layout="layout"
    :class="[
      fill,
      'group/backdrop grain pointer-events-none inset-0 -z-10 overflow-hidden bg-canvas'
    ]"
  >
    <div
      class="absolute aspect-square rounded-full bg-backdrop-a opacity-(--backdrop-glow-a) blur-[120px] transition-[left,top,width] duration-700 ease-out group-data-[layout=editor]/backdrop:top-[10%] group-data-[layout=editor]/backdrop:-left-[6%] group-data-[layout=editor]/backdrop:w-[34%] group-data-[layout=home]/backdrop:top-[22%] group-data-[layout=home]/backdrop:left-[14%] group-data-[layout=home]/backdrop:w-[42%] motion-reduce:transition-none"
      :class="drift && 'animate-backdrop-drift motion-reduce:animate-none'"
    />
    <div
      class="absolute aspect-square rounded-full bg-backdrop-b opacity-(--backdrop-glow-b) blur-[130px] transition-[right,top,width] duration-700 ease-out group-data-[layout=editor]/backdrop:top-[30%] group-data-[layout=editor]/backdrop:-right-[6%] group-data-[layout=editor]/backdrop:w-[32%] group-data-[layout=home]/backdrop:top-[34%] group-data-[layout=home]/backdrop:right-0 group-data-[layout=home]/backdrop:w-[38%] motion-reduce:transition-none"
      :class="drift && 'animate-backdrop-drift-reverse motion-reduce:animate-none'"
    />
  </div>
</template>
