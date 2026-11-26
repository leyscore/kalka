<script setup lang="ts">
import { computed } from 'vue'

import type { GridChildAlign, LayoutAlign, LayoutCounterAlign } from '@kalka/scene-graph'
import { useI18n, useLayoutControlsContext } from '@kalka/vue'

import LayoutAlignmentControl from '../alignment/LayoutAlignmentControl.vue'

const ctx = useLayoutControlsContext()
const { panels } = useI18n()

const PLACES = ['MIN', 'CENTER', 'MAX'] as const

/** Unset alignment sits at the cell's start, as an explicitly sized child does in CSS grid. */
function place(value: string): (typeof PLACES)[number] {
  return value === 'CENTER' || value === 'MAX' ? value : 'MIN'
}

// Each cell's primary is the place across the cell, its counter the place down it.
const cells = computed(() => {
  const horizontal = [
    panels.value.alignLeft,
    panels.value.alignCenterHorizontally,
    panels.value.alignRight
  ]
  const vertical = [
    panels.value.alignTop,
    panels.value.alignCenterVertically,
    panels.value.alignBottom
  ]
  const across = place(ctx.node.gridChildHorizontalAlign)
  const down = place(ctx.node.layoutAlignSelf)
  return PLACES.flatMap((row, rowIndex) =>
    PLACES.map((column, columnIndex) => ({
      primary: column satisfies LayoutAlign,
      counter: row satisfies LayoutCounterAlign,
      label: `${vertical[rowIndex]}, ${horizontal[columnIndex]}`,
      active: across === column && down === row
    }))
  )
})

function select(across: LayoutAlign, down: LayoutCounterAlign) {
  ctx.editor.updateNodeWithUndo(
    ctx.node.id,
    {
      gridChildHorizontalAlign: place(across) satisfies GridChildAlign,
      layoutAlignSelf: place(down)
    },
    'Change alignment in cell'
  )
}
</script>

<template>
  <div class="mt-2">
    <label class="mb-1 block text-[11px] text-muted">{{ panels.alignmentInCell }}</label>
    <LayoutAlignmentControl
      data-test-id="grid-cell-alignment"
      :label="panels.alignmentInCell"
      :cells="cells"
      @select="select"
    />
  </div>
</template>
