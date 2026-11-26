<script setup lang="ts">
import { computed, useId } from 'vue'

import type { Effect, NoiseType } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'
import { useEffectMessages, useI18n } from '@kalka/vue'

import ColorInput from '@/components/ColorPicker/ColorInput.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import VariableNumberField from '@/components/properties/VariableNumberField.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

import { useCanvasBlurHandles } from './canvas-blur'

/**
 * The settings of a blur, noise, texture or glass effect, under its row in the effects list.
 * `scrub` previews a value while it is dragged, `commit` ends the edit, `change` is a discrete
 * change. `radius` binds to a variable through `effects/<index>/radius`, as a shadow's does.
 */
const { effect, index, nodeId } = defineProps<{ effect: Effect; index: number; nodeId: string }>()
const emit = defineEmits<{
  scrub: [changes: Partial<Effect>]
  commit: [changes: Partial<Effect>]
  change: [changes: Partial<Effect>]
}>()

const labels = useEffectMessages()
const { panels } = useI18n()
const clipId = useId()

const isBlur = computed(() => effect.type.endsWith('_BLUR'))
const progressive = computed(() => effect.blurType === 'PROGRESSIVE')
useCanvasBlurHandles(() => (isBlur.value && progressive.value && nodeId ? { nodeId, index } : null))

const blurTypeOptions = computed(() => [
  { value: 'NORMAL', label: labels.value.uniform },
  { value: 'PROGRESSIVE', label: labels.value.progressive }
])

/** A progressive blur's ramp, as Figma's panel offers it: along one side of the layer. */
const DIRECTIONS: Record<string, [Vector, Vector]> = {
  down: [
    { x: 0.5, y: 0 },
    { x: 0.5, y: 1 }
  ],
  up: [
    { x: 0.5, y: 1 },
    { x: 0.5, y: 0 }
  ],
  right: [
    { x: 0, y: 0.5 },
    { x: 1, y: 0.5 }
  ],
  left: [
    { x: 1, y: 0.5 },
    { x: 0, y: 0.5 }
  ]
}
const directionOptions = computed(() => [
  { value: 'down', label: labels.value.topToBottom },
  { value: 'up', label: labels.value.bottomToTop },
  { value: 'right', label: labels.value.leftToRight },
  { value: 'left', label: labels.value.rightToLeft }
])
const direction = computed(() => {
  const start = effect.startOffset ?? DIRECTIONS.down[0]
  const end = effect.endOffset ?? DIRECTIONS.down[1]
  const dx = end.x - start.x
  const dy = end.y - start.y
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left'
  return dy < 0 ? 'up' : 'down'
})

function setBlurType(value: string) {
  if (value !== 'PROGRESSIVE') {
    emit('change', { blurType: 'NORMAL' })
    return
  }
  const [startOffset, endOffset] = DIRECTIONS.down
  emit('change', { blurType: 'PROGRESSIVE', startRadius: 0, startOffset, endOffset })
}

function setDirection(value: string) {
  const [startOffset, endOffset] = DIRECTIONS[value] ?? DIRECTIONS.down
  emit('change', { startOffset: { ...startOffset }, endOffset: { ...endOffset } })
}

const noiseTypeOptions = computed(() => [
  { value: 'MONOTONE', label: labels.value.monotone },
  { value: 'DUOTONE', label: labels.value.duotone },
  { value: 'MULTITONE', label: labels.value.multitone }
])

function setNoiseType(value: string) {
  const noiseType = value as NoiseType
  const changes: Partial<Effect> = { noiseType }
  if (noiseType === 'DUOTONE' && !effect.secondaryColor)
    changes.secondaryColor = { r: 1, g: 1, b: 1, a: 1 }
  if (noiseType === 'MULTITONE' && effect.opacity === undefined) changes.opacity = 1
  emit('change', changes)
}

/** A 0–1 setting shown as a percentage. */
const percent = (value: number | undefined) => Math.round((value ?? 0) * 100)
const fraction = (value: number) => Math.max(0, Math.min(1, value / 100))
</script>

