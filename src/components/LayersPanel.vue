<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { isTauri } from '@/app/tauri/env'
import AppMenu from '@/components/shell/AppMenu.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import splitterTheme from '@/theme/splitter'

import AssetsPanel from './assets-panel/AssetsPanel.vue'
import LayerTree from './LayerTree/LayerTree.vue'
import PagesPanel from './PagesPanel.vue'
import VersionsPanel from './versions/VersionsPanel.vue'

const { menu, panels } = useI18n()
type LeftPanel = 'file' | 'assets' | 'versions'
// Versions use the git on this computer, so only the desktop app offers them.
const hasVersions = isTauri()
const activePanel = ref<LeftPanel>('file')
const panelModel = computed({
  get: () => activePanel.value,
  set: (value: string) => {
    if (value === 'file' || value === 'assets' || (value === 'versions' && hasVersions)) {
      activePanel.value = value
    }
  }
})
const panelOptions = computed(() => [
  { value: 'file', label: menu.value.file },
  { value: 'assets', label: panels.value.assets },
  ...(hasVersions ? [{ value: 'versions', label: panels.value.versions }] : [])
])
const panelTabsUI = hasVersions
  ? { root: 'grid w-full grid-cols-3' }
  : { root: 'grid w-full grid-cols-2' }
const TAB_TEST_IDS: Record<string, string> = {
  file: 'left-panel-layers-tab',
  assets: 'left-panel-assets-tab',
  versions: 'left-panel-versions-tab'
}
const splitterStyles = tv(splitterTheme)({ direction: 'vertical' })
</script>

<template>
  <aside
    data-test-id="layers-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden"
    style="contain: paint layout style"
  >
    <AppMenu />
    <div class="shrink-0 px-3 pb-3">
      <SegmentedControl
        v-model="panelModel"
        :options="panelOptions"
        :label="panels.layers"
        size="lg"
        :ui="panelTabsUI"
      >
        <template #option="{ option }">
          <span :data-test-id="TAB_TEST_IDS[option.value]" class="truncate">
            {{ option.label }}
          </span>
        </template>
      </SegmentedControl>
    </div>
    <AssetsPanel v-if="activePanel === 'assets'" />
    <VersionsPanel v-else-if="activePanel === 'versions'" />
    <SplitterGroup
      v-else
      direction="vertical"
      auto-save-id="layers-layout"
      class="flex-1 overflow-hidden"
    >
      <SplitterPanel
        :default-size="22"
        :min-size="10"
        :max-size="60"
        class="flex flex-col overflow-hidden"
      >
        <PagesPanel />
      </SplitterPanel>
      <SplitterResizeHandle :class="splitterStyles.handle()">
        <div :class="splitterStyles.divider({ class: 'inset-x-3 bg-hairline' })" />
      </SplitterResizeHandle>
      <SplitterPanel :default-size="78" :min-size="20" class="flex flex-col overflow-hidden">
        <header
          data-test-id="layers-header"
          class="shrink-0 px-4 pt-3 pb-1.5 text-[11px] font-semibold text-muted"
        >
          {{ panels.layers }}
        </header>
        <LayerTree data-test-id="layers-tree" />
      </SplitterPanel>
    </SplitterGroup>
  </aside>
</template>
