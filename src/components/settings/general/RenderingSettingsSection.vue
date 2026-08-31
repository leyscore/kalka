<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@open-pencil/vue'

import { appRuntimeConfig } from '@/app/runtime/config'
import { appPreferences, updateCanvasRenderingMode } from '@/app/settings/preferences/store'
import AppSwitch from '@/components/ui/AppSwitch.vue'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'

const { dialogs } = useI18n()
const hasURLOverride = appRuntimeConfig.sceneRendererOverride
const tiledRendering = computed(() => appPreferences.value.rendering.canvasMode === 'tiled')
const changed = computed(
  () => appPreferences.value.rendering.canvasMode !== appRuntimeConfig.sceneRenderer
)

function setTiledRendering(enabled: boolean): void {
  updateCanvasRenderingMode(enabled ? 'tiled' : 'retained')
}
</script>

<template>
  <SettingsSectionHeader>
    {{ dialogs.settingsRendering }}
    <template #description>{{ dialogs.settingsRenderingDescription }}</template>
  </SettingsSectionHeader>

  <SettingsGroup>
    <label class="flex items-center justify-between gap-4 px-3 py-2.5">
      <span>
        <span class="block text-xs text-surface">{{ dialogs.progressiveTiledRendering }}</span>
        <span class="block text-[10px] text-muted">{{
          dialogs.progressiveTiledRenderingDescription
        }}</span>
      </span>
      <AppSwitch
        :model-value="tiledRendering"
        :label="dialogs.progressiveTiledRendering"
        data-test-id="settings-progressive-tiled-rendering"
        @update:model-value="setTiledRendering"
      />
    </label>
  </SettingsGroup>

  <p v-if="hasURLOverride" class="text-[10px] text-muted">
    {{ dialogs.rendererURLOverride }}
  </p>
  <p v-else-if="changed" class="text-[10px] text-muted">
    {{ dialogs.rendererReloadRequired }}
  </p>
</template>
