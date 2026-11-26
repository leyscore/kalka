<script setup lang="ts">
import { computed } from 'vue'

import { pixelsFromPercent, spacingPercent, type SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n } from '@kalka/vue'

import { parseTypedSpacing } from '@/components/properties/typography/spacing'
import VariableNumberField from '@/components/properties/VariableNumberField.vue'

const { node } = defineProps<{ node: SceneNode }>()
const emit = defineEmits<{ update: [value: number]; commit: [value: number, previous: number] }>()
const editor = useEditor()
const { panels } = useI18n()
const percent = computed(() => node.letterSpacingUnit === 'PERCENT')
/** The value as the field shows it: pixels, or a percentage of the font size, as Figma does. */
const value = computed(() =>
  percent.value ? spacingPercent(node.letterSpacing, node.fontSize) : node.letterSpacing
)

function toPixels(shown: number): number {
  return percent.value ? pixelsFromPercent(shown, node.fontSize) : shown
}

/** Figma's field also takes `2%` and `1px`, switching the unit it shows. */
function onTyped(expression: string) {
  const typed = parseTypedSpacing(expression)
  if (!typed || typed.auto) return
  const letterSpacing =
    typed.unit === 'PERCENT' ? pixelsFromPercent(typed.value, node.fontSize) : typed.value
  editor.updateNodeWithUndo(
    node.id,
    { letterSpacing, letterSpacingUnit: typed.unit },
    'Set letter spacing'
  )
}
</script>

<template>
  <VariableNumberField
    :suffix="percent ? '%' : 'px'"
    :model-value="value"
    :aria-label="panels.letterSpacing"
    :node-id="node.id"
    binding-path="letterSpacing"
    data-property="letter-spacing"
    @update:model-value="emit('update', toPixels($event))"
    @commit="
      (current: number, previous: number) => emit('commit', toPixels(current), toPixels(previous))
    "
    @invalid="onTyped"
  >
    <template #icon>
      <icon-hugeicons-a-large-small class="size-3" />
    </template>
  </VariableNumberField>
</template>
