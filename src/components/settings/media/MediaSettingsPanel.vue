<script setup lang="ts">
import { computed, ref } from 'vue'

import { useMediaMessages, useSettingsMessages } from '@kalka/vue'

import { isAIToolEnabled } from '@/app/ai/tools/catalog'
import { aiToolOverrides } from '@/app/ai/tools/preferences'
import { vectorizeProviderID, VECTORIZE_PROVIDER_DEFINITIONS } from '@/app/editor/vectorize'
import { pexelsKeyStatus, unsplashKeyStatus } from '@/app/settings/credentials/media'
import type { MediaSettingsService } from '@/app/settings/media/use'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppActionRow from '@/components/ui/list/AppActionRow.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

import MediaCredentialEditor from './MediaCredentialEditor.vue'

const editing = ref<MediaSettingsService | null>(null)
const settings = useSettingsMessages()
const media = useMediaMessages()
const stockServices = computed(() => [
  { id: 'pexels' as const, name: 'Pexels', status: pexelsKeyStatus.value },
  { id: 'unsplash' as const, name: 'Unsplash', status: unsplashKeyStatus.value }
])
// The agent's reference search is one of its tools, so the switch is that tool's access setting.
const REFERENCE_TOOL = 'find_references'
const agentReferences = computed({
  get: () => isAIToolEnabled(REFERENCE_TOOL, aiToolOverrides.value),
  set: (enabled: boolean) => {
    aiToolOverrides.value = { ...aiToolOverrides.value, [REFERENCE_TOOL]: enabled }
  }
})
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
      <div class="flex flex-col gap-6">
        <SettingsSection>
          <template #title>{{ settings.media }}</template>
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
              >{{ settings.edit }}<icon-hugeicons-chevron-right class="size-3.5"
            /></template>
          </AppActionRow>
          <SettingsGroup>
            <SettingsRow
              :label="media.agentReferences"
              :description="media.agentReferencesDescription"
            >
              <AppSwitch
                v-model="agentReferences"
                :label="media.agentReferences"
                data-test-id="settings-agent-references"
              />
            </SettingsRow>
          </SettingsGroup>
        </SettingsSection>
        <SettingsSection>
          <template #title>{{ media.vectorization }}</template>
          <template #description>{{ media.vectorizationDescription }}</template>
          <AppActionRow data-vectorize-settings @click="editing = 'vectorize'">
            {{ vectorProvider?.name }}
            <template #trailing
              >{{ settings.edit }}<icon-hugeicons-chevron-right class="size-3.5"
            /></template>
          </AppActionRow>
        </SettingsSection>
      </div>
    </SettingsPage>
  </div>
</template>
