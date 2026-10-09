<script setup lang="ts">
import { computed } from 'vue'

import { brandLoader } from '@/theme/brand'

/** `progress` is a percentage; without one the K fills in a loop. */
const { progress = null } = defineProps<{ progress?: number | null }>()

const styles = brandLoader()
const liquidStyle = computed(() =>
  progress === null
    ? undefined
    : { transform: `translateY(${100 - Math.min(100, Math.max(0, progress))}%)` }
)
</script>

<template>
  <div :class="styles.tile()" aria-hidden="true">
    <div :class="styles.glyph()">
      <div :class="styles.shell()" />
      <div :class="styles.vessel()">
        <div
          :class="styles.liquid()"
          :data-indeterminate="progress === null || undefined"
          :style="liquidStyle"
        />
      </div>
    </div>
  </div>
</template>
