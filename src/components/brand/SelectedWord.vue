<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { selectedWord } from '@/theme/brand'

/** How far the corner is dragged in the loop; the grown badge adds it to the measured size. */
const GROW = { width: 14, height: 10 }
const CORNERS = ['tl', 'tr', 'bl', 'br'] as const

const { ai, common } = useI18n()
const root = useTemplateRef<HTMLElement>('root')
const { width, height } = useElementSize(root)

function badge(w: number, h: number): string {
  return `span  ${Math.round(w)} × ${Math.round(h)}`
}
const rest = computed(() => badge(width.value, height.value))
const grown = computed(() => badge(width.value + GROW.width, height.value + GROW.height))

const frame = selectedWord()
</script>

<template>
  <span ref="root" :class="frame.root()">
    <slot />
    <span :class="frame.box()" aria-hidden="true">
      <i v-for="corner in CORNERS" :key="corner" :class="frame.handle({ corner })" />
      <template v-if="width > 0">
        <span :class="frame.size({ state: 'rest' })">{{ rest }}</span>
        <span :class="frame.size({ state: 'grown' })">{{ grown }}</span>
      </template>
    </span>
    <span :class="frame.cursor({ who: 'agent' })" aria-hidden="true">
      <icon-hugeicons-cursor-02 :class="frame.arrow({ who: 'agent' })" />
      <span :class="frame.tag({ who: 'agent' })">{{ ai.modelAgentConnection }}</span>
    </span>
    <span :class="frame.cursor({ who: 'you' })" aria-hidden="true">
      <icon-hugeicons-cursor-02 :class="frame.arrow({ who: 'you' })" />
      <span :class="frame.tag({ who: 'you' })">{{ common.you }}</span>
    </span>
  </span>
</template>
