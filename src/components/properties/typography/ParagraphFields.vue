<script setup lang="ts">
import { computed } from 'vue'

import type { SceneNode, TextListType } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelGrid from '@/components/ui/panel/PanelGrid.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'

type ParagraphField = 'paragraphSpacing' | 'paragraphIndent'

const { node, listType } = defineProps<{ node: SceneNode; listType: TextListType | null }>()
const emit = defineEmits<{
  update: [field: ParagraphField, value: number]
  commit: [field: ParagraphField, value: number, previous: number]
  list: [type: TextListType]
}>()
const { panels } = useI18n()
const listOptions = computed(() => [
  { value: 'NONE', label: panels.value.listNone },
  { value: 'UNORDERED', label: panels.value.bulletedList },
  { value: 'ORDERED', label: panels.value.numberedList }
])

function chooseList(value: string) {
  if (value === 'NONE' || value === 'UNORDERED' || value === 'ORDERED') emit('list', value)
}
</script>

<template>
  <PanelGrid :columns="2" class="mb-3">
    <PanelFieldGroup :label="panels.paragraphSpacing">
      <NumberField
        :model-value="node.paragraphSpacing"
        :aria-label="panels.paragraphSpacing"
        suffix="px"
        :min="0"
        data-property="paragraph-spacing"
        @update:model-value="emit('update', 'paragraphSpacing', $event)"
        @commit="(value, previous) => emit('commit', 'paragraphSpacing', value, previous)"
      >
        <template #icon><icon-hugeicons-paragraph-spacing class="size-3" /></template>
      </NumberField>
    </PanelFieldGroup>
    <PanelFieldGroup :label="panels.paragraphIndent">
      <NumberField
        :model-value="node.paragraphIndent"
        :aria-label="panels.paragraphIndent"
        suffix="px"
        data-property="paragraph-indent"
        @update:model-value="emit('update', 'paragraphIndent', $event)"
        @commit="(value, previous) => emit('commit', 'paragraphIndent', value, previous)"
      >
        <template #icon><icon-hugeicons-text-indent class="size-3" /></template>
      </NumberField>
    </PanelFieldGroup>
  </PanelGrid>

  <PanelFieldGroup :label="panels.textList" class="mb-3">
    <SegmentedControl
      :model-value="listType ?? ''"
      :options="listOptions"
      :label="panels.textList"
      @change="chooseList"
    >
      <template #option="{ option }">
        <icon-hugeicons-left-to-right-list-bullet
          v-if="option.value === 'UNORDERED'"
          class="size-3.5"
        />
        <icon-hugeicons-left-to-right-list-number
          v-else-if="option.value === 'ORDERED'"
          class="size-3.5"
        />
        <icon-hugeicons-paragraph v-else class="size-3.5" />
      </template>
    </SegmentedControl>
  </PanelFieldGroup>
</template>
