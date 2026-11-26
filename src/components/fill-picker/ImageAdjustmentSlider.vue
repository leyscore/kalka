<script setup lang="ts">
import { SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed } from 'vue'

import { imageAdjustment } from '@/theme/image-adjustment'

/**
 * One of Figma's image adjustments: a slider from -100 to 100 that rests at 0 in the middle. A
 * drag shows each step with `update` and ends with `commit`; a double click puts it back to 0.
 */
const { label, modelValue } = defineProps<{ label: string; modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number]; commit: [value: number] }>()
const ui = imageAdjustment()

const position = computed<number[]>({
  get: () => [modelValue],
  set: ([next]) => {
    if (next !== undefined) emit('update:modelValue', next)
  }
})

/** The filled part, from the centre to the value. */
const rangeStyle = computed(() => {
  const at = (modelValue + 100) / 2
  return { left: `${Math.min(50, at)}%`, width: `${Math.abs(at - 50)}%` }
})

function commit(values: number[]) {
  const [value] = values
  if (value !== undefined) emit('commit', value)
}
</script>

<template>
  <div :class="ui.root()">
    <span :class="ui.label()">{{ label }}</span>
    <SliderRoot
      v-model="position"
      :min="-100"
      :max="100"
      :step="1"
      :class="ui.slider()"
      @value-commit="commit"
      @dblclick="emit('commit', 0)"
    >
      <SliderTrack :class="ui.track()">
        <span :class="ui.centre()" aria-hidden="true" />
        <span :class="ui.range()" :style="rangeStyle" aria-hidden="true" />
      </SliderTrack>
      <SliderThumb :class="ui.thumb()" :aria-label="label" />
    </SliderRoot>
    <span :class="ui.value()">{{ modelValue }}</span>
  </div>
</template>
