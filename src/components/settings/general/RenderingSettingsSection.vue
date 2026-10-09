<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { appRuntimeConfig } from '@/app/runtime/config'
import {
  appPreferences,
  updateCanvasBackground,
  updateCanvasRenderingMode
} from '@/app/settings/preferences/store'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppBadge from '@/components/ui/feedback/AppBadge.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const { rendering } = useI18n()
const hasURLOverride = appRuntimeConfig.sceneRendererOverride
const tiledRendering = computed(() => appPreferences.value.rendering.canvasMode === 'tiled')
const changed = computed(
  () => appPreferences.value.rendering.canvasMode !== appRuntimeConfig.sceneRenderer
)

const documentPageColor = computed(
  () => appPreferences.value.rendering.canvasBackground === 'document'
)

function setDocumentPageColor(enabled: boolean): void {
  updateCanvasBackground(enabled ? 'document' : 'kalka')
}

function setTiledRendering(enabled: boolean): void {
  updateCanvasRenderingMode(enabled ? 'tiled' : 'retained')
}
</script>

<template>
  <SettingsSection>
    <template #title>{{ rendering.settingsTitle }}</template>
    <template #description>{{ rendering.settingsDescription }}</template>

    <SettingsGroup>
      <SettingsRow
        :label="rendering.documentPageColor"
        :description="rendering.documentPageColorDescription"
      >
        <AppSwitch
          :model-value="documentPageColor"
          :label="rendering.documentPageColor"
          data-test-id="settings-document-page-color"
          @update:model-value="setDocumentPageColor"
        />
      </SettingsRow>
      <label class="flex min-h-11 items-center justify-between gap-4 px-3.5 py-2">
        <span>
          <span class="flex flex-wrap items-center gap-2 text-xs text-surface">
            {{ rendering.progressiveTiled }}
            <AppBadge :ui="{ base: 'bg-panel-field text-surface' }">{{
              rendering.experimental
            }}</AppBadge>
          </span>
          <span class="block text-[11px] text-muted">{{
            rendering.progressiveTiledDescription
          }}</span>
        </span>
        <AppSwitch
          :model-value="tiledRendering"
          :label="rendering.progressiveTiled"
          data-test-id="settings-progressive-tiled-rendering"
          @update:model-value="setTiledRendering"
        />
      </label>
    </SettingsGroup>

    <AppAlert v-if="hasURLOverride" :heading="rendering.urlOverride" />
    <AppAlert v-else-if="changed" :heading="rendering.reloadRequired" />
  </SettingsSection>
</template>
