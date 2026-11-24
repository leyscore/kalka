<script setup lang="ts">
import { computed } from 'vue'

import { PIXEL_AVATAR_SIZE, pixelAvatarGrid } from '@/app/collab/avatar'

/**
 * An agent's pixel creature, drawn in the current text color: the same creature its name gets
 * everywhere, so an agent is recognised by its shape. Decorative; the name is always beside it.
 */
const { seed } = defineProps<{ seed: string }>()

const cells = computed(() =>
  pixelAvatarGrid(seed).flatMap((row, y) => row.flatMap((on, x) => (on ? [{ x, y }] : [])))
)
</script>

<template>
  <svg
    aria-hidden="true"
    :viewBox="`0 0 ${PIXEL_AVATAR_SIZE} ${PIXEL_AVATAR_SIZE}`"
    shape-rendering="crispEdges"
    fill="currentColor"
    class="block shrink-0"
  >
    <rect
      v-for="cell in cells"
      :key="`${cell.x}-${cell.y}`"
      :x="cell.x"
      :y="cell.y"
      width="1"
      height="1"
    />
  </svg>
</template>
