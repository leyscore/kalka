<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent,
  SelectRoot, SelectTrigger, SelectValue, SelectPortal, SelectContent, SelectItem, SelectItemText, SelectItemIndicator, SelectViewport,
} from 'reka-ui'

import ScrubInput from './ScrubInput.vue'
import { colorToHexRaw, colorToRgba255, parseColor } from '../engine/color'

import type { Color } from '../types'
import type { Fill, FillType, GradientStop, GradientTransform } from '../engine/scene-graph'

type FillCategory = 'SOLID' | 'GRADIENT' | 'IMAGE'
type GradientSubtype = 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'

const GRADIENT_SUBTYPES: { type: GradientSubtype; label: string }[] = [
  { type: 'GRADIENT_LINEAR', label: 'Linear' },
  { type: 'GRADIENT_RADIAL', label: 'Radial' },
  { type: 'GRADIENT_ANGULAR', label: 'Angular' },
  { type: 'GRADIENT_DIAMOND', label: 'Diamond' },
]

const DEFAULT_GRADIENT_TRANSFORMS: Record<GradientSubtype, GradientTransform> = {
  GRADIENT_LINEAR:  { m00: 1,   m01: 0, m02: 0,   m10: 0,   m11: 0,   m12: 0.5 },
  GRADIENT_RADIAL:  { m00: 0.5, m01: 0, m02: 0.5, m10: 0,   m11: 0.5, m12: 0.5 },
  GRADIENT_ANGULAR: { m00: 0.5, m01: 0, m02: 0.5, m10: 0,   m11: 0.5, m12: 0.5 },
  GRADIENT_DIAMOND: { m00: 0.5, m01: 0, m02: 0.5, m10: 0,   m11: 0.5, m12: 0.5 },
}

const props = defineProps<{
  fill: Fill
}>()

const emit = defineEmits<{
  update: [fill: Fill]
}>()

const activeStopIndex = ref(0)

const fillCategory = computed<FillCategory>(() => {
  if (props.fill.type.startsWith('GRADIENT')) return 'GRADIENT'
  if (props.fill.type === 'IMAGE') return 'IMAGE'
  return 'SOLID'
})

const isGradient = computed(() => fillCategory.value === 'GRADIENT')

const gradientSubtype = computed(() =>
  isGradient.value ? props.fill.type as GradientSubtype : 'GRADIENT_LINEAR'
)

const activeColor = computed(() => {
  if (isGradient.value && props.fill.gradientStops?.length) {
    const idx = Math.min(activeStopIndex.value, props.fill.gradientStops.length - 1)
    return props.fill.gradientStops[idx].color
  }
  return props.fill.color
})

const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alpha = ref(1)

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h, s: s * 100, v: v * 100 }
}

function hsvToRgb(h: number, s: number, v: number) {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return { r: r + m, g: g + m, b: b + m }
}

function syncFromColor(c: Color) {
  const hsv = rgbToHsv(c.r, c.g, c.b)
  hue.value = hsv.h
  saturation.value = hsv.s
  brightness.value = hsv.v
  alpha.value = c.a
}

watch(activeColor, syncFromColor, { immediate: true })

function currentRgb(): Color {
  const rgb = hsvToRgb(hue.value, saturation.value, brightness.value)
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: alpha.value }
}

function emitColor() {
  const color = currentRgb()
  if (isGradient.value && props.fill.gradientStops?.length) {
    const stops = [...props.fill.gradientStops]
    const idx = Math.min(activeStopIndex.value, stops.length - 1)
    stops[idx] = { ...stops[idx], color }
    emit('update', { ...props.fill, gradientStops: stops })
  } else {
    emit('update', { ...props.fill, color })
  }
}

function setCategory(cat: FillCategory) {
  if (cat === fillCategory.value) return
  if (cat === 'SOLID') {
    const color = props.fill.gradientStops?.length
      ? { ...props.fill.gradientStops[0].color }
      : props.fill.color
    emit('update', { ...props.fill, type: 'SOLID', color })
  } else if (cat === 'GRADIENT') {
    const type: GradientSubtype = 'GRADIENT_LINEAR'
    const stops = props.fill.gradientStops?.length
      ? props.fill.gradientStops
      : [
          { color: { ...props.fill.color }, position: 0 },
          { color: { r: 1, g: 1, b: 1, a: 1 }, position: 1 },
        ]
    emit('update', {
      ...props.fill,
      type,
      gradientStops: stops,
      gradientTransform: DEFAULT_GRADIENT_TRANSFORMS[type],
    })
    activeStopIndex.value = 0
  } else {
    emit('update', { ...props.fill, type: 'IMAGE' })
  }
}

