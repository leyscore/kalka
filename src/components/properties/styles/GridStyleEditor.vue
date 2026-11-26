<script setup lang="ts">
import type { LayoutGrid, SceneNode } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { defaultLayoutGrid } from '@/components/properties/layout/guides/defaults'
import LayoutGridList from '@/components/properties/layout/guides/LayoutGridList.vue'
import IconButton from '@/components/ui/button/IconButton.vue'

import { useStyleEdit } from './edit'
import StyleNameField from './StyleNameField.vue'

/**
 * A grid style's name and layout guides, as Figma's Edit grid style shows them, with the guides'
 * own controls. A change is made to the style and every frame using it in one undo step.
 */
const { definition } = defineProps<{ definition: SceneNode }>()
const { panels } = useI18n()
const edit = useStyleEdit(() => definition)

function change(grids: LayoutGrid[]) {
  edit.commit({ layoutGrids: structuredClone(grids) })
}

function scrub(grids: LayoutGrid[]) {
  edit.preview({ layoutGrids: structuredClone(grids) })
}
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="grid-style-editor">
    <StyleNameField :definition="definition" />
    <div>
      <div class="mb-1 flex h-6 items-center justify-between">
        <span class="text-[11px] font-medium text-surface">{{ panels.layoutGrids }}</span>
        <IconButton
          :label="panels.addLayoutGrid"
          data-test-id="grid-style-add-guide"
          @click="change([...definition.layoutGrids, defaultLayoutGrid()])"
        >
          <icon-hugeicons-plus class="size-3.5" />
        </IconButton>
      </div>
      <LayoutGridList
        :grids="definition.layoutGrids"
        @change="change"
        @scrub="scrub"
        @scrub-end="edit.settle()"
      />
    </div>
  </div>
</template>
