<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'

import type { Color } from '../engine/scene-graph'

const props = defineProps<{
  color: Color
}>()

const emit = defineEmits<{
  update: [color: Color]
}>()

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

watch(
  () => props.color,
  (c) => {
    const hsv = rgbToHsv(c.r, c.g, c.b)
    hue.value = hsv.h
    saturation.value = hsv.s
    brightness.value = hsv.v
    alpha.value = c.a
  },
  { immediate: true }
)

function emitColor() {
  const rgb = hsvToRgb(hue.value, saturation.value, brightness.value)
  emit('update', { r: rgb.r, g: rgb.g, b: rgb.b, a: alpha.value })
}

const hexValue = computed(() => {
  const hex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `${hex(props.color.r)}${hex(props.color.g)}${hex(props.color.b)}`
})

function onHexInput(e: Event) {
  const input = (e.target as HTMLInputElement).value.replace('#', '')
  if (input.length !== 6) return
  const r = parseInt(input.slice(0, 2), 16) / 255
  const g = parseInt(input.slice(2, 4), 16) / 255
  const b = parseInt(input.slice(4, 6), 16) / 255
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return
  emit('update', { r, g, b, a: alpha.value })
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

const swatchColor = computed(() => {
  const c = props.color
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`
})
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <button class="color-trigger" :style="{ background: swatchColor }" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent class="color-popover" :side-offset="4" side="left">
        <!-- SV area -->
        <div
          ref="svAreaRef"
          class="sv-area"
          :style="{ background: hueColor }"
          @pointerdown="onSvPointerDown"
          @pointermove="onSvPointerMove"
        >
          <div class="sv-white" />
          <div class="sv-black" />
          <div
            class="sv-cursor"
            :style="{
              left: `${saturation}%`,
              top: `${100 - brightness}%`
            }"
          />
        </div>

        <!-- Hue slider -->
        <div class="slider-row">
          <input
            type="range"
            class="hue-slider"
            :value="hue"
            min="0"
            max="360"
            @input="onHueInput"
          />
        </div>

        <!-- Alpha slider -->
        <div class="slider-row">
          <input
            type="range"
            class="alpha-slider"
            :value="alpha * 100"
            min="0"
            max="100"
            @input="onAlphaSliderInput"
          />
        </div>

        <!-- Hex input -->
        <div class="hex-row">
          <span class="hash">#</span>
          <input
            type="text"
            class="hex-input"
            :value="hexValue"
            maxlength="6"
            @change="onHexInput"
          />
          <input
            type="number"
            class="alpha-input"
            :value="Math.round(alpha * 100)"
            min="0"
            max="100"
            @change="onAlphaNumberInput"
          />
          <span class="percent">%</span>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.color-trigger {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.color-popover {
  width: 224px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.sv-area {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 4px;
  cursor: crosshair;
  overflow: hidden;
}

.sv-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, white, transparent);
}

.sv-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, black, transparent);
}

.sv-cursor {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.slider-row {
  margin-top: 8px;
}

.hue-slider {
  width: 100%;
  height: 12px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 6px;
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
  outline: none;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  border: 2px solid white;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.alpha-slider {
  width: 100%;
  height: 12px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 6px;
  background: linear-gradient(to right, transparent, v-bind(hueColor));
  outline: none;
}

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

.hex-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.hash {
  font-size: 11px;
  color: var(--text-muted);
}

.hex-input {
  flex: 1;
  min-width: 0;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 3px 6px;
  font: inherit;
  font-size: 12px;
  font-family: monospace;
}

.alpha-input {
  width: 40px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 3px 4px;
  font: inherit;
  font-size: 12px;
  text-align: right;
}

.alpha-input::-webkit-inner-spin-button {
  display: none;
}

.percent {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
