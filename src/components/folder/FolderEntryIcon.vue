<script setup lang="ts">
import { computed } from 'vue'

import type { FolderEntryType } from '@/app/document/folder/view'
import { folderPanel } from '@/theme/panel/folder'

/** The icon of a folder entry, in the color of its part of the document. */
const { type } = defineProps<{ type: FolderEntryType }>()
const icon = computed(() => folderPanel({ type }).icon())
const FOLDERS: readonly FolderEntryType[] = ['pages', 'design', 'assets', 'instructions', 'folder']
</script>

<template>
  <icon-hugeicons-folder-01 v-if="FOLDERS.includes(type)" :class="icon" />
  <icon-hugeicons-image-01 v-else-if="type === 'image'" :class="icon" />
  <icon-hugeicons-browser v-else-if="type === 'page'" :class="icon" />
  <icon-hugeicons-paint-brush-01 v-else-if="type === 'style'" :class="icon" />
  <icon-hugeicons-brackets v-else-if="type === 'data'" :class="icon" />
  <icon-hugeicons-sparkles v-else-if="type === 'skill'" :class="icon" />
  <icon-hugeicons-book-open-01 v-else-if="type === 'instruction'" :class="icon" />
  <icon-hugeicons-note-01 v-else-if="type === 'text'" :class="icon" />
  <icon-hugeicons-file-01 v-else :class="icon" />
</template>
