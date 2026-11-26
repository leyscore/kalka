<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'

import { useI18n } from '@kalka/vue'

import IconButton from '@/components/ui/button/IconButton.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'

/** The menu of a draft on Home, as the server's files have one: here to delete it. */
const { name } = defineProps<{ name: string }>()
const emit = defineEmits<{ delete: [] }>()
const { files } = useI18n()
const menu = useMenuUI()
const item = menuItem()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <IconButton :label="files.fileActions({ name })" class="bg-white/90 shadow-sm">
        <icon-hugeicons-more-horizontal class="size-4" />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent align="end" :side-offset="6" :class="menu.content">
        <DropdownMenuItem :class="item" @select="emit('delete')">
          {{ files.deleteDraft }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
