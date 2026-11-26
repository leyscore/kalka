<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText
} from 'reka-ui'
import { computed } from 'vue'

import { pixelsFromPercent, spacingPercent, type SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n, useRetainedPopup } from '@kalka/vue'

import { parseTypedSpacing } from '@/components/properties/typography/spacing'
import VariableNumberField from '@/components/properties/VariableNumberField.vue'
import { useSelectUI } from '@/components/ui/select/select'

type LineHeightMode = 'AUTO' | 'PIXELS' | 'PERCENT'

const { node, apply } = defineProps<{
  node: SceneNode
  /** Writes a unit or mode change, one undo step; the layer itself by default. */
  apply?: (changes: Partial<SceneNode>, label: string) => void
}>()
const emit = defineEmits<{ update: [value: number]; commit: [value: number, previous: number] }>()
const editor = useEditor()
const { open: popupOpen, portalActive } = useRetainedPopup()
const { panels } = useI18n()
const automatic = computed(() => node.lineHeight == null && !node.boundVariables.lineHeight)
const percent = computed(() => !automatic.value && node.lineHeightUnit === 'PERCENT')
const pixels = computed(() => node.lineHeight ?? Math.round((node.fontSize || 14) * 1.2))
/** The value as the field shows it: pixels, or a percentage of the font size, as Figma does. */
const value = computed(() =>
  percent.value ? spacingPercent(pixels.value, node.fontSize) : pixels.value
)
const mode = computed<LineHeightMode>(() => {
  if (automatic.value) return 'AUTO'
  return percent.value ? 'PERCENT' : 'PIXELS'
})
const menu = useSelectUI()

function toPixels(shown: number): number {
  return percent.value ? pixelsFromPercent(shown, node.fontSize) : shown
}

function setLineHeight(lineHeight: number, unit: SceneNode['lineHeightUnit']) {
  if (apply) apply({ lineHeight, lineHeightUnit: unit }, 'Set line height')
  else editor.updateNodeWithUndo(node.id, { lineHeight, lineHeightUnit: unit }, 'Set line height')
}

function setMode(next: string) {
  if (next === 'AUTO' && apply) {
    apply({ lineHeight: null, lineHeightUnit: 'PIXELS' }, 'Use automatic line height')
  } else if (next === 'AUTO') {
    editor.undo.runBatch('Use automatic line height', () => {
      if (node.boundVariables.lineHeight) editor.unbindVariable(node.id, 'lineHeight')
      editor.updateNodeWithUndo(
        node.id,
        { lineHeight: null, lineHeightUnit: 'PIXELS' },
        'Use automatic line height'
      )
    })
  } else if (next === 'PIXELS' || next === 'PERCENT') {
    if (next !== mode.value) setLineHeight(pixels.value, next)
  }
}

/** Figma's field also takes `Auto`, `150%` and `24px`, which a number field does not read. */
function onTyped(expression: string) {
  const typed = parseTypedSpacing(expression)
  if (!typed) return
  if (typed.auto) setMode('AUTO')
  else if (typed.unit === 'PERCENT')
    setLineHeight(pixelsFromPercent(typed.value, node.fontSize), 'PERCENT')
  else setLineHeight(typed.value, 'PIXELS')
}
</script>

<template>
  <VariableNumberField
    :model-value="value"
    :aria-label="panels.lineHeight"
    :suffix="percent ? '%' : 'px'"
    :min="0"
    :node-id="node.id"
    binding-path="lineHeight"
    data-property="line-height"
    @update:model-value="emit('update', toPixels($event))"
    @commit="(current, previous) => emit('commit', toPixels(current), toPixels(previous))"
    @invalid="onTyped"
  >
    <template #icon><icon-hugeicons-baseline class="size-3" /></template>
    <template v-if="automatic" #display
      ><span class="min-w-0 flex-1 truncate text-surface">{{ panels.auto }}</span></template
    >
    <template #after-variable>
      <SelectRoot v-model:open="popupOpen" :model-value="mode" @update:model-value="setMode">
        <SelectTrigger
          :aria-label="panels.lineHeightMode"
          class="flex shrink-0 items-center self-stretch px-1 text-muted"
          @pointerdown.stop
          ><icon-hugeicons-chevron-down class="size-3"
        /></SelectTrigger>
        <SelectPortal v-if="portalActive">
          <SelectContent position="popper" :side-offset="4" :class="menu.content">
            <SelectViewport>
              <SelectItem value="AUTO" :class="menu.item"
                ><SelectItemText>{{ panels.auto }}</SelectItemText></SelectItem
              >
              <SelectItem value="PIXELS" :class="menu.item"
                ><SelectItemText>{{ panels.lineHeightPixels }}</SelectItemText></SelectItem
              >
              <SelectItem value="PERCENT" :class="menu.item"
                ><SelectItemText>{{ panels.lineHeightPercent }}</SelectItemText></SelectItem
              >
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </template>
  </VariableNumberField>
</template>