function setGradientSubtype(type: string) {
  const subtype = type as GradientSubtype
  if (subtype === props.fill.type) return
  emit('update', {
    ...props.fill,
    type: subtype,
    gradientTransform: DEFAULT_GRADIENT_TRANSFORMS[subtype],
  })
}

function selectStop(index: number) {
  activeStopIndex.value = index
  if (props.fill.gradientStops?.[index]) {
    syncFromColor(props.fill.gradientStops[index].color)
  }
}

function addStop() {
  if (!props.fill.gradientStops) return
  const stops = [...props.fill.gradientStops]
  const newPos = stops.length >= 2
    ? (stops[stops.length - 2].position + stops[stops.length - 1].position) / 2
    : 0.5
  const color = currentRgb()
  stops.push({ color, position: newPos })
  stops.sort((a, b) => a.position - b.position)
  const newIndex = stops.findIndex(s => s.position === newPos)
  activeStopIndex.value = newIndex
  emit('update', { ...props.fill, gradientStops: stops })
}

function removeStop(index: number) {
  if (!props.fill.gradientStops || props.fill.gradientStops.length <= 2) return
  const stops = props.fill.gradientStops.filter((_, i) => i !== index)
  activeStopIndex.value = Math.min(activeStopIndex.value, stops.length - 1)
  emit('update', { ...props.fill, gradientStops: stops })
}

function updateStopPosition(index: number, value: string) {
  if (!props.fill.gradientStops) return
  const pos = Math.max(0, Math.min(100, Number(value))) / 100
  const stops = [...props.fill.gradientStops]
  stops[index] = { ...stops[index], position: pos }
  emit('update', { ...props.fill, gradientStops: stops })
}

function updateStopColor(index: number, hex: string) {
  if (!props.fill.gradientStops) return
  const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`)
  if (!color) return
  const stops = [...props.fill.gradientStops]
  stops[index] = { ...stops[index], color: { ...color, a: stops[index].color.a } }
  emit('update', { ...props.fill, gradientStops: stops })
}

function updateStopOpacity(index: number, value: string) {
  if (!props.fill.gradientStops) return
  const a = Math.max(0, Math.min(100, Number(value))) / 100
  const stops = [...props.fill.gradientStops]
  stops[index] = { ...stops[index], color: { ...stops[index].color, a } }
  emit('update', { ...props.fill, gradientStops: stops })
}

const hexValue = computed(() => colorToHexRaw(activeColor.value))

function onHexInput(e: Event) {
  const input = (e.target as HTMLInputElement).value.replace('#', '')
  if (input.length !== 6) return
  const parsed = parseColor(`#${input}`)
  const rgb: Color = { ...parsed, a: alpha.value }

  if (isGradient.value && props.fill.gradientStops?.length) {
    const stops = [...props.fill.gradientStops]
    const idx = Math.min(activeStopIndex.value, stops.length - 1)
    stops[idx] = { ...stops[idx], color: rgb }
    emit('update', { ...props.fill, gradientStops: stops })
  } else {
    emit('update', { ...props.fill, color: rgb })
  }
  syncFromColor(rgb)
}

const svAreaRef = ref<HTMLDivElement | null>(null)

function onSvPointerDown(e: PointerEvent) {
  const el = svAreaRef.value
  if (!el) return
  el.setPointerCapture(e.pointerId)
  updateSv(e)
}

function onSvPointerMove(e: PointerEvent) {
  const el = svAreaRef.value
  if (!el || !el.hasPointerCapture(e.pointerId)) return
  updateSv(e)
}

function updateSv(e: PointerEvent) {
  const el = svAreaRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  saturation.value = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  brightness.value = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100))
  emitColor()
}

function onHueInput(e: Event) {
  hue.value = +(e.target as HTMLInputElement).value
  emitColor()
}

function onAlphaSliderInput(e: Event) {
  alpha.value = +(e.target as HTMLInputElement).value / 100
  emitColor()
}

function onAlphaNumberInput(e: Event) {
  alpha.value = Math.max(0, Math.min(1, +(e.target as HTMLInputElement).value / 100))
  emitColor()
}

const hueColor = computed(() => {
  const rgb = hsvToRgb(hue.value, 100, 100)
  return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`
})

const swatchBackground = computed(() => {
  if (isGradient.value && props.fill.gradientStops?.length) {
    const stops = props.fill.gradientStops
      .map(s => {
        const rgba = colorToRgba255(s.color)
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${s.color.a}) ${s.position * 100}%`
      })
      .join(', ')
    return `linear-gradient(to right, ${stops})`
  }
  const rgba = colorToRgba255(props.fill.color)
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${props.fill.color.a})`
})

const gradientBarBackground = computed(() => {
  if (!props.fill.gradientStops?.length) return ''
  const stops = props.fill.gradientStops
    .map(s => {
      const rgba = colorToRgba255(s.color)
      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${s.color.a}) ${s.position * 100}%`
    })
    .join(', ')
  return `linear-gradient(to right, ${stops})`
})

