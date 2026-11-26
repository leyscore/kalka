<script setup lang="ts">
import { computed } from 'vue'

import { useI18n, useSharedStyles } from '@kalka/vue'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

import { LOCAL_STYLE_TYPES, styleKindForType, useStyleTypeLabels } from './kinds'
import LocalStyleList from './LocalStyleList.vue'

/**
 * Figma's Local styles, shown when nothing is selected: the document's text, colour, effect and
 * grid styles, each type under its heading.
 */
const { panels } = useI18n()
const typeLabels = useStyleTypeLabels()
const lists = LOCAL_STYLE_TYPES.map((type) => ({
  type,
  styles: useSharedStyles(styleKindForType(type))
}))
const shown = computed(() => lists.filter((list) => list.styles.styles.value.length > 0))
</script>

<template>
  <PanelSection :label="panels.localStyles" data-test-id="local-styles">
    <p v-if="shown.length === 0" class="text-[11px] text-muted">
      {{ panels.noLocalStylesHint }}
    </p>
    <LocalStyleList
      v-for="list in shown"
      :key="list.type"
      :type="list.type"
      :label="typeLabels(styleKindForType(list.type)).list"
      :styles="list.styles"
    />
  </PanelSection>
</template>
