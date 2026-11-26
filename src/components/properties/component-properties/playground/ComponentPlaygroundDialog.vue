<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'

import {
  componentPlaygroundProperties,
  createComponentPlayground,
  type PlaygroundValues
} from '@kalka/core/editor'
import type { ComponentPropertyDefinition } from '@kalka/scene-graph'
import { useI18n, vTestId } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import LibraryComparisonPreview from '@/components/libraries/review/LibraryComparisonPreview.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import { AppDialog } from '@/components/ui/dialog'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const { nodeId } = defineProps<{ nodeId: string }>()
const open = defineModel<boolean>('open', { default: false })

const editor = useEditorStore()
const { panels } = useI18n()
const definitions = shallowRef<ComponentPropertyDefinition[]>([])
const initial = shallowRef<PlaygroundValues>({})
const values = ref<PlaygroundValues>({})

/** Opening starts from the component's or the instance's own values. */
function reset() {
  const properties = componentPlaygroundProperties(editor.graph, nodeId)
  definitions.value = properties?.definitions ?? []
  initial.value = properties?.values ?? {}
  values.value = { ...initial.value }
}

watch(
  () => [open.value, nodeId] as const,
  ([isOpen]) => {
    if (isOpen) reset()
  },
  { immediate: true }
)

// Each try is a new private copy, so the preview redraws; the file is never touched.
const playground = computed(() =>
  open.value ? createComponentPlayground(editor.graph, nodeId, values.value) : null
)
const name = computed(() => editor.graph.getNode(nodeId)?.name ?? '')
const changed = computed(() =>
  Object.entries(values.value).some(([id, value]) => initial.value[id] !== value)
)

function variantOptions(definition: ComponentPropertyDefinition) {
  return (definition.variantOptions ?? []).map((value) => ({ value, label: value }))
}

function setValue(id: string, value: string) {
  values.value = { ...values.value, [id]: value }
}
</script>

<template>
  <AppDialog
    v-model:open="open"
    size="lg"
    :heading="panels.componentPlayground"
    :description="panels.componentPlaygroundHint"
    data-test-id="component-playground"
  >
    <div class="grid min-h-80 grid-cols-[1fr_15rem] gap-4">
      <div class="flex flex-col items-center justify-center gap-2 rounded-lg bg-canvas p-4">
        <span class="text-xs text-muted">{{ name }}</span>
        <LibraryComparisonPreview
          v-if="playground"
          :graph="playground.graph"
          :node-id="playground.nodeId"
          :alt="name"
        />
      </div>
      <div class="flex flex-col gap-3">
        <label
          v-for="definition in definitions"
          :key="definition.id"
          class="flex flex-col gap-1 text-xs text-muted"
          v-test-id="`playground-property-${definition.name}`"
        >
          <span>{{ definition.name }}</span>
          <AppSelect
            v-if="definition.type === 'VARIANT'"
            :model-value="values[definition.id] ?? ''"
            :label="definition.name"
            :options="variantOptions(definition)"
            @update:model-value="setValue(definition.id, $event)"
          />
          <AppSwitch
            v-else-if="definition.type === 'BOOLEAN'"
            :label="definition.name"
            :model-value="values[definition.id] === 'true'"
            @update:model-value="setValue(definition.id, String($event))"
          />
          <AppInput
            v-else
            :aria-label="definition.name"
            :model-value="values[definition.id] ?? ''"
            @update:model-value="setValue(definition.id, String($event))"
          />
        </label>
        <AppButton
          class="mt-auto self-start"
          variant="outline"
          data-test-id="playground-reset"
          :disabled="!changed"
          @click="reset"
        >
          {{ panels.resetPlayground }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>