const gradientStopBarRef = ref<HTMLDivElement | null>(null)
const draggingStopIndex = ref<number | null>(null)

function onStopPointerDown(index: number, e: PointerEvent) {
  selectStop(index)
  draggingStopIndex.value = index
  const el = gradientStopBarRef.value
  if (el) el.setPointerCapture(e.pointerId)
}

function onStopBarPointerMove(e: PointerEvent) {
  const el = gradientStopBarRef.value
  if (!el || draggingStopIndex.value === null || !el.hasPointerCapture(e.pointerId)) return
  const rect = el.getBoundingClientRect()
  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const stops = [...(props.fill.gradientStops ?? [])]
  stops[draggingStopIndex.value] = { ...stops[draggingStopIndex.value], position: pos }
  emit('update', { ...props.fill, gradientStops: stops })
}

function onStopBarPointerUp() {
  draggingStopIndex.value = null
}

function stopSwatchColor(stop: GradientStop) {
  const rgba = colorToRgba255(stop.color)
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${stop.color.a})`
}
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <button
        class="size-5 shrink-0 cursor-pointer rounded border border-border p-0"
        :style="{ background: swatchBackground }"
      />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="z-[100] w-60 rounded-lg border border-border bg-panel p-2 shadow-xl"
        :side-offset="4"
        side="left"
      >
        <!-- Fill category tabs: Solid | Gradient | Image -->
        <div class="mb-2 flex items-center gap-0.5">
          <button
            class="flex size-6 cursor-pointer items-center justify-center rounded border-none p-0 text-muted transition-colors hover:bg-hover hover:text-surface"
            :class="{ 'bg-hover text-surface': fillCategory === 'SOLID' }"
            title="Solid"
            @click="setCategory('SOLID')"
          >
            <svg class="size-3.5" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" /></svg>
          </button>
          <button
            class="flex size-6 cursor-pointer items-center justify-center rounded border-none p-0 text-muted transition-colors hover:bg-hover hover:text-surface"
            :class="{ 'bg-hover text-surface': fillCategory === 'GRADIENT' }"
            title="Gradient"
            @click="setCategory('GRADIENT')"
          >
            <svg class="size-3.5" viewBox="0 0 16 16"><defs><linearGradient id="gl"><stop offset="0" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs><rect x="2" y="2" width="12" height="12" rx="2" fill="url(#gl)" /></svg>
          </button>
          <button
            class="flex size-6 cursor-pointer items-center justify-center rounded border-none p-0 text-muted transition-colors hover:bg-hover hover:text-surface"
            :class="{ 'bg-hover text-surface': fillCategory === 'IMAGE' }"
            title="Image"
            @click="setCategory('IMAGE')"
          >
            <icon-lucide-image class="size-3.5" />
          </button>
        </div>

        <!-- Gradient subtype dropdown -->
        <div v-if="isGradient" class="mb-2">
          <SelectRoot :model-value="gradientSubtype" @update:model-value="setGradientSubtype">
            <SelectTrigger class="flex h-7 w-28 cursor-pointer items-center justify-between rounded border border-border bg-input px-2 text-xs text-surface">
              <SelectValue />
              <icon-lucide-chevron-down class="size-3 text-muted" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent class="z-[200] min-w-[112px] rounded-md border border-border bg-panel py-1 shadow-xl" position="popper" side="bottom" :side-offset="4" :align="'start'">
                <SelectViewport>
                  <SelectItem
                    v-for="sub in GRADIENT_SUBTYPES"
                    :key="sub.type"
                    :value="sub.type"
                    class="relative flex cursor-pointer items-center rounded py-1 pr-2 pl-6 text-xs text-surface outline-none data-[highlighted]:bg-accent data-[highlighted]:text-white"
                  >
                    <SelectItemIndicator class="absolute left-1.5">
                      <icon-lucide-check class="size-3" />
                    </SelectItemIndicator>
                    <SelectItemText>{{ sub.label }}</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>
        </div>

        <!-- Gradient stop bar -->
        <div
          v-if="isGradient && fill.gradientStops?.length"
          ref="gradientStopBarRef"
          class="relative mb-2 h-6 rounded"
          :style="{ background: gradientBarBackground }"
          @pointermove="onStopBarPointerMove"
          @pointerup="onStopBarPointerUp"
        >
          <div
            v-for="(stop, idx) in fill.gradientStops"
            :key="idx"
            class="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-sm border-2 shadow-sm"
            :class="idx === activeStopIndex ? 'border-white' : 'border-white/60'"
            :style="{
              left: `${stop.position * 100}%`,
              background: stopSwatchColor(stop),
            }"
            @pointerdown.stop="onStopPointerDown(idx, $event)"
          />
        </div>

        <!-- Gradient stops list -->
        <div v-if="isGradient && fill.gradientStops?.length" class="mb-2">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-[11px] text-muted">Stops</span>
            <button
              class="flex size-4 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-muted hover:text-surface"
              title="Add stop"
              @click="addStop"
            >
              <icon-lucide-plus class="size-3" />
            </button>
          </div>
          <div
            v-for="(stop, idx) in fill.gradientStops"
            :key="idx"
            class="flex items-center gap-1 py-0.5"
            :class="{ 'rounded bg-hover/50': idx === activeStopIndex }"
            @click="selectStop(idx)"
          >
            <ScrubInput
              class="w-11"
              suffix="%"
              :model-value="Math.round(stop.position * 100)"
              :min="0"
              :max="100"
              @update:model-value="updateStopPosition(idx, String($event))"
              @click.stop
            />
            <button
              class="size-4 shrink-0 cursor-pointer rounded border border-border p-0"
              :style="{ background: stopSwatchColor(stop) }"
              @click.stop="selectStop(idx)"
            />
            <input
              class="min-w-0 flex-1 rounded border border-border bg-input px-1 py-0.5 font-mono text-[11px] text-surface"
              :value="colorToHexRaw(stop.color)"
              maxlength="6"
              @change="updateStopColor(idx, ($event.target as HTMLInputElement).value)"
              @click.stop
            />
            <ScrubInput
              class="w-9"
              suffix="%"
              :model-value="Math.round(stop.color.a * 100)"
              :min="0"
              :max="100"
              @update:model-value="updateStopOpacity(idx, String($event))"
              @click.stop
            />
            <button
              v-if="(fill.gradientStops?.length ?? 0) > 2"
              class="flex size-4 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-muted hover:text-surface"
              @click.stop="removeStop(idx)"
            >−</button>
          </div>
        </div>

        <!-- Image placeholder -->
        <div
          v-if="fill.type === 'IMAGE'"
          class="flex h-24 items-center justify-center rounded border border-dashed border-border text-xs text-muted"
        >
          Image fill (coming soon)
        </div>

        <!-- HSV color area (solid mode, or editing active gradient stop) -->
        <template v-if="fill.type !== 'IMAGE'">
          <div
            ref="svAreaRef"
            class="relative h-[140px] w-full cursor-crosshair overflow-hidden rounded"
            :style="{ background: hueColor }"
            @pointerdown="onSvPointerDown"
            @pointermove="onSvPointerMove"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div
              class="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
              :style="{ left: `${saturation}%`, top: `${100 - brightness}%` }"
            />
          </div>

          <!-- Hue slider -->
          <div class="mt-2">
            <input type="range" class="hue-slider" :value="hue" min="0" max="360" @input="onHueInput" />
          </div>

          <!-- Alpha slider -->
          <div class="alpha-wrap mt-2">
            <div class="alpha-gradient" :style="{ background: `linear-gradient(to right, transparent, ${hueColor})` }" />
            <input type="range" class="alpha-slider" :value="alpha * 100" min="0" max="100" @input="onAlphaSliderInput" />
          </div>

          <!-- Hex input -->
          <div class="mt-2 flex items-center gap-1">
            <span class="text-[11px] text-muted">#</span>
            <input
              type="text"
              class="min-w-0 flex-1 rounded border border-border bg-input px-1.5 py-0.5 font-mono text-xs text-surface"
              :value="hexValue"
              maxlength="6"
              @change="onHexInput"
            />
            <input
              type="number"
              class="w-10 rounded border border-border bg-input px-1 py-0.5 text-right text-xs text-surface [appearance:textfield] [[&::-webkit-inner-spin-button]:hidden::-webkit-inner-spin-button]:hidden"
              :value="Math.round(alpha * 100)"
              min="0"
              max="100"
              @change="onAlphaNumberInput"
            />
            <span class="text-[11px] text-muted">%</span>
          </div>
        </template>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.hue-slider,
.alpha-slider {
  width: 100%;
  height: 12px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 6px;
  outline: none;
}

.hue-slider {
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.alpha-wrap {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background-image:
    linear-gradient(45deg, #444 25%, transparent 25%),
    linear-gradient(-45deg, #444 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #444 75%),
    linear-gradient(-45deg, transparent 75%, #444 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  background-color: #333;
}

.alpha-gradient {
  position: absolute;
  inset: 0;
  border-radius: 6px;
}

.alpha-slider {
  position: absolute;
  inset: 0;
  background: transparent;
}

.hue-slider::-webkit-slider-thumb,
.alpha-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
</style>
