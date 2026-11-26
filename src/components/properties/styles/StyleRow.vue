<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PopoverTrigger
} from 'reka-ui'
import { ref } from 'vue'

import type { SceneNode, SharedStyleType } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'

import { styleKindForType } from './kinds'
import StyleEditPopover from './StyleEditPopover.vue'
import StyleLabel from './StyleLabel.vue'

/** One style in Local styles: a click edits it, its menu renames, moves or deletes it. */
const { type, name, label, definition, first, last } = defineProps<{
  type: SharedStyleType
  name: string
  label: string
  definition: SceneNode | null
  first: boolean
  last: boolean
}>()
const emit = defineEmits<{
  rename: [name: string]
  move: [direction: 'up' | 'down']
  remove: []
}>()
const { panels } = useI18n()
const kind = styleKindForType(type)
const menuCls = useMenuUI({ content: 'min-w-44' })
const itemCls = menuItem({ justify: 'start' })
const renaming = ref(false)
const draftName = ref(name)

function startRenaming() {
  draftName.value = name
  renaming.value = true
}

function commitName() {
  if (!renaming.value) return
  renaming.value = false
  const next = draftName.value.trim()
  if (next && next !== name) emit('rename', next)
}
</script>

<template>
  <StyleEditPopover :definition="definition">
    <div class="group/style flex h-8 min-w-0 items-center gap-1 rounded hover:bg-hover">
      <AppInput
        v-if="renaming"
        v-model="draftName"
        autofocus
        size="sm"
        tone="panel"
        class="min-w-0 flex-1"
        :aria-label="panels.renameStyle"
        :data-test-id="`${kind}-style-rename-input`"
        @enter="commitName"
        @change="commitName"
        @keydown.escape.stop="renaming = false"
      />
      <PopoverTrigger v-else as-child>
        <button
          type="button"
          class="flex h-full min-w-0 flex-1 items-center gap-2 px-2 text-left"
          :aria-label="`${panels.editStyle}: ${name}`"
          v-bind="{ [`data-local-${kind}-style`]: name }"
          @dblclick="startRenaming"
        >
          <StyleLabel :type="type" :label="label" :definition="definition" />
        </button>
      </PopoverTrigger>
      <DropdownMenuRoot :modal="false">
        <DropdownMenuTrigger as-child>
          <IconButton
            :label="panels.styleActions"
            class="opacity-0 group-hover/style:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            :data-test-id="`${kind}-style-actions`"
          >
            <icon-hugeicons-more-horizontal class="size-3.5" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent side="bottom" align="end" :side-offset="4" :class="menuCls.content">
            <DropdownMenuItem :class="itemCls" @select="startRenaming">
              {{ panels.renameStyle }}
            </DropdownMenuItem>
            <DropdownMenuItem :class="itemCls" :disabled="first" @select="emit('move', 'up')">
              {{ panels.moveStyleUp }}
            </DropdownMenuItem>
            <DropdownMenuItem :class="itemCls" :disabled="last" @select="emit('move', 'down')">
              {{ panels.moveStyleDown }}
            </DropdownMenuItem>
            <DropdownMenuSeparator :class="menuCls.separator" />
            <DropdownMenuItem :class="itemCls" @select="emit('remove')">
              {{ panels.deleteStyle }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  </StyleEditPopover>
</template>
