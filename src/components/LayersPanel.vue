<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { defineAsyncComponent } from 'vue'

import { useI18n } from '@kalka/vue'

import { latch } from '@/app/shell/latch'
import { useLeftPanel } from '@/app/shell/left-panel/use'
import splitterTheme from '@/theme/splitter'

import AssetsPanel from './assets-panel/AssetsPanel.vue'
import CodePanel from './CodePanel.vue'
import DesignCheckPanel from './design-check/DesignCheckPanel.vue'
import FolderPanel from './folder/FolderPanel.vue'
import LayerTree from './LayerTree/LayerTree.vue'
import PagesPanel from './PagesPanel.vue'

const { panels } = useI18n()
const { activePanel } = useLeftPanel()
// The chat, its model SDKs and markdown load when the agent first opens, then stay mounted.
const ChatPanel = defineAsyncComponent(() => import('./ChatPanel.vue'))
const chatUsed = latch(() => activePanel.value === 'ai')
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
      <FolderPanel v-else-if="activePanel === 'folder'" />
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
      <section
        v-if="chatUsed"
        v-show="activePanel === 'ai'"
        role="tabpanel"
        :aria-label="panels.ai"
        data-test-id="agent-panel"
        class="flex min-h-0 flex-1 flex-col"
      >
        <ChatPanel />
      </section>
    </div>
  </aside>
</template>
