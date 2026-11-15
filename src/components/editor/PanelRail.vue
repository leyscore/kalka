<script setup lang="ts">
import { computed } from 'vue'

import { useDesignCheckMessages, useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { countIssues } from '@/app/editor/design-check/issues'
import { openVariablesDialog } from '@/app/editor/tokens/dialog'
import { openSettingsDialog } from '@/app/settings/dialog'
import { useLeftPanel } from '@/app/shell/left-panel/use'
import Tip from '@/components/ui/overlay/Tip.vue'
import { panelRail } from '@/theme/panel/rail'

const { panels, settings } = useI18n()
const checkMessages = useDesignCheckMessages()
const store = useEditorStore()
const { activePanel, show, toggleAgent } = useLeftPanel()

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
</script>

<template>
  <div
    role="tablist"
    aria-orientation="vertical"
    :aria-label="panels.layers"
    data-test-id="panel-rail"
    :class="rail.root()"
  >
    <!-- The agent's conversation: one more press closes it and gives the panel back to the document. -->
    <Tip :label="panels.ai" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="properties-tab-ai"
        :aria-label="panels.ai"
        :aria-selected="activePanel === 'ai'"
        :data-state="activePanel === 'ai' ? 'active' : 'inactive'"
        :data-active="activePanel === 'ai' || undefined"
        :class="rail.item()"
        @click="toggleAgent"
      >
        <icon-hugeicons-sparkle :class="rail.icon()" />
      </button>
    </Tip>
    <div aria-hidden="true" :class="rail.divider()" />
    <Tip :label="panels.layers" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-layers-tab"
        :aria-label="panels.layers"
        :aria-selected="activePanel === 'file'"
        :data-state="activePanel === 'file' ? 'active' : 'inactive'"
        :data-active="activePanel === 'file' || undefined"
        :class="rail.item()"
        @click="show('file')"
      >
        <icon-hugeicons-layers-01 :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="panels.assets" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-assets-tab"
        :aria-label="panels.assets"
        :aria-selected="activePanel === 'assets'"
        :data-state="activePanel === 'assets' ? 'active' : 'inactive'"
        :data-active="activePanel === 'assets' || undefined"
        :class="rail.item()"
        @click="show('assets')"
      >
        <icon-hugeicons-component :class="rail.icon()" />
      </button>
    </Tip>
    <!-- Variables open as a dialog over the editor, so this is a button, not one of the panel's tabs. -->
    <Tip :label="panels.variables" side="right">
      <button
        type="button"
        data-test-id="panel-rail-variables"
        :aria-label="panels.variables"
        :class="rail.item()"
        @click="openVariablesDialog(store)"
      >
        <icon-hugeicons-swatch-book :class="rail.icon()" />
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
        :data-state="activePanel === 'code' ? 'active' : 'inactive'"
        :data-active="activePanel === 'code' || undefined"
        :class="rail.item()"
        @click="show('code')"
      >
        <icon-hugeicons-code :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="panels.folder" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-folder-tab"
        :aria-label="panels.folder"
        :aria-selected="activePanel === 'folder'"
        :data-state="activePanel === 'folder' ? 'active' : 'inactive'"
        :data-active="activePanel === 'folder' || undefined"
        :class="rail.item()"
        @click="show('folder')"
      >
        <icon-hugeicons-folder-01 :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="panels.versionsHistory" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-history-tab"
        :aria-label="panels.versionsHistory"
        :aria-selected="activePanel === 'history'"
        :data-state="activePanel === 'history' ? 'active' : 'inactive'"
        :data-active="activePanel === 'history' || undefined"
        :class="rail.item()"
        @click="show('history')"
      >
        <icon-hugeicons-git-branch :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="checkLabel" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="properties-tab-lint"
        :aria-label="checkLabel"
        :aria-selected="activePanel === 'lint'"
        :data-state="activePanel === 'lint' ? 'active' : 'inactive'"
        :data-active="activePanel === 'lint' || undefined"
        :class="rail.item()"
        @click="show('lint')"
      >
        <icon-hugeicons-list-checks :class="rail.icon()" />
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
    <div class="flex-1" />
    <Tip :label="settings.title" side="right">
      <button
        type="button"
        data-test-id="app-settings-trigger"
        :aria-label="settings.title"
        :class="rail.item()"
        @click="openSettingsDialog()"
      >
        <icon-hugeicons-settings-01 :class="rail.icon()" />
      </button>
    </Tip>
  </div>
</template>
