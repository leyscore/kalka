<script setup lang="ts">
import { computed, ref } from 'vue'

import { useMediaMessages, useSettingsMessages } from '@open-pencil/vue'

import { vectorizeProviderID, VECTORIZE_PROVIDER_DEFINITIONS } from '@/app/editor/vectorize'
import { pexelsKeyStatus, unsplashKeyStatus } from '@/app/settings/credentials/media'
import type { MediaSettingsService } from '@/app/settings/media/use'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'
import AppActionRow from '@/components/ui/list/AppActionRow.vue'

import MediaCredentialEditor from './MediaCredentialEditor.vue'

const editing = ref<MediaSettingsService | null>(null)
const settings = useSettingsMessages()
const media = useMediaMessages()
const stockServices = computed(() => [
  { id: 'pexels' as const, name: 'Pexels', status: pexelsKeyStatus.value },
  { id: 'unsplash' as const, name: 'Unsplash', status: unsplashKeyStatus.value }
])
const vectorProvider = computed(() =>
  VECTORIZE_PROVIDER_DEFINITIONS.find((item) => item.id === vectorizeProviderID.value)
)
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col" data-test-id="settings-media-panel">
    <MediaCredentialEditor
      v-if="editing"
      :key="editing"
      :service="editing"
      @done="editing = null"
    />
    <SettingsPage v-else>
      <section class="flex flex-col gap-4">
        <SettingsSectionHeader>{{ settings.media }}</SettingsSectionHeader>
        <AppActionRow
          v-for="service in stockServices"
          :key="service.id"
          @click="editing = service.id"
        >
          {{ service.name }}
          <template #description>{{
            service.status === 'configured' ? settings.configured : settings.notConfigured
          }}</template>
          <template #trailing
            >{{ settings.edit }}<icon-lucide-chevron-right class="size-3.5"
          /></template>
        </AppActionRow>
        <SettingsSectionHeader>
          {{ media.vectorization }}
          <template #description>{{ media.vectorizationDescription }}</template>
        </SettingsSectionHeader>
        <AppActionRow data-vectorize-settings @click="editing = 'vectorize'">
          {{ vectorProvider?.name }}
          <template #trailing
            >{{ settings.edit }}<icon-lucide-chevron-right class="size-3.5"
          /></template>
        </AppActionRow>
      </section>
    </SettingsPage>
  </div>
</template>
