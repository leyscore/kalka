<script setup lang="ts">
import { computed } from 'vue'

import type { StrokeWidthPreset } from '@kalka/core/vector'
import type { StrokeBrushType } from '@kalka/scene-graph'
import { MIXED, useDrawingMessages, useStrokeDrawControls } from '@kalka/vue'
import type { StrokeBrushSetting } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const controls = useStrokeDrawControls()
const { widthPreset, brush } = controls
const messages = useDrawingMessages()

const PRESET_LABELS = {
  uniform: 'widthUniform',
  wedge: 'widthWedge',
  taper: 'widthTaper',
  eye: 'widthEye',
  rounded: 'widthRounded',
  pinch: 'widthPinch'
} as const satisfies Record<StrokeWidthPreset, keyof typeof messages.value>

const BRUSH_LABELS: Record<string, keyof typeof messages.value> = {
  calligraphy: 'brushCalligraphy',
  ink: 'brushInk',
  ribbon: 'brushRibbon',
  strands: 'brushStrands',
  dots: 'brushDots',
  stars: 'brushStars',
  leaves: 'brushLeaves',
  confetti: 'brushConfetti'
}

type PresetValue = StrokeWidthPreset | 'custom' | 'MIXED'

const presetOptions = computed(() => {
  const options: { value: PresetValue; label: string; disabled?: boolean }[] =
    controls.widthPresets.map((preset) => ({
      value: preset,
      label: messages.value[PRESET_LABELS[preset]]
    }))
  if (widthPreset.value === 'custom')
    options.push({ value: 'custom', label: messages.value.widthCustom, disabled: true })
  return options
})

const presetValue = computed<PresetValue>(() =>
  widthPreset.value === MIXED ? 'MIXED' : widthPreset.value
)

function isPreset(value: PresetValue | null): value is StrokeWidthPreset {
  return value !== null && value !== 'custom' && value !== 'MIXED'
}

const brushType = computed<StrokeBrushType | 'none' | 'MIXED'>(() => {
  if (brush.value === MIXED) return 'MIXED'
  return brush.value?.type ?? 'none'
})

const typeOptions = computed(() => [
  { value: 'none', label: messages.value.brushNone },
  { value: 'STRETCH', label: messages.value.brushStretch },
  { value: 'SCATTER', label: messages.value.brushScatter }
])

function setBrushType(value: string) {
  if (value === 'none') controls.setBrush('none')
  else if (value === 'STRETCH' || value === 'SCATTER') {
    controls.setBrush(`${value}:${controls.brushes[value][0]}`)
  }
}

const brushOptions = computed(() => {
  const type = brushType.value
  if (type !== 'STRETCH' && type !== 'SCATTER') return []
  return controls.brushes[type].map((id) => ({
    value: id,
    label: messages.value[BRUSH_LABELS[id] ?? 'brushNone']
  }))
})

const current = computed(() => (brush.value === MIXED ? null : brush.value))

function setBrushId(id: string) {
  const type = brushType.value
  if (type === 'STRETCH' || type === 'SCATTER') controls.setBrush(`${type}:${id}`)
}

/** Jitters read as percentages; the brush keeps them as fractions. */
const PERCENT_SETTINGS = new Set<StrokeBrushSetting>(['sizeJitter', 'angularJitter'])
const scatterFields: { key: StrokeBrushSetting; label: keyof typeof messages.value }[] = [
  { key: 'gap', label: 'brushGap' },
  { key: 'wiggle', label: 'brushWiggle' },
  { key: 'sizeJitter', label: 'brushSizeJitter' },
  { key: 'angularJitter', label: 'brushAngularJitter' },
  { key: 'rotation', label: 'brushRotation' }
]

function shown(key: StrokeBrushSetting): number {
  const value = current.value?.[key] ?? 0
  return PERCENT_SETTINGS.has(key) ? Math.round(value * 100) : value
}

function stored(key: StrokeBrushSetting, value: number): number {
  return PERCENT_SETTINGS.has(key) ? Math.max(0, Math.min(100, value)) / 100 : value
}
</script>

<template>
  <div
    v-if="controls.available.value"
    class="flex flex-col gap-3 border-b border-border pb-3"
    data-property="stroke-draw"
  >
    <PanelFieldGroup :label="messages.widthProfile">
      <AppSelect
        :model-value="presetValue"
        class="w-full"
        :label="messages.widthProfile"
        :options="presetOptions"
        data-property="stroke-width-profile"
        :preview="(value) => controls.previewWidthPreset(isPreset(value) ? value : null)"
        @update:model-value="isPreset($event) && controls.setWidthPreset($event)"
      />
    </PanelFieldGroup>
    <PanelFieldGroup :label="messages.brush">
      <SegmentedControl
        :model-value="brushType"
        :options="typeOptions"
        :label="messages.brush"
        data-property="stroke-brush-type"
        @update:model-value="setBrushType"
      />
    </PanelFieldGroup>
    <AppSelect
      v-if="current"
      :model-value="current.id"
      class="w-full"
      :label="messages.brush"
      :options="brushOptions"
      data-property="stroke-brush"
      @update:model-value="setBrushId"
    />
    <div v-if="current?.type === 'SCATTER'" class="grid grid-cols-2 gap-2">
      <PanelFieldGroup v-for="field in scatterFields" :key="field.key" :label="messages[field.label]">
        <NumberField
          :model-value="shown(field.key)"
          :min="field.key === 'gap' ? 0.1 : field.key === 'rotation' ? -360 : 0"
          :max="PERCENT_SETTINGS.has(field.key) ? 100 : undefined"
          :step="field.key === 'gap' || field.key === 'wiggle' ? 0.1 : 1"
          :aria-label="messages[field.label]"
          :data-property="`stroke-brush-${field.key}`"
          @update:model-value="controls.previewBrushSetting(field.key, stored(field.key, $event))"
          @commit="controls.commitBrushSetting(field.key, stored(field.key, $event))"
        />
      </PanelFieldGroup>
    </div>
    <div
      v-if="current?.type === 'STRETCH'"
      class="flex items-center justify-between gap-2 text-xs text-surface"
    >
      <span>{{ messages.brushReverse }}</span>
      <AppSwitch
        :label="messages.brushReverse"
        :model-value="current.reverse"
        data-property="stroke-brush-reverse"
        @update:model-value="controls.setBrushReverse"
      />
    </div>
  </div>
</template>
