<script setup lang="ts">
import { computed } from 'vue'

import { useI18n, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import IconButton from '@/components/ui/button/IconButton.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const emit = defineEmits<{ openDialog: [] }>()

const editor = useEditorStore()
const collectionCount = useSceneComputed(() => {
  void editor.state.sceneVersion
  return editor.getCollectionCount()
})
const variableCount = useSceneComputed(() => {
  void editor.state.sceneVersion
  return editor.getVariableCount()
})
const hasVariables = computed(() => variableCount.value > 0)
const { panels, variables } = useI18n()
</script>

<template>
  <PanelSection :label="panels.variables" :empty="!hasVariables">
    <template #actions>
      <IconButton :label="panels.openVariables" @click="emit('openDialog')">
        <icon-hugeicons-square-arrow-out-up-right class="size-3.5" />
      </IconButton>
    </template>
    <dl v-if="hasVariables" class="mt-1 flex flex-col gap-0.5 text-[11px] text-muted">
      <div class="flex justify-between">
        <dt>{{ panels.variables }}</dt>
        <dd class="tabular-nums">{{ variableCount }}</dd>
      </div>
      <div class="flex justify-between">
        <dt>{{ variables.collections }}</dt>
        <dd class="tabular-nums">{{ collectionCount }}</dd>
      </div>
    </dl>
    <div v-else class="mt-1 text-[11px] text-muted">{{ panels.noLocalVariables }}</div>
  </PanelSection>
</template>
