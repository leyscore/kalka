<script setup lang="ts">
import ScrubInput from '../ScrubInput.vue'
import { useNodeProps } from '../../composables/use-node-props'

import type { SceneNode } from '../../engine/scene-graph'

const { node } = defineProps<{ node: SceneNode }>()
const { updateProp, commitProp } = useNodeProps()
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <label class="mb-1.5 block text-[11px] text-muted">Position</label>
    <div class="flex gap-1.5">
      <ScrubInput icon="X" :model-value="Math.round(node.x)" @update:model-value="updateProp('x', $event)" @commit="(v: number, p: number) => commitProp('x', v, p)" />
      <ScrubInput icon="Y" :model-value="Math.round(node.y)" @update:model-value="updateProp('y', $event)" @commit="(v: number, p: number) => commitProp('y', v, p)" />
    </div>
    <div class="mt-1.5 flex gap-1.5">
      <ScrubInput icon="R" suffix="°" :model-value="Math.round(node.rotation)" :min="-360" :max="360" @update:model-value="updateProp('rotation', $event)" @commit="(v: number, p: number) => commitProp('rotation', v, p)" />
    </div>
  </div>
</template>