<template>
  <div class="flex flex-col gap-1.5" :data-effect-kind="effect.type">
    <template v-if="isBlur">
      <PanelFieldGroup :label="labels.blurType">
        <AppSelect
          :model-value="effect.blurType ?? 'NORMAL'"
          :options="blurTypeOptions"
          :label="labels.blurType"
          data-property="effect-blur-type"
          @update:model-value="setBlurType(String($event))"
        />
      </PanelFieldGroup>
      <PanelFieldGroup v-if="progressive" :label="labels.direction">
        <AppSelect
          :model-value="direction"
          :options="directionOptions"
          :label="labels.direction"
          data-property="effect-blur-direction"
          @update:model-value="setDirection(String($event))"
        />
      </PanelFieldGroup>
      <div class="flex items-center gap-1.5">
        <Tip v-if="progressive" :label="labels.startBlur">
          <NumberField
            icon="A"
            :aria-label="labels.startBlur"
            :model-value="effect.startRadius ?? 0"
            :min="0"
            data-property="effect-start-radius"
            @update:model-value="emit('scrub', { startRadius: $event })"
            @commit="emit('commit', { startRadius: $event })"
          />
        </Tip>
        <Tip :label="progressive ? labels.endBlur : panels.radius">
          <VariableNumberField
            icon="B"
            :node-id="nodeId"
            :binding-path="`effects/${index}/radius`"
            :aria-label="progressive ? labels.endBlur : panels.radius"
            :model-value="effect.radius"
            :min="0"
            data-property="effect-radius"
            @update:model-value="emit('scrub', { radius: $event })"
            @commit="emit('commit', { radius: $event })"
          />
        </Tip>
      </div>
    </template>

    <template v-else-if="effect.type === 'NOISE'">
      <PanelFieldGroup :label="labels.noiseType">
        <AppSelect
          :model-value="effect.noiseType ?? 'MONOTONE'"
          :options="noiseTypeOptions"
          :label="labels.noiseType"
          data-property="effect-noise-type"
          @update:model-value="setNoiseType(String($event))"
        />
      </PanelFieldGroup>
      <div class="flex items-center gap-1.5">
        <Tip :label="labels.size">
          <NumberField
            icon="S"
            :aria-label="labels.size"
            :model-value="effect.noiseSize ?? 0.5"
            :min="0.1"
            :step="0.1"
            data-property="effect-noise-size"
            @update:model-value="emit('scrub', { noiseSize: $event })"
            @commit="emit('commit', { noiseSize: $event })"
          />
        </Tip>
        <Tip :label="labels.density">
          <NumberField
            icon="D"
            suffix="%"
            :aria-label="labels.density"
            :model-value="percent(effect.density ?? 0.5)"
            :min="0"
            :max="100"
            data-property="effect-noise-density"
            @update:model-value="emit('scrub', { density: fraction($event) })"
            @commit="emit('commit', { density: fraction($event) })"
          />
        </Tip>
      </div>
      <ColorInput
        v-if="effect.noiseType === 'DUOTONE'"
        :color="effect.secondaryColor ?? { r: 1, g: 1, b: 1, a: 1 }"
        editable
        :aria-label="labels.secondColor"
        data-property="effect-noise-second-color"
        @update="emit('change', { secondaryColor: $event })"
      />
      <Tip v-if="effect.noiseType === 'MULTITONE'" :label="panels.opacity">
        <NumberField
          class="w-20"
          suffix="%"
          :aria-label="panels.opacity"
          :model-value="percent(effect.opacity ?? 1)"
          :min="0"
          :max="100"
          data-property="effect-noise-opacity"
          @update:model-value="emit('scrub', { opacity: fraction($event) })"
          @commit="emit('commit', { opacity: fraction($event) })"
        />
      </Tip>
    </template>

    <template v-else-if="effect.type === 'TEXTURE'">
      <div class="flex items-center gap-1.5">
        <Tip :label="labels.size">
          <NumberField
            icon="S"
            :aria-label="labels.size"
            :model-value="effect.noiseSize ?? 0.5"
            :min="0.1"
            :step="0.1"
            data-property="effect-texture-size"
            @update:model-value="emit('scrub', { noiseSize: $event })"
            @commit="emit('commit', { noiseSize: $event })"
          />
        </Tip>
        <Tip :label="panels.radius">
          <VariableNumberField
            icon="R"
            :node-id="nodeId"
            :binding-path="`effects/${index}/radius`"
            :aria-label="panels.radius"
            :model-value="effect.radius"
            :min="0"
            data-property="effect-radius"
            @update:model-value="emit('scrub', { radius: $event })"
            @commit="emit('commit', { radius: $event })"
          />
        </Tip>
      </div>
      <label class="flex items-center gap-2 text-[11px]">
        <AppCheckbox
          :model-value="effect.clipToShape ?? true"
          :ariaLabelledby="clipId"
          data-property="effect-texture-clip"
          @update:model-value="emit('change', { clipToShape: $event })"
        />
        <span :id="clipId">{{ labels.clipToShape }}</span>
      </label>
    </template>

    <template v-else-if="effect.type === 'GLASS'">
      <div class="flex items-center gap-1.5">
        <Tip :label="labels.light">
          <NumberField
            icon="L"
            suffix="%"
            :aria-label="labels.light"
            :model-value="percent(effect.lightIntensity)"
            :min="0"
            :max="100"
            data-property="effect-glass-light"
            @update:model-value="emit('scrub', { lightIntensity: fraction($event) })"
            @commit="emit('commit', { lightIntensity: fraction($event) })"
          />
        </Tip>
        <Tip :label="labels.lightAngle">
          <NumberField
            icon="∠"
            suffix="°"
            :aria-label="labels.lightAngle"
            :model-value="effect.lightAngle ?? -45"
            :min="-180"
            :max="180"
            data-property="effect-glass-angle"
            @update:model-value="emit('scrub', { lightAngle: $event })"
            @commit="emit('commit', { lightAngle: $event })"
          />
        </Tip>
      </div>
      <div class="flex items-center gap-1.5">
        <Tip :label="labels.refraction">
          <NumberField
            icon="R"
            suffix="%"
            :aria-label="labels.refraction"
            :model-value="percent(effect.refraction)"
            :min="0"
            :max="100"
            data-property="effect-glass-refraction"
            @update:model-value="emit('scrub', { refraction: fraction($event) })"
            @commit="emit('commit', { refraction: fraction($event) })"
          />
        </Tip>
        <Tip :label="labels.depth">
          <NumberField
            icon="D"
            :aria-label="labels.depth"
            :model-value="effect.depth ?? 20"
            :min="1"
            data-property="effect-glass-depth"
            @update:model-value="emit('scrub', { depth: $event })"
            @commit="emit('commit', { depth: $event })"
          />
        </Tip>
      </div>
      <div class="flex items-center gap-1.5">
        <Tip :label="labels.dispersion">
          <NumberField
            icon="Δ"
            suffix="%"
            :aria-label="labels.dispersion"
            :model-value="percent(effect.dispersion)"
            :min="0"
            :max="100"
            data-property="effect-glass-dispersion"
            @update:model-value="emit('scrub', { dispersion: fraction($event) })"
            @commit="emit('commit', { dispersion: fraction($event) })"
          />
        </Tip>
        <Tip :label="labels.frost">
          <VariableNumberField
            icon="F"
            :node-id="nodeId"
            :binding-path="`effects/${index}/radius`"
            :aria-label="labels.frost"
            :model-value="effect.radius"
            :min="0"
            data-property="effect-radius"
            @update:model-value="emit('scrub', { radius: $event })"
            @commit="emit('commit', { radius: $event })"
          />
        </Tip>
      </div>
    </template>
  </div>
</template>
