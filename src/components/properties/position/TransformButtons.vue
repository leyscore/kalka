<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import IconButton from '@/components/ui/button/IconButton.vue'

/** Flip and quarter-turn buttons, kept apart so a gesture's position changes do not redraw them. */
const { flip, rotate } = defineProps<{
  flip: (axis: 'horizontal' | 'vertical') => void
  rotate: (degrees: number) => void
}>()

const { panels } = useI18n()
</script>

<template>
  <div class="flex h-6 items-center justify-end gap-0.5">
    <IconButton :label="panels.flipHorizontal" size="xs" @click="flip('horizontal')">
      <icon-hugeicons-flip-horizontal2 class="size-3.5" />
    </IconButton>
    <IconButton :label="panels.flipVertical" size="xs" @click="flip('vertical')">
      <icon-hugeicons-flip-vertical2 class="size-3.5" />
    </IconButton>
    <IconButton :label="panels.rotate90" size="xs" @click="rotate(90)">
      <icon-hugeicons-rotate-cw-square class="size-3.5" />
    </IconButton>
  </div>
</template>
