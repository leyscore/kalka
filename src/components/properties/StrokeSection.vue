<script setup lang="ts">
import ColorPicker from '../ColorPicker.vue'
import ScrubInput from '../ScrubInput.vue'
import { useEditorStore } from '../../stores/editor'
import { colorToHexRaw, parseColor } from '../../engine/color'

import type { Color, Stroke } from '../../engine/scene-graph'

const props = defineProps<{ nodeId: string; strokes: Stroke[] }>()
const store = useEditorStore()

function updateColor(index: number, color: Color) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], color }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function updateHex(index: number, hex: string) {
  const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`)
  if (!color) return
  updateColor(index, color)
}

function updateWeight(index: number, weight: number) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], weight }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function updateOpacity(index: number, opacity: number) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], opacity: Math.max(0, Math.min(1, opacity / 100)) }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function toggleVisibility(index: number) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], visible: !strokes[index].visible }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function add() {
  const stroke: Stroke = { color: { r: 0, g: 0, b: 0, a: 1 }, weight: 1, opacity: 1, visible: true, align: 'CENTER' }
  store.updateNodeWithUndo(props.nodeId, { strokes: [...props.strokes, stroke] }, 'Add stroke')
}

function remove(index: number) {
  store.updateNodeWithUndo(props.nodeId, { strokes: props.strokes.filter((_, i) => i !== index) }, 'Remove stroke')
}
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <div class="flex items-center justify-between">
      <label class="mb-1 block text-[11px] text-muted">Stroke</label>
      <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="add">+</button>
    </div>
    <div v-for="(stroke, i) in strokes" :key="i" class="group flex items-center gap-1.5 py-0.5">
      <ColorPicker :color="stroke.color" @update="updateColor(i, $event)" />
      <input
        class="min-w-0 flex-1 border-none bg-transparent font-mono text-xs text-surface outline-none"
        :value="colorToHexRaw(stroke.color)"
        @change="updateHex(i, ($event.target as HTMLInputElement).value)"
      />
      <ScrubInput
        class="w-12"
        suffix="%"
        :model-value="Math.round(stroke.opacity * 100)"
        :min="0"
        :max="100"
        @update:model-value="updateOpacity(i, $event)"
      />
      <button
        class="cursor-pointer border-none bg-transparent p-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
        @click="toggleVisibility(i)"
      >
        <icon-lucide-eye v-if="stroke.visible" class="size-3.5" />
        <icon-lucide-eye-off v-else class="size-3.5" />
      </button>
      <button class="cursor-pointer border-none bg-transparent p-0 text-sm leading-none text-muted hover:text-surface" @click="remove(i)">−</button>
    </div>
    <div v-if="strokes.length > 0" class="mt-1 flex items-center gap-1.5">
      <ScrubInput
        class="w-16"
        icon="W"
        :model-value="strokes[0].weight"
        :min="0"
        @update:model-value="updateWeight(0, $event)"
      />
    </div>
  </div>
</template>
