<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventListener } from '@vueuse/core'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  icon?: string
  label?: string
  suffix?: string
  sensitivity?: number
}>(), {
  min: -Infinity,
  max: Infinity,
  step: 1,
  sensitivity: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const editing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const scrubbing = ref(false)

let stopMove: (() => void) | undefined
let stopUp: (() => void) | undefined

const displayValue = computed(() => Math.round(props.modelValue))

function startScrub(e: PointerEvent) {
  e.preventDefault()
  scrubbing.value = true
  let startX = e.clientX
  let accumulated = props.modelValue
  document.body.style.cursor = 'ew-resize'

  stopMove = useEventListener(document, 'pointermove', (ev: PointerEvent) => {
    const dx = ev.clientX - startX
    startX = ev.clientX
    accumulated += dx * props.step * props.sensitivity
    const clamped = Math.round(Math.min(props.max, Math.max(props.min, accumulated)))
    if (clamped !== props.modelValue) {
      emit('update:modelValue', clamped)
    }
  })

  stopUp = useEventListener(document, 'pointerup', () => {
    scrubbing.value = false
    document.body.style.cursor = ''
    stopMove?.()
    stopUp?.()
  })
}

function startEdit() {
  editing.value = true
  requestAnimationFrame(() => {
    inputRef.value?.select()
  })
}

function commitEdit(e: Event) {
  const val = +(e.target as HTMLInputElement).value
  if (!Number.isNaN(val)) {
    const clamped = Math.min(props.max, Math.max(props.min, val))
    emit('update:modelValue', clamped)
  }
  editing.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    commitEdit(e)
  } else if (e.key === 'Escape') {
    editing.value = false
  }
}
</script>

<template>
  <div class="scrub-input" :class="{ scrubbing }">
    <span class="scrub-label" @pointerdown="startScrub">
      <slot name="icon">
        <span v-if="icon" class="scrub-icon-text">{{ icon }}</span>
      </slot>
      <span v-if="label" class="scrub-label-text">{{ label }}</span>
    </span>
    <input
      v-if="editing"
      ref="inputRef"
      type="number"
      class="scrub-value-input"
      :value="displayValue"
      :min="min === -Infinity ? undefined : min"
      :max="max === Infinity ? undefined : max"
      :step="step"
      @blur="commitEdit"
      @keydown="onKeydown"
    />
    <span
      v-else
      class="scrub-value"
      @click="startEdit"
    >{{ displayValue }}{{ suffix ?? '' }}</span>
  </div>
</template>

<style scoped>
.scrub-input {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 26px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.scrub-input:focus-within {
  border-color: var(--accent, #3b82f6);
}

.scrub-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  align-self: stretch;
  cursor: ew-resize;
  flex-shrink: 0;
  user-select: none;
  color: var(--text-muted);
}

.scrub-icon-text {
  font-size: 11px;
  line-height: 1;
  pointer-events: none;
}

.scrub-label-text {
  font-size: 11px;
  line-height: 1;
  pointer-events: none;
}

.scrub-label :deep(svg) {
  pointer-events: none;
}

.scrub-value {
  flex: 1;
  min-width: 0;
  padding: 0 6px 0 0;
  font-size: 12px;
  color: var(--text);
  cursor: text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scrub-value-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--text);
  padding: 0 6px 0 0;
  font: inherit;
  font-size: 12px;
  outline: none;
}

.scrub-value-input::-webkit-inner-spin-button {
  display: none;
}
</style>
