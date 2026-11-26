<script setup lang="ts">
import { isEqual } from 'es-toolkit/predicate'
import { computed } from 'vue'

import type { LayoutGrid, SceneNode } from '@kalka/scene-graph'
import { useEditor, useI18n, useSelectionState, useSharedStyleBinding } from '@kalka/vue'

import AppliedStyle from '@/components/properties/styles/AppliedStyle.vue'
import StylePicker from '@/components/properties/styles/StylePicker.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

import { defaultLayoutGrid } from './defaults'
import LayoutGridList from './LayoutGridList.vue'

const editor = useEditor()
const { panels } = useI18n()

// Every selected frame's guides, as Figma edits several frames at once: the panel lists them
// while the frames' guides match, and offers only Add, which replaces them, while they differ.
// The shared copies change only in the fields that change, so typing or resizing a layer does
// not re-render the guides.
const { selectedNodes: targets } = useSelectionState()
const mixed = computed(() => {
  const [first, ...rest] = targets.value
  return !!first && rest.some((node) => !isEqual(node.layoutGrids, first.layoutGrids))
})
const grids = computed<LayoutGrid[]>(() =>
  mixed.value ? [] : (targets.value.at(0)?.layoutGrids ?? [])
)
const gridStyle = useSharedStyleBinding('grid')
/** An applied grid style stands in for the guides, as in Figma. */
const hasStyle = computed(() => typeof gridStyle.styleId.value === 'string')

/** Runs one edit per selected frame, as one undo step. */
function eachTarget(label: string, edit: (node: SceneNode) => void) {
  const nodes = targets.value
  if (nodes.length > 1) editor.undo.runBatch(label, () => nodes.forEach(edit))
  else if (nodes[0]) edit(nodes[0])
}

function commit(next: LayoutGrid[], label: string) {
  eachTarget(label, (node) =>
    editor.updateNodeWithUndo(node.id, { layoutGrids: structuredClone(next) }, label)
  )
}

function add() {
  commit(
    mixed.value ? [defaultLayoutGrid()] : [...grids.value, defaultLayoutGrid()],
    'Add layout guide'
  )
}

function scrub(next: LayoutGrid[]) {
  for (const node of targets.value)
    editor.updateNode(node.id, { layoutGrids: structuredClone(next) })
}

function scrubEnd(before: LayoutGrid[], label: string) {
  eachTarget(label, (node) =>
    editor.commitNodeUpdate(node.id, { layoutGrids: structuredClone(before) }, label)
  )
}
</script>

<template>
  <PanelSection :label="panels.layoutGrids" :empty="grids.length === 0 && !hasStyle">
    <template #actions>
      <StylePicker
        v-if="gridStyle.active.value && !hasStyle"
        kind="grid"
        :current-style-id="null"
        @apply="gridStyle.bind"
        @create="gridStyle.createStyle"
      />
      <IconButton :label="panels.addLayoutGrid" @click="add">
        <icon-hugeicons-plus class="size-3.5" />
      </IconButton>
    </template>

    <AppliedStyle :binding="gridStyle" />
    <LayoutGridList
      v-if="!hasStyle"
      :grids="grids"
      @change="commit"
      @scrub="scrub"
      @scrub-end="scrubEnd"
    />
  </PanelSection>
</template>
