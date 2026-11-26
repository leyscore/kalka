<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import IconChevronDown from '~icons/hugeicons/chevron-down'
import IconComponent from '~icons/hugeicons/component'

import {
  editorCommandMetadata,
  formatShortcut,
  useEditorCommands,
  useI18n,
  useRetainedPopup
} from '@kalka/vue'
import type { EditorCommandId } from '@kalka/vue'

import { menuItem, useMenuUI } from '@/components/ui/menu/menu'
import Tip from '@/components/ui/overlay/Tip.vue'

const { getCommand, runCommand } = useEditorCommands()
const { commands } = useI18n()
const { open: popupOpen, portalActive } = useRetainedPopup()

// With several layers Figma's component button asks whether to make one or several components.
const items = [
  'selection.createComponent',
  'selection.createMultipleComponents',
  'selection.createComponentSet'
] satisfies EditorCommandId[]

const menuCls = useMenuUI({ content: 'min-w-52' })
const itemCls = menuItem({ justify: 'between' })
</script>

<template>
  <DropdownMenuRoot v-model:open="popupOpen">
    <Tip :label="commands.createComponent">
      <DropdownMenuTrigger as-child>
        <button
          data-test-id="component-create-trigger"
          :aria-label="commands.createComponent"
          class="flex h-7 items-center gap-1 rounded-md px-1.5 text-muted hover:bg-hover hover:text-surface data-[state=open]:bg-active data-[state=open]:text-surface"
        >
          <IconComponent class="size-4" />
          <IconChevronDown class="size-3" />
        </button>
      </DropdownMenuTrigger>
    </Tip>
    <DropdownMenuPortal v-if="portalActive">
      <DropdownMenuContent align="end" side="bottom" :side-offset="4" :class="menuCls.content">
        <DropdownMenuItem
          v-for="id in items"
          :key="id"
          :data-test-id="`component-create-${id.replace('selection.', '')}`"
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
</template>
