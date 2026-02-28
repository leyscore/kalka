<script setup lang="ts">
import ScrubInput from '../ScrubInput.vue'
import { useNodeProps } from '../../composables/use-node-props'

const { updateProp, commitProp } = useNodeProps()

defineProps<{ opacity: number }>()
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <label class="mb-1.5 block text-[11px] text-muted">Appearance</label>
    <div class="flex gap-1.5">
      <ScrubInput
        icon="⊘"
        suffix="%"
        :model-value="Math.round(opacity * 100)"
        :min="0"
        :max="100"
        @update:model-value="updateProp('opacity', $event / 100)"
        @commit="(v: number, p: number) => commitProp('opacity', v / 100, p / 100)"
      />
    </div>
  </div>
</template>
