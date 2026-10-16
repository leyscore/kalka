<script setup lang="ts">
import { computed } from 'vue'

import type { Color, Fill } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { updateCanvasBackground } from '@/app/settings/preferences/store'
import ColorPicker from '@/components/ColorPicker/ColorPicker.vue'
import PaintField from '@/components/properties/paint/PaintField.vue'
import PaintValue from '@/components/properties/paint/PaintValue.vue'
import FillSwatch from '@/components/ui/paint/FillSwatch.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const editor = useEditorStore()
const pageColor = computed(() => editor.state.pageColor)
const pageFill = computed<Fill>(() => ({
  type: 'SOLID',
  color: pageColor.value,
  opacity: 1,
  visible: true
}))
const { panels } = useI18n()

// Choosing a page color shows it: the canvas switches from Kalka's color to the page's own.
function updatePageAlpha(alpha: number) {
  editor.setPageColor({ ...pageColor.value, a: alpha })
  updateCanvasBackground('document')
}

function updatePageColor(color: Color) {
  editor.setPageColor(color)
  updateCanvasBackground('document')
}
</script>

<template>
  <PanelSection :label="panels.page">
    <PaintField
      :opacity="pageColor.a"
      :opacity-label="panels.opacity"
      @update:opacity="updatePageAlpha"
    >
      <template #preview>
        <ColorPicker :color="pageColor" @update="updatePageColor">
          <template #trigger>
            <button
              type="button"
              :aria-label="panels.pageBackground"
              class="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
            >
              <FillSwatch :fill="pageFill" class="size-full" />
            </button>
          </template>
        </ColorPicker>
      </template>
      <template #value>
        <PaintValue :color="pageColor" :label="panels.pageBackground" @update="updatePageColor" />
      </template>
    </PaintField>
  </PanelSection>
</template>
