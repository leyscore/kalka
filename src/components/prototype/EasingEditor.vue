<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import {
  easingCurve,
  easingSpring,
  springSamples,
  type CubicBezier,
  type PrototypeEasing,
  type Spring
} from '@kalka/scene-graph'
import { usePrototypeMessages } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'

/**
 * Figma's custom easing editors: a custom bezier's curve with its two handles to drag and its
 * four numbers, or a custom spring's mass, stiffness and damping with the motion they make. A
 * handle's drag is one change, made when it is let go.
 */
const { easing } = defineProps<{ easing: PrototypeEasing }>()
const emit = defineEmits<{ update: [easing: PrototypeEasing] }>()
const m = usePrototypeMessages()

/** The graph's box: time across, progress up, with room for curves that overshoot. */
const WIDTH = 200
const HEIGHT = 120
const PAD = 10
/** Progress shown from -0.5 to 1.5, so back easings and bouncy springs stay in view. */
const LOW = -0.5
const HIGH = 1.5

const px = (x: number) => PAD + x * (WIDTH - PAD * 2)
const py = (y: number) => PAD + ((HIGH - y) / (HIGH - LOW)) * (HEIGHT - PAD * 2)

/** The handles while one is dragged, before the change is made. */
const draft = shallowRef<CubicBezier | null>(null)
const curve = computed(() => draft.value ?? easingCurve(easing))
const spring = computed(() => (easing.type === 'CUSTOM_SPRING' ? easingSpring(easing) : null))

const curvePath = computed(() => {
  const c = curve.value
  if (!c) return ''
  return `M${px(0)},${py(0)} C${px(c.x1)},${py(c.y1)} ${px(c.x2)},${py(c.y2)} ${px(1)},${py(1)}`
})

const springPath = computed(() => {
  const s = spring.value
  if (!s) return ''
  const { values } = springSamples(s)
  const last = Math.max(1, values.length - 1)
  return values
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${px(index / last)},${py(value)}`)
    .join(' ')
})

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function setBezier(next: CubicBezier) {
  emit('update', {
    type: 'CUSTOM_CUBIC_BEZIER',
    bezier: {
      x1: clamp(next.x1, 0, 1),
      y1: clamp(next.y1, -1, 2),
      x2: clamp(next.x2, 0, 1),
      y2: clamp(next.y2, -1, 2)
    },
    spring: null
  })
}

function setSpring(next: Spring) {
  emit('update', {
    type: 'CUSTOM_SPRING',
    bezier: null,
    spring: {
      mass: clamp(next.mass, 0.01, 100),
      stiffness: clamp(next.stiffness, 1, 10_000),
      damping: clamp(next.damping, 0, 1000)
    }
  })
}

const round = (value: number) => Math.round(value * 100) / 100

let dragging: 1 | 2 | null = null

function grab(handle: 1 | 2, event: PointerEvent) {
  const c = curve.value
  if (!c || !(event.currentTarget instanceof Element)) return
  dragging = handle
  draft.value = { ...c }
  event.currentTarget.setPointerCapture(event.pointerId)
}

function drag(event: PointerEvent) {
  const svg = event.currentTarget instanceof Element ? event.currentTarget.closest('svg') : null
  if (!dragging || !draft.value || !svg) return
  const rect = svg.getBoundingClientRect()
  const scaleX = WIDTH / Math.max(1, rect.width)
  const scaleY = HEIGHT / Math.max(1, rect.height)
  const x = clamp(((event.clientX - rect.left) * scaleX - PAD) / (WIDTH - PAD * 2), 0, 1)
  const y = clamp(
    HIGH - (((event.clientY - rect.top) * scaleY - PAD) / (HEIGHT - PAD * 2)) * (HIGH - LOW),
    -1,
    2
  )
  draft.value =
    dragging === 1
      ? { ...draft.value, x1: round(x), y1: round(y) }
      : { ...draft.value, x2: round(x), y2: round(y) }
}

function release() {
  const next = draft.value
  dragging = null
  draft.value = null
  if (next) setBezier(next)
}

const bezierFields = computed(() => {
  const c = curve.value
  if (!c) return []
  return [
    { key: 'x1' as const, label: 'X1', value: c.x1, min: 0, max: 1 },
    { key: 'y1' as const, label: 'Y1', value: c.y1, min: -1, max: 2 },
    { key: 'x2' as const, label: 'X2', value: c.x2, min: 0, max: 1 },
    { key: 'y2' as const, label: 'Y2', value: c.y2, min: -1, max: 2 }
  ]
})

const springFields = computed(() => {
  const s = spring.value
  if (!s) return []
  return [
    { key: 'mass' as const, label: m.value.mass, value: s.mass, min: 0.01, step: 0.1 },
    { key: 'stiffness' as const, label: m.value.stiffness, value: s.stiffness, min: 1, step: 10 },
    { key: 'damping' as const, label: m.value.damping, value: s.damping, min: 0, step: 1 }
  ]
})
</script>

<template>
  <div class="flex flex-col gap-1" data-test-id="prototype-easing-editor">
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="h-[120px] w-full touch-none rounded bg-input"
      :aria-label="easing.type === 'CUSTOM_SPRING' ? m.customSpring : m.customBezier"
      role="img"
    >
      <rect
        :x="px(0)"
        :y="py(1)"
        :width="px(1) - px(0)"
        :height="py(0) - py(1)"
        class="fill-none stroke-border"
        stroke-dasharray="2 2"
      />
      <template v-if="easing.type === 'CUSTOM_CUBIC_BEZIER' && curve">
        <line :x1="px(0)" :y1="py(0)" :x2="px(curve.x1)" :y2="py(curve.y1)" class="stroke-muted" />
        <line :x1="px(1)" :y1="py(1)" :x2="px(curve.x2)" :y2="py(curve.y2)" class="stroke-muted" />
        <path :d="curvePath" class="fill-none stroke-accent" stroke-width="2" />
        <circle
          v-for="handle in [1, 2] as const"
          :key="handle"
          :cx="px(handle === 1 ? curve.x1 : curve.x2)"
          :cy="py(handle === 1 ? curve.y1 : curve.y2)"
          r="5"
          class="cursor-grab fill-panel stroke-accent"
          stroke-width="2"
          :data-handle="handle"
          @pointerdown="grab(handle, $event)"
          @pointermove="drag"
          @pointerup="release"
          @pointercancel="release"
        />
      </template>
      <path v-else :d="springPath" class="fill-none stroke-accent" stroke-width="2" />
    </svg>
    <div v-if="easing.type === 'CUSTOM_CUBIC_BEZIER'" class="grid grid-cols-4 gap-1">
      <NumberField
        v-for="field in bezierFields"
        :key="field.key"
        :label="field.label"
        :aria-label="field.label"
        :min="field.min"
        :max="field.max"
        :step="0.01"
        :data-property="`prototype-bezier-${field.key}`"
        :model-value="field.value"
        @commit="(value: number) => curve && setBezier({ ...curve, [field.key]: value })"
      />
    </div>
    <div v-else class="grid grid-cols-3 gap-1">
      <label v-for="field in springFields" :key="field.key" class="flex min-w-0 flex-col gap-0.5">
        <span class="truncate text-[10px] text-muted">{{ field.label }}</span>
        <NumberField
          :aria-label="field.label"
          :min="field.min"
          :step="field.step"
          :data-property="`prototype-spring-${field.key}`"
          :model-value="field.value"
          @commit="(value: number) => spring && setSpring({ ...spring, [field.key]: value })"
        />
      </label>
    </div>
  </div>
</template>
