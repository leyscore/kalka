<script setup lang="ts">
import { computed } from 'vue'

import { useI18n, useNodeProps, useSharedStyleBinding } from '@kalka/vue'

import NumberField from '@/components/inputs/NumberField.vue'
import AppliedStyle from '@/components/properties/styles/AppliedStyle.vue'
import StylePicker from '@/components/properties/styles/StylePicker.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelGrid from '@/components/ui/panel/PanelGrid.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

/**
 * Typography for several text layers at once, as Figma keeps its Text section for a selection of
 * texts: a text style applies to all of them, and their size changes together, shown mixed when
 * they differ.
 */
const { panels } = useI18n()
const textStyle = useSharedStyleBinding('text')
const { merged, updateProp, commitProp } = useNodeProps()
const appliedStyleId = computed(() => {
  const id = textStyle.styleId.value
  return typeof id === 'string' ? id : null
})
const fontSize = computed(() => merged('fontSize'))
</script>

<template>
  <PanelSection v-if="textStyle.active.value" :label="panels.typography">
    <template #actions>
      <StylePicker
        kind="text"
        :current-style-id="appliedStyleId"
        @apply="textStyle.bind"
        @create="textStyle.createStyle"
      />
    </template>
    <AppliedStyle :binding="textStyle" />
    <PanelGrid v-if="textStyle.styleId.value === null" :columns="2">
      <PanelFieldGroup :label="panels.fontSize">
        <NumberField
          data-property="fontSize"
          :aria-label="panels.fontSize"
          :model-value="fontSize"
          :min="1"
          @update:model-value="updateProp('fontSize', $event)"
          @commit="(value: number, previous: number) => commitProp('fontSize', value, previous)"
        />
      </PanelFieldGroup>
    </PanelGrid>
  </PanelSection>
</template>
