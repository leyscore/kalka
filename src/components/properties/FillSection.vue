<script setup lang="ts">
import FillPicker from '../FillPicker.vue'
import ScrubInput from '../ScrubInput.vue'
import { useNodeProps } from '../../composables/use-node-props'
import { DEFAULT_SHAPE_FILL } from '../../constants'
import { colorToHexRaw } from '../../engine/color'

import type { Fill } from '../../engine/scene-graph'

const { store, node } = useNodeProps()

function updateFill(index: number, fill: Fill) {
  const fills = [...node.value.fills]
  fills[index] = fill
  store.updateNodeWithUndo(node.value.id, { fills }, 'Change fill')
}

function updateOpacity(index: number, opacity: number) {
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], opacity: Math.max(0, Math.min(1, opacity / 100)) }
  store.updateNodeWithUndo(node.value.id, { fills }, 'Change fill')
}

function toggleVisibility(index: number) {
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], visible: !fills[index].visible }
  store.updateNodeWithUndo(node.value.id, { fills }, 'Change fill')
}

function add() {
  store.updateNodeWithUndo(node.value.id, { fills: [...node.value.fills, { ...DEFAULT_SHAPE_FILL }] }, 'Add fill')
}

function remove(index: number) {
  store.updateNodeWithUndo(node.value.id, { fills: node.value.fills.filter((_, i) => i !== index) }, 'Remove fill')
}
</script>

<template>
  <div v-if="node" class="border-b border-border px-3 py-2">
    <div class="flex items-center justify-between">
      <label class="mb-1 block text-[11px] text-muted">Fill</label>
      <button class="flex size-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-sm leading-none text-muted hover:bg-hover hover:text-surface" @click="add">+</button>
    </div>
    <div v-for="(fill, i) in node.fills" :key="i" class="group flex items-center gap-1.5 py-0.5">
      <FillPicker :fill="fill" @update="updateFill(i, $event)" />
      <span class="min-w-0 flex-1 font-mono text-xs text-surface">
        <template v-if="fill.type === 'SOLID'">{{ colorToHexRaw(fill.color) }}</template>
        <template v-else-if="fill.type.startsWith('GRADIENT')">{{ fill.type.replace('GRADIENT_', '') }}</template>
        <template v-else>{{ fill.type }}</template>
      </span>
      <ScrubInput
        class="w-12"
        suffix="%"
        :model-value="Math.round(fill.opacity * 100)"
        :min="0"
        :max="100"
        @update:model-value="updateOpacity(i, $event)"
      />
      <button
        class="cursor-pointer border-none bg-transparent p-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
        @click="toggleVisibility(i)"
      >
        <icon-lucide-eye v-if="fill.visible" class="size-3.5" />
        <icon-lucide-eye-off v-else class="size-3.5" />
      </button>
      <button class="flex size-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-sm leading-none text-muted hover:bg-hover hover:text-surface" @click="remove(i)">−</button>
    </div>
  </div>
</template>
