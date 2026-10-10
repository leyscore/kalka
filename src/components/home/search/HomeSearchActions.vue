<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { openFileDialog, openFolderDialog } from '@/app/shell/menu/use'
import { isTauri } from '@/app/tauri/env'
import AppButton from '@/components/ui/button/AppButton.vue'
import { homeAction } from '@/theme/home/start'

import HomeJoinRoom from './HomeJoinRoom.vue'

const emit = defineEmits<{ 'new-document': [] }>()
const { menu, files } = useI18n()
/** Folders open through the desktop app's file system access. */
const canOpenFolder = isTauri()
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <HomeJoinRoom />
    <AppButton
      size="lg"
      variant="ghost"
      :class="homeAction.quiet"
      data-test-id="home-open-file"
      @click="openFileDialog"
    >
      {{ menu.open }}
    </AppButton>
    <AppButton
      v-if="canOpenFolder"
      size="lg"
      variant="ghost"
      :class="homeAction.quiet"
      data-test-id="home-open-folder"
      @click="openFolderDialog"
    >
      {{ menu.openFolder }}
    </AppButton>
    <AppButton
      size="lg"
      color="primary"
      variant="solid"
      :class="homeAction.primary"
      data-test-id="home-new-document"
      @click="emit('new-document')"
    >
      <template #leading><icon-lucide-plus class="size-3.5" /></template>
      {{ files.newDesign }}
    </AppButton>
  </div>
</template>
