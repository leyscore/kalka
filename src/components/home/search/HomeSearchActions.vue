<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { openFileDialog } from '@/app/shell/menu/use'
import AppButton from '@/components/ui/button/AppButton.vue'
import { homeAction } from '@/theme/home/start'

import HomeJoinRoom from './HomeJoinRoom.vue'

const emit = defineEmits<{ 'new-document': [] }>()
const { menu, files } = useI18n()
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
