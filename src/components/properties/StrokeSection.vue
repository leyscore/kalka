<script setup lang="ts">
import ColorPicker from '../ColorPicker.vue'
import { useEditorStore } from '../../stores/editor'

import type { Color, Stroke } from '../../engine/scene-graph'

const props = defineProps<{ nodeId: string; strokes: Stroke[] }>()
const store = useEditorStore()

function colorHex(c: Color) {
  const hex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
}

function updateColor(index: number, color: Color) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], color }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function updateWeight(index: number, weight: number) {
  const strokes = [...props.strokes]
  strokes[index] = { ...strokes[index], weight }
  store.updateNodeWithUndo(props.nodeId, { strokes }, 'Change stroke')
}

function add() {
  const stroke: Stroke = { color: { r: 0, g: 0, b: 0, a: 1 }, weight: 1, opacity: 1, visible: true, align: 'CENTER' }
  store.updateNodeWithUndo(props.nodeId, { strokes: [...props.strokes, stroke] }, 'Add stroke')
}

function remove(index: number) {
  store.updateNodeWithUndo(props.nodeId, { strokes: props.strokes.filter((_, i) => i !== index) }, 'Change stroke')
}
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <div class="flex items-center justify-between">
      <label class="mb-1.5 block text-[11px] text-muted">Stroke</label>
      <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="add">+</button>
    </div>
    <div v-for="(stroke, i) in strokes" :key="i" class="group flex items-center gap-1.5 py-0.5">
      <ColorPicker :color="stroke.color" @update="updateColor(i, $event)" />
      <span class="flex-1 font-mono text-xs">{{ colorHex(stroke.color) }}</span>
      <input
        type="number"
        class="w-9 rounded border border-border bg-input px-1 py-0.5 text-center text-[11px] text-surface [&::-webkit-inner-spin-button]:hidden"
        :value="stroke.weight"
        min="0"
        @change="updateWeight(i, +($event.target as HTMLInputElement).value)"
      />
      <button class="cursor-pointer border-none bg-transparent px-0.5 text-sm leading-none text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface" @click="remove(i)">×</button>
    </div>
  </div>
</template>
