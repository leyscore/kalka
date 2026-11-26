<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import AppSelect from '@/components/ui/select/AppSelect.vue'

import { useLayerVariableModes } from './use'

// One row per collection the selected layers set a mode for; "Auto" gives the layer back the
// mode around it.
const { variables } = useI18n()
const { rows, setMode } = useLayerVariableModes()
</script>

<template>
  <div
    v-if="rows.length > 0"
    class="mb-1.5 flex flex-col gap-1"
    data-test-id="layer-variable-modes"
  >
    <div v-for="row in rows" :key="row.collection.id" class="grid grid-cols-2 items-center gap-1.5">
      <div class="flex min-w-0 items-center gap-1.5">
        <icon-hugeicons-hexagon class="size-3 shrink-0 text-muted" />
        <span class="min-w-0 truncate text-[11px] text-muted">{{ row.collection.name }}</span>
      </div>
      <AppSelect
        :model-value="row.value"
        :label="variables.layerModeLabel({ collection: row.collection.name })"
        :options="row.options"
        @update:model-value="(value: string) => setMode(row.collection.id, value)"
      />
    </div>
  </div>
</template>
