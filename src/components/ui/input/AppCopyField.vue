<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { tv, type VariantProps } from 'tailwind-variants'
import { computed } from 'vue'

import IconButton from '@/components/ui/button/IconButton.vue'
import type { ComponentUI } from '@/components/ui/types'
import theme from '@/theme/input/copy-field'

const copyField = tv(theme)
type CopyFieldVariants = VariantProps<typeof copyField>

/** Read-only text with a copy icon in its corner that copies it and briefly confirms. */
const {
  value,
  copyLabel,
  copiedLabel,
  look = 'command',
  ui
} = defineProps<{
  value: string
  copyLabel: string
  copiedLabel: string
  look?: NonNullable<CopyFieldVariants['look']>
  ui?: ComponentUI<typeof theme>
}>()

const { copy, copied } = useClipboard({ copiedDuring: 1500 })
const cls = computed(() => copyField({ look }))
</script>

<template>
  <div data-slot="copy-field" :data-look="look" :class="cls.root({ class: ui?.root })">
    <code :class="cls.value({ class: ui?.value })">{{ value }}</code>
    <IconButton
      :label="copied ? copiedLabel : copyLabel"
      :class="cls.copy({ class: ui?.copy })"
      data-slot="copy-field-button"
      @click="copy(value)"
    >
      <icon-hugeicons-tick-02 v-if="copied" class="size-3.5 text-success" />
      <icon-hugeicons-copy-01 v-else class="size-3.5" />
    </IconButton>
  </div>
</template>
