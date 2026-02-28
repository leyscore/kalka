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
  'commit': [value: number, previous: number]
}>()

const editing = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const scrubbing = ref(false)

let stopMove: (() => void) | undefined
let stopUp: (() => void) | undefined

const displayValue = computed(() => Math.round(props.modelValue))

function startScrub(e: PointerEvent) {
  e.preventDefault()
  const startX = e.clientX
  let lastX = startX
  let accumulated = props.modelValue
  const valueBeforeScrub = props.modelValue
  let hasMoved = false

  stopMove = useEventListener(document, 'pointermove', (ev: PointerEvent) => {
    const dx = ev.clientX - lastX
    lastX = ev.clientX
    if (!hasMoved && Math.abs(ev.clientX - startX) > 2) {
      hasMoved = true
      scrubbing.value = true
      document.body.style.cursor = 'ew-resize'
    }
    if (hasMoved) {
      accumulated += dx * props.step * props.sensitivity
      const clamped = Math.round(Math.min(props.max, Math.max(props.min, accumulated)))
      if (clamped !== props.modelValue) {
        emit('update:modelValue', clamped)
      }
    }
  })

  stopUp = useEventListener(document, 'pointerup', () => {
    scrubbing.value = false
    document.body.style.cursor = ''
    stopMove?.()
    stopUp?.()
    if (hasMoved) {
      if (props.modelValue !== valueBeforeScrub) {
        emit('commit', props.modelValue, valueBeforeScrub)
      }
    } else {
      startEdit()
    }
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
  const previous = props.modelValue
  if (!Number.isNaN(val)) {
    const clamped = Math.min(props.max, Math.max(props.min, val))
    emit('update:modelValue', clamped)
    if (clamped !== previous) {
      emit('commit', clamped, previous)
    }
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
  <div
    class="flex min-w-0 flex-1 items-center rounded border border-border bg-input h-[26px] focus-within:border-accent"
    :style="{ cursor: editing ? 'auto' : 'ew-resize' }"
    @pointerdown="!editing && startScrub($event)"
  >
    <span
      class="flex shrink-0 select-none items-center justify-center self-stretch px-[5px] text-muted [&>*]:pointer-events-none"
    >
      <slot name="icon">
        <span v-if="icon" class="text-[11px] leading-none">{{ icon }}</span>
      </slot>
      <span v-if="label" class="text-[11px] leading-none">{{ label }}</span>
    </span>
    <input
      v-if="editing"
      ref="inputRef"
      type="number"
      class="min-w-0 flex-1 cursor-text border-none bg-transparent pr-1.5 font-[inherit] text-xs text-surface outline-none [appearance:textfield] [[&::-webkit-inner-spin-button]:hidden::-webkit-inner-spin-button]:hidden"
      :value="displayValue"
      :min="min === -Infinity ? undefined : min"
      :max="max === Infinity ? undefined : max"
      :step="step"
      @blur="commitEdit"
      @keydown="onKeydown"
    />
    <span
      v-else
      class="flex flex-1 select-none items-center truncate pr-1.5 text-xs overflow-hidden"
    >
      <span class="flex-1 text-surface">{{ displayValue }}</span>
      <span v-if="suffix" class="shrink-0 text-muted">{{ suffix }}</span>
    </span>
  </div>
</template>
