<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from 'reka-ui'
import IconCheck from '~icons/hugeicons/check'

import { useI18n, useRetainedPopup } from '@kalka/vue'

import { useMenuUI } from '@/components/ui/menu/menu'
import Tip from '@/components/ui/overlay/Tip.vue'

import { useLayerVariableModes } from './use'

// Figma's "Apply variable mode" button in the layer's appearance header.
const { variables } = useI18n()
const { collections, rows, setMode } = useLayerVariableModes()
const chosen = (collectionId: string) =>
  rows.value.find((row) => row.collection.id === collectionId)?.value
const { open: popupOpen, portalActive } = useRetainedPopup()
const menuCls = useMenuUI({ content: 'min-w-44' })
</script>

<template>
  <DropdownMenuRoot v-if="collections.length > 0" v-model:open="popupOpen">
    <Tip :label="variables.applyVariableMode">
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          data-test-id="apply-variable-mode"
          :aria-label="variables.applyVariableMode"
          class="flex size-6 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-surface data-[state=open]:bg-active data-[state=open]:text-surface"
        >
          <icon-hugeicons-hexagon class="size-3.5" />
        </button>
      </DropdownMenuTrigger>
    </Tip>
    <DropdownMenuPortal v-if="portalActive">
      <DropdownMenuContent align="end" side="bottom" :side-offset="4" :class="menuCls.content">
        <template v-for="(collection, index) in collections" :key="collection.id">
          <DropdownMenuSeparator v-if="index > 0" :class="menuCls.separator" />
          <DropdownMenuLabel :class="menuCls.label">{{ collection.name }}</DropdownMenuLabel>
          <DropdownMenuItem
            v-for="mode in collection.modes"
            :key="mode.modeId"
            :class="menuCls.item"
            @select="setMode(collection.id, mode.modeId)"
          >
            <span>{{ mode.name }}</span>
            <IconCheck v-if="chosen(collection.id) === mode.modeId" class="ml-4 size-3.5" />
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
