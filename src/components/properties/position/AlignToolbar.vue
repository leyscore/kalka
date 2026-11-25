<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'

import { editorCommandMetadata, formatShortcut, useEditorCommands, useI18n } from '@kalka/vue'
import type { EditorCommandId } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import IconButton from '@/components/ui/button/IconButton.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'

type Axis = 'horizontal' | 'vertical'
type Edge = 'min' | 'center' | 'max'

/**
 * Aligns the selection, or the selected vertices while editing a path. A component of its own,
 * with the align action as its only input, so moving or resizing a layer, which changes the
 * position fields beside it, does not redraw its buttons on every frame.
 */
const { align } = defineProps<{ align: (axis: Axis, edge: Edge) => void }>()

const { panels } = useI18n()
const store = useEditorStore()
const { getCommand, runCommand } = useEditorCommands()

/** Figma keeps distribute in the overflow beside the align buttons. */
const distributeCommands = [
  'selection.distributeHorizontal',
  'selection.distributeVertical'
] satisfies EditorCommandId[]
const menuCls = useMenuUI({ content: 'min-w-56' })
const itemCls = menuItem({ justify: 'between' })

function alignTo(axis: Axis, edge: Edge) {
  const editState = store.state.nodeEditState
  if (editState && editState.selectedVertexIndices.size >= 2) {
    store.nodeEditAlignVertices(axis, edge)
  } else {
    align(axis, edge)
  }
}
</script>

<template>
  <div role="toolbar" :aria-label="panels.position" class="mb-1.5 flex justify-between">
    <div class="flex gap-0.5">
      <IconButton :label="panels.alignLeft" size="xs" @click="alignTo('horizontal', 'min')">
        <icon-hugeicons-align-start-vertical class="size-3.5" />
      </IconButton>
      <IconButton
        :label="panels.alignCenterHorizontally"
        size="xs"
        @click="alignTo('horizontal', 'center')"
      >
        <icon-hugeicons-align-vertical-center class="size-3.5" />
      </IconButton>
      <IconButton :label="panels.alignRight" size="xs" @click="alignTo('horizontal', 'max')">
        <icon-hugeicons-align-end-vertical class="size-3.5" />
      </IconButton>
    </div>
    <div class="flex gap-0.5">
      <IconButton :label="panels.alignTop" size="xs" @click="alignTo('vertical', 'min')">
        <icon-hugeicons-align-start-horizontal class="size-3.5" />
      </IconButton>
      <IconButton
        :label="panels.alignCenterVertically"
        size="xs"
        @click="alignTo('vertical', 'center')"
      >
        <icon-hugeicons-align-horizontal-center class="size-3.5" />
      </IconButton>
      <IconButton :label="panels.alignBottom" size="xs" @click="alignTo('vertical', 'max')">
        <icon-hugeicons-align-end-horizontal class="size-3.5" />
      </IconButton>
      <DropdownMenuRoot :modal="false">
        <DropdownMenuTrigger as-child>
          <IconButton :label="panels.alignMore" size="xs" data-test-id="align-more-trigger">
            <icon-hugeicons-more-horizontal class="size-3.5" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent side="bottom" align="end" :side-offset="4" :class="menuCls.content">
            <DropdownMenuItem
              v-for="id in distributeCommands"
              :key="id"
              :data-test-id="`align-more-${id.replace('selection.', '')}`"
              :class="itemCls"
              :disabled="!getCommand(id).enabled.value"
              @select="runCommand(id)"
            >
              <span>{{ getCommand(id).label }}</span>
              <span class="ml-6 text-[11px] text-muted">{{
                formatShortcut(editorCommandMetadata(id).shortcut)
              }}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  </div>
</template>
