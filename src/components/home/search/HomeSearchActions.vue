<script setup lang="ts">
import { useI18n, useViewportKind } from '@open-pencil/vue'

import { openFileDialog } from '@/app/shell/menu/use'
import AppButton from '@/components/ui/button/AppButton.vue'

import HomeJoinRoom from './HomeJoinRoom.vue'

const emit = defineEmits<{ 'new-document': [] }>()
const { menu, files } = useI18n()
const { isMobile } = useViewportKind()
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <HomeJoinRoom :size="isMobile ? 'lg' : 'md'" />
    <AppButton
      :size="isMobile ? 'lg' : 'md'"
      variant="ghost"
      data-test-id="home-open-file"
      @click="openFileDialog"
    >
      <template #leading><icon-lucide-folder-open class="size-3.5" /></template>
      {{ menu.open }}
    </AppButton>
    <AppButton
      :size="isMobile ? 'lg' : 'md'"
      color="primary"
      variant="solid"
      class="rounded-lg px-4"
      data-test-id="home-new-document"
      @click="emit('new-document')"
    >
      <template #leading><icon-lucide-plus class="size-3.5" /></template>
      {{ files.newDesign }}
    </AppButton>
  </div>
</template>
