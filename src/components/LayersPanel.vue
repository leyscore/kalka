<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'

import { useI18n } from '@kalka/vue'

import { useLeftPanel } from '@/app/shell/left-panel/use'
import splitterTheme from '@/theme/splitter'

import AssetsPanel from './assets-panel/AssetsPanel.vue'
import CodePanel from './CodePanel.vue'
import DesignCheckPanel from './design-check/DesignCheckPanel.vue'
import LayerTree from './LayerTree/LayerTree.vue'
import PagesPanel from './PagesPanel.vue'
import VersionsPanel from './versions/VersionsPanel.vue'

const { panels } = useI18n()
const { activePanel } = useLeftPanel()
const splitterStyles = tv(splitterTheme)({ direction: 'vertical' })
</script>

<template>
  <aside
    data-test-id="layers-panel"
    class="flex min-w-0 flex-1 overflow-hidden"
    style="contain: paint layout style"
  >
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AssetsPanel v-if="activePanel === 'assets'" />
      <VersionsPanel v-else-if="activePanel === 'versions'" />
      <SplitterGroup
        v-else-if="activePanel === 'file'"
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
      <!-- Mounted from the start, as when they were tabs: the code view keeps its scroll and the check its list. -->
      <div v-show="activePanel === 'code'" class="flex min-h-0 flex-1 flex-col">
        <CodePanel :active="activePanel === 'code'" />
      </div>
      <div v-show="activePanel === 'lint'" class="flex min-h-0 flex-1 flex-col">
        <DesignCheckPanel :active="activePanel === 'lint'" />
      </div>
    </div>
  </aside>
</template>
