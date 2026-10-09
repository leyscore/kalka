<script lang="ts">
import type { VNode } from 'vue'

import type { ComponentUI } from '@/components/ui/types'
import type { SegmentedControlTheme } from '@/theme/select/segmented-control'

export interface SegmentedControlOption {
  value: string
  label: string
  disabled?: boolean
}

export type SegmentedControlUI = ComponentUI<SegmentedControlTheme>

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  label?: string
  size?: keyof SegmentedControlTheme['variants']['size']
  ui?: SegmentedControlUI
}

export interface SegmentedControlSlots {
  option?(props: { option: SegmentedControlOption; selected: boolean }): VNode[]
}
</script>

<script setup lang="ts">
import { tv } from 'tailwind-variants'
import { computed, useTemplateRef } from 'vue'

import { SegmentedControlItem, SegmentedControlRoot } from '@open-pencil/vue'

import { useGlide } from '@/components/ui/motion/useGlide'
import { glidePills } from '@/theme/motion/glide'
import theme from '@/theme/select/segmented-control'

const { options, label, size = 'sm', ui } = defineProps<SegmentedControlProps>()
defineSlots<SegmentedControlSlots>()
const modelValue = defineModel<string>({ required: true })
const emit = defineEmits<{ change: [value: string] }>()

const styles = computed(() => tv(theme)({ size }))

// The chosen option's pill slides to the next choice.
const root = useTemplateRef<{ $el: HTMLElement }>('root')
useGlide(
  computed(() => root.value?.$el ?? null),
  { items: '[data-state]', active: '[data-state="on"]', pillClass: glidePills.segment }
)

function select(value: string | string[] | undefined) {
  if (typeof value !== 'string') return
  modelValue.value = value
  emit('change', value)
}
</script>

<template>
  <SegmentedControlRoot
    ref="root"
    :model-value="modelValue"
    :aria-label="label"
    :class="styles.root({ class: ui?.root })"
    @update:model-value="select"
  >
    <SegmentedControlItem
      v-for="option in options"
      :key="option.value"
      v-slot="{ selected }"
      :value="option.value"
      :aria-label="option.label"
      :disabled="option.disabled"
      :class="styles.item({ class: ui?.item })"
    >
      <slot name="option" :option="option" :selected="selected">
        <span class="truncate">{{ option.label }}</span>
      </slot>
    </SegmentedControlItem>
  </SegmentedControlRoot>
</template>
