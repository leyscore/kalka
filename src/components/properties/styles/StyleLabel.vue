<script setup lang="ts">
import { computed } from 'vue'

import type { SceneNode, SharedStyleType } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import FillSwatch from '@/components/ui/paint/FillSwatch.vue'

import { styleSwatchFill, textStylePreviewStyle, textStyleSummary } from './preview'

/**
 * A style as its lists show it, as Figma's: a text style's name in its own face with its size and
 * line height, a colour style's swatch, an effect or grid style's icon, then its name.
 */
const { type, label, definition } = defineProps<{
  type: SharedStyleType
  label: string
  definition: SceneNode | null
}>()
const { panels } = useI18n()
const swatch = computed(() => (type === 'FILL' ? styleSwatchFill(definition) : null))
</script>

<template>
  <template v-if="type === 'TEXT'">
    <span class="min-w-0 flex-1 truncate text-surface" :style="textStylePreviewStyle(definition)">{{
      label
    }}</span>
    <span class="shrink-0 text-[11px] text-muted tabular-nums">
      {{ textStyleSummary(definition, panels.auto) }}
    </span>
  </template>
  <template v-else>
    <FillSwatch v-if="swatch" :fill="swatch" class="size-4 shrink-0 rounded-sm" />
    <span
      v-else-if="type === 'FILL'"
      class="size-4 shrink-0 rounded-sm border border-border"
      aria-hidden="true"
    />
    <icon-hugeicons-blend
      v-else-if="type === 'EFFECT'"
      class="size-3.5 shrink-0 text-muted"
      aria-hidden="true"
    />
    <icon-hugeicons-layout-grid v-else class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
    <span class="min-w-0 flex-1 truncate text-xs text-surface">{{ label }}</span>
  </template>
</template>
