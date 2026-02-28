<script setup lang="ts">
import ColorPicker from '../ColorPicker.vue'
import { useEditorStore } from '../../stores/editor'
import { DEFAULT_SHAPE_FILL } from '../../constants'
import { colorToHexRaw, parseColor } from '../../engine/color'

import type { Color, Fill } from '../../engine/scene-graph'

const props = defineProps<{ nodeId: string; fills: Fill[] }>()
const store = useEditorStore()

function updateColor(index: number, color: Color) {
  const fills = [...props.fills]
  fills[index] = { ...fills[index], color }
  store.updateNodeWithUndo(props.nodeId, { fills }, 'Change fill')
}

function updateHex(index: number, hex: string) {
  const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`)
  if (!color) return
  updateColor(index, color)
}

function updateOpacity(index: number, opacity: number) {
  const fills = [...props.fills]
  fills[index] = { ...fills[index], opacity: Math.max(0, Math.min(1, opacity / 100)) }
  store.updateNodeWithUndo(props.nodeId, { fills }, 'Change fill')
}

function toggleVisibility(index: number) {
  const fills = [...props.fills]
  fills[index] = { ...fills[index], visible: !fills[index].visible }
  store.updateNodeWithUndo(props.nodeId, { fills }, 'Change fill')
}

function add() {
  store.updateNodeWithUndo(props.nodeId, { fills: [...props.fills, { ...DEFAULT_SHAPE_FILL }] }, 'Add fill')
}

function remove(index: number) {
  store.updateNodeWithUndo(props.nodeId, { fills: props.fills.filter((_, i) => i !== index) }, 'Remove fill')
}
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <div class="flex items-center justify-between">
      <label class="mb-1 block text-[11px] text-muted">Fill</label>
      <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="add">+</button>
    </div>
    <div v-for="(fill, i) in fills" :key="i" class="group flex items-center gap-1.5 py-0.5">
      <ColorPicker :color="fill.color" @update="updateColor(i, $event)" />
      <input
        class="min-w-0 flex-1 border-none bg-transparent font-mono text-xs text-surface outline-none"
        :value="colorToHexRaw(fill.color)"
        @change="updateHex(i, ($event.target as HTMLInputElement).value)"
      />
      <input
        type="number"
        class="w-10 rounded border border-border bg-input px-1 py-0.5 text-right text-[11px] text-surface [&::-webkit-inner-spin-button]:hidden"
        :value="Math.round(fill.opacity * 100)"
        min="0"
        max="100"
        @change="updateOpacity(i, +($event.target as HTMLInputElement).value)"
      />
      <span class="text-[11px] text-muted">%</span>
      <button
        class="cursor-pointer border-none bg-transparent p-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
        @click="toggleVisibility(i)"
      >
        <icon-lucide-eye v-if="fill.visible" class="size-3.5" />
        <icon-lucide-eye-off v-else class="size-3.5" />
      </button>
      <button class="cursor-pointer border-none bg-transparent p-0 text-sm leading-none text-muted hover:text-surface" @click="remove(i)">−</button>
    </div>
  </div>
</template>
