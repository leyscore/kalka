<script setup lang="ts">
import ColorPicker from '../ColorPicker.vue'
import { useEditorStore } from '../../stores/editor'
import { DEFAULT_SHAPE_FILL } from '../../constants'

import type { Color, Fill } from '../../engine/scene-graph'

const props = defineProps<{ nodeId: string; fills: Fill[] }>()
const store = useEditorStore()

function colorHex(c: Color) {
  const hex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
}

function updateColor(index: number, color: Color) {
  const fills = [...props.fills]
  fills[index] = { ...fills[index], color }
  store.updateNodeWithUndo(props.nodeId, { fills }, 'Change fill')
}

function add() {
  store.updateNodeWithUndo(props.nodeId, { fills: [...props.fills, { ...DEFAULT_SHAPE_FILL }] }, 'Add fill')
}

function remove(index: number) {
  store.updateNodeWithUndo(props.nodeId, { fills: props.fills.filter((_, i) => i !== index) }, 'Change fill')
}

function toggleVisibility(index: number) {
  const fills = [...props.fills]
  fills[index] = { ...fills[index], visible: !fills[index].visible }
  store.updateNodeWithUndo(props.nodeId, { fills }, 'Change fill')
}
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <div class="flex items-center justify-between">
      <label class="mb-1.5 block text-[11px] text-muted">Fill</label>
      <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="add">+</button>
    </div>
    <div v-for="(fill, i) in fills" :key="i" class="group flex items-center gap-1.5 py-0.5">
      <button
        class="w-4 cursor-pointer border-none bg-transparent p-0 text-center text-xs text-muted"
        :class="{ 'opacity-40': !fill.visible }"
        @click="toggleVisibility(i)"
      >{{ fill.visible ? '◉' : '○' }}</button>
      <ColorPicker :color="fill.color" @update="updateColor(i, $event)" />
      <span class="flex-1 font-mono text-xs">{{ colorHex(fill.color) }}</span>
      <button class="cursor-pointer border-none bg-transparent px-0.5 text-sm leading-none text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface" @click="remove(i)">×</button>
    </div>
  </div>
</template>
