<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, ref } from 'vue'

import { useDesignCheckMessages, useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { useEditorStore } from '@/app/editor/active-store'
import { countIssues } from '@/app/editor/design-check/issues'
import { isTauri } from '@/app/tauri/env'
import AppMenu from '@/components/shell/AppMenu.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { panelRail } from '@/theme/panel/rail'
import splitterTheme from '@/theme/splitter'

import AssetsPanel from './assets-panel/AssetsPanel.vue'
import CodePanel from './CodePanel.vue'
import DesignCheckPanel from './design-check/DesignCheckPanel.vue'
import LayerTree from './LayerTree/LayerTree.vue'
import PagesPanel from './PagesPanel.vue'
import VersionsPanel from './versions/VersionsPanel.vue'

const { panels } = useI18n()
const checkMessages = useDesignCheckMessages()
const store = useEditorStore()
const { activeTab } = useAIChat()

type DocumentPanel = 'file' | 'assets' | 'versions'
type RailPanel = DocumentPanel | 'code' | 'lint'
// Versions use the git on this computer, so only the desktop app offers them.
const hasVersions = isTauri()
const documentPanel = ref<DocumentPanel>('file')
/**
 * Code and the design check are opened from elsewhere too (a canvas marker, a shortcut), through
 * the shared properties tab; while one of them is asked for, it is what this panel shows.
 */
const activePanel = computed<RailPanel>(() =>
  activeTab.value === 'code' || activeTab.value === 'lint' ? activeTab.value : documentPanel.value
)

function show(panel: RailPanel) {
  if (panel === 'code' || panel === 'lint') {
    activeTab.value = panel
    return
  }
  documentPanel.value = panel
  if (activeTab.value === 'code' || activeTab.value === 'lint') activeTab.value = 'design'
}

/** Errors and warnings on the current page; suggestions do not earn an indicator. */
const problemCount = computed(() => {
  const snapshot = store.designCheck.snapshot.value
  if (!snapshot || snapshot.pageId !== store.state.currentPageId) return null
  const counts = countIssues(snapshot.issues)
  return { total: counts.error + counts.warning, severity: counts.error > 0 ? 'error' : 'warning' }
})
const checkLabel = computed(() =>
  problemCount.value?.total
    ? `${checkMessages.value.tab}, ${checkMessages.value.tabCount({ count: problemCount.value.total })}`
    : checkMessages.value.tab
)

const rail = panelRail()
const splitterStyles = tv(splitterTheme)({ direction: 'vertical' })
</script>

<template>
  <aside
    data-test-id="layers-panel"
    class="flex min-w-0 flex-1 overflow-hidden"
    style="contain: paint layout style"
  >
    <div
      role="tablist"
      aria-orientation="vertical"
      :aria-label="panels.layers"
      :class="rail.root()"
    >
      <Tip :label="panels.layers" side="right">
        <button
          type="button"
          role="tab"
          data-test-id="left-panel-layers-tab"
          :aria-label="panels.layers"
          :aria-selected="activePanel === 'file'"
          :data-active="activePanel === 'file' || undefined"
          :class="rail.item()"
          @click="show('file')"
        >
          <icon-lucide-layers :class="rail.icon()" />
        </button>
      </Tip>
      <Tip :label="panels.assets" side="right">
        <button
          type="button"
          role="tab"
          data-test-id="left-panel-assets-tab"
          :aria-label="panels.assets"
          :aria-selected="activePanel === 'assets'"
          :data-active="activePanel === 'assets' || undefined"
          :class="rail.item()"
          @click="show('assets')"
        >
          <icon-lucide-image :class="rail.icon()" />
        </button>
      </Tip>
      <div aria-hidden="true" :class="rail.divider()" />
      <Tip :label="panels.code" side="right">
        <button
          type="button"
          role="tab"
          data-test-id="properties-tab-code"
          :aria-label="panels.code"
          :aria-selected="activePanel === 'code'"
          :data-active="activePanel === 'code' || undefined"
          :class="rail.item()"
          @click="show('code')"
        >
          <icon-lucide-code :class="rail.icon()" />
        </button>
      </Tip>
      <Tip v-if="hasVersions" :label="panels.versions" side="right">
        <button
          type="button"
          role="tab"
          data-test-id="left-panel-versions-tab"
          :aria-label="panels.versions"
          :aria-selected="activePanel === 'versions'"
          :data-active="activePanel === 'versions' || undefined"
          :class="rail.item()"
          @click="show('versions')"
        >
          <icon-lucide-git-branch :class="rail.icon()" />
        </button>
      </Tip>
      <Tip :label="checkLabel" side="right">
        <button
          type="button"
          role="tab"
          data-test-id="properties-tab-lint"
          :aria-label="checkLabel"
          :aria-selected="activePanel === 'lint'"
          :data-active="activePanel === 'lint' || undefined"
          :class="rail.item()"
          @click="show('lint')"
        >
          <icon-lucide-list-checks :class="rail.icon()" />
          <span
            v-if="problemCount?.total"
            aria-hidden="true"
            :data-severity="problemCount.severity"
            :class="rail.badge()"
          >
            {{ problemCount.total > 99 ? '99+' : problemCount.total }}
          </span>
        </button>
      </Tip>
    </div>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <AppMenu />
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
