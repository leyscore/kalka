<script setup lang="ts">
import { ProgressRoot } from 'reka-ui'
import { computed } from 'vue'

import type { EditorPreparation } from '@/app/editor/preparation/types'
import BrandLoader from '@/components/brand/BrandLoader.vue'
import { preparationLabel, preparationPercent } from '@/components/preparation/presentation'

const { preparation } = defineProps<{
  preparation: EditorPreparation
}>()

const label = computed(() => preparationLabel(preparation))
const progressValue = computed(() => preparationPercent(preparation.progress))
</script>

<template>
  <Transition
    leave-active-class="transition-[opacity,filter] duration-300"
    leave-to-class="opacity-0 blur-sm"
  >
    <div
      data-test-id="canvas-loading"
      role="status"
      aria-live="polite"
      :aria-label="label"
      class="absolute inset-0 z-50 flex items-center justify-center bg-design-canvas"
    >
      <div class="flex w-72 flex-col items-center gap-4 text-center">
        <!-- The K fills as the document loads; assistive technology reads the same progress. -->
        <ProgressRoot :model-value="progressValue" :aria-label="label">
          <BrandLoader :progress="progressValue" />
        </ProgressRoot>
        <div class="space-y-1">
          <p class="text-[13px] font-medium text-surface/85">{{ label }}</p>
          <p v-if="preparation.detail" class="truncate text-xs text-surface/45">
            {{ preparation.detail }}
          </p>
          <p
            v-if="progressValue !== null"
            class="font-mono text-[11px] tabular-nums text-surface/45"
          >
            {{ preparation.progress?.completed }} / {{ preparation.progress?.total }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
