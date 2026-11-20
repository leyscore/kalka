<script setup lang="ts">
import { computed } from 'vue'

import { skeletonSparks, type SkeletonTone } from '@/app/presence/skeletons'
import { agentSkeleton } from '@/theme/collaboration/agent-skeleton'

/**
 * One block of an agent's loading sky: a cloud of pixel dots with a few twinkling patches, the
 * same for `seed` however often it draws. Placed by its parent; display only.
 */
const {
  width,
  height,
  tone,
  seed,
  leaving = false
} = defineProps<{
  width: number
  height: number
  tone: SkeletonTone
  seed: string
  /** Its content is appearing: it fades and rises away. */
  leaving?: boolean
}>()

const ui = computed(() => agentSkeleton({ tone }))
// Laid out on the grid of whole dots, so a zoom that barely changes the size keeps them still.
const sparks = computed(() =>
  skeletonSparks(seed, Math.round(width / 9) * 9, Math.round(height / 9) * 9)
)
</script>

<template>
  <div
    :class="ui.root()"
    data-slot="agent-skeleton"
    :data-tone="tone"
    :data-leaving="leaving || undefined"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <i
      v-for="(spark, index) in sparks"
      :key="index"
      :class="ui.spark()"
      :style="{
        left: `${spark.left}px`,
        top: `${spark.top}px`,
        width: `${spark.width}px`,
        height: `${spark.height}px`,
        '--twinkle-duration': `${spark.duration}s`,
        '--twinkle-delay': `${spark.delay}s`
      }"
    />
  </div>
</template>
