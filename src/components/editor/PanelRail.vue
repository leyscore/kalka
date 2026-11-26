<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed, ref, useTemplateRef } from 'vue'

import {
  useCommentsMessages,
  useDesignCheckMessages,
  useI18n,
  useShortcutsMessages
} from '@kalka/vue'

import { useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import { countIssues } from '@/app/editor/design-check/issues'
import { toggleVariablesPage } from '@/app/editor/tokens/dialog'
import { openSettings } from '@/app/settings/open'
import { aiHidden } from '@/app/settings/preferences/store'
import { openShortcutsHelp } from '@/app/shell/keyboard/help'
import { useLeftPanel, type RailPanel } from '@/app/shell/left-panel/use'
import { appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import { openExternalLink } from '@/app/shell/ui'
import { useMenuUI } from '@/components/ui/menu/menu'
import { useGlide } from '@/components/ui/motion/useGlide'
import Tip from '@/components/ui/overlay/Tip.vue'
import { docsURL } from '@/constants'
import { glidePills } from '@/theme/motion/glide'
import { panelRail } from '@/theme/panel/rail'

const { panels, settings, menu, locale } = useI18n()
const checkMessages = useDesignCheckMessages()
const store = useEditorStore()
const { activePanel, show, toggleAgent } = useLeftPanel()

/** The variables page covers the panels and the canvas, so while it is open no panel shows as chosen. */
const variablesOpen = computed(() => store.state.variablesOpen)
function isActive(panel: RailPanel) {
  return !variablesOpen.value && activePanel.value === panel
}

/** Layers and assets are the document's own tabs, as in Figma; the other panels close again. */
const TABS: ReadonlySet<RailPanel> = new Set(['file', 'assets'])

/**
 * Choosing a panel closes the variables page first, and shows that panel; one more press on a
 * panel shown closes it and gives the panel back to the layers, as the agent's button does.
 */
function choose(panel: RailPanel) {
  const closing = !TABS.has(panel) && isActive(panel)
  store.state.variablesOpen = false
  show(closing ? 'file' : panel)
}

function chooseAgent() {
  if (variablesOpen.value && activePanel.value === 'ai') store.state.variablesOpen = false
  else {
    store.state.variablesOpen = false
    toggleAgent()
  }
}
const commentMessages = useCommentsMessages()
const comments = useComments(store)
const commentsLabel = computed(() =>
  comments.openCount.value > 0
    ? `${commentMessages.value.title}, ${commentMessages.value.openCount({ count: comments.openCount.value })}`
    : commentMessages.value.title
)

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

const shortcuts = useShortcutsMessages()
const helpOpen = ref(false)
const helpMenu = useMenuUI({ content: 'min-w-52' })
const helpShortcut = appMenuShortcutLabel('keyboard-shortcuts')

function openDocs() {
  void openExternalLink(docsURL(locale.value))
}

// The open panel's pill slides to the one chosen; a soft one follows the pointer.
const root = useTemplateRef<HTMLElement>('root')
useGlide(root, { items: 'button', active: 'button[data-active]', pillClass: glidePills.selected })
useGlide(root, { items: 'button', hover: true, pillClass: glidePills.selectedHover })
</script>

<template>
  <div
    ref="root"
    role="tablist"
    aria-orientation="vertical"
    :aria-label="panels.layers"
    data-test-id="panel-rail"
    :class="rail.root()"
  >
    <!-- The agent's conversation: one more press closes it and gives the panel back to the document. -->
    <Tip v-if="!aiHidden" :label="panels.ai" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="properties-tab-ai"
        :aria-label="panels.ai"
        :aria-selected="isActive('ai')"
        :data-state="isActive('ai') ? 'active' : 'inactive'"
        :data-active="isActive('ai') || undefined"
        :class="rail.item()"
        @click="chooseAgent"
      >
        <icon-hugeicons-sparkle :class="rail.icon()" />
      </button>
    </Tip>
    <!-- What the agent is told: under it, in the same group. -->
    <Tip v-if="!aiHidden" :label="panels.instructions" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-instructions-tab"
        :aria-label="panels.instructions"
        :aria-selected="isActive('instructions')"
        :data-state="isActive('instructions') ? 'active' : 'inactive'"
        :data-active="isActive('instructions') || undefined"
        :class="rail.item()"
        @click="choose('instructions')"
      >
        <icon-hugeicons-book-open-01 :class="rail.icon()" />
      </button>
    </Tip>
    <div aria-hidden="true" :class="rail.divider()" />
    <Tip :label="panels.layers" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-layers-tab"
        :aria-label="panels.layers"
        :aria-selected="isActive('file')"
        :data-state="isActive('file') ? 'active' : 'inactive'"
        :data-active="isActive('file') || undefined"
        :class="rail.item()"
        @click="choose('file')"
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
        :aria-selected="isActive('assets')"
        :data-state="isActive('assets') ? 'active' : 'inactive'"
        :data-active="isActive('assets') || undefined"
        :class="rail.item()"
        @click="choose('assets')"
      >
        <icon-hugeicons-component :class="rail.icon()" />
      </button>
    </Tip>
    <!-- Variables open as a page over the panels and the canvas; another press closes it. -->
    <Tip :label="panels.variables" side="right">
      <button
        type="button"
        data-test-id="panel-rail-variables"
        :aria-label="panels.variables"
        :aria-pressed="variablesOpen"
        :data-active="variablesOpen || undefined"
        :class="rail.item()"
        @click="toggleVariablesPage(store)"
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
        :aria-selected="isActive('code')"
        :data-state="isActive('code') ? 'active' : 'inactive'"
        :data-active="isActive('code') || undefined"
        :class="rail.item()"
        @click="choose('code')"
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
        :aria-selected="isActive('folder')"
        :data-state="isActive('folder') ? 'active' : 'inactive'"
        :data-active="isActive('folder') || undefined"
        :class="rail.item()"
        @click="choose('folder')"
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
        :aria-selected="isActive('history')"
        :data-state="isActive('history') ? 'active' : 'inactive'"
        :data-active="isActive('history') || undefined"
        :class="rail.item()"
        @click="choose('history')"
      >
        <icon-hugeicons-git-branch :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="commentsLabel" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="left-panel-comments-tab"
        :aria-label="commentsLabel"
        :aria-selected="isActive('comments')"
        :data-state="isActive('comments') ? 'active' : 'inactive'"
        :data-active="isActive('comments') || undefined"
        :class="rail.item()"
        @click="choose('comments')"
      >
        <icon-hugeicons-comment-01 :class="rail.icon()" />
      </button>
    </Tip>
    <Tip :label="checkLabel" side="right">
      <button
        type="button"
        role="tab"
        data-test-id="properties-tab-lint"
        :aria-label="checkLabel"
        :aria-selected="isActive('lint')"
        :data-state="isActive('lint') ? 'active' : 'inactive'"
        :data-active="isActive('lint') || undefined"
        :class="rail.item()"
        @click="choose('lint')"
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
    <!-- Figma's help menu: the keyboard shortcuts in the app, the documentation in a new tab. -->
    <DropdownMenuRoot v-model:open="helpOpen">
      <Tip :label="shortcuts.help" side="right">
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            data-test-id="panel-rail-help"
            :aria-label="shortcuts.help"
            :class="rail.item()"
          >
            <icon-hugeicons-help-circle :class="rail.icon()" />
          </button>
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuPortal>
        <DropdownMenuContent side="right" align="end" :side-offset="8" :class="helpMenu.content">
          <DropdownMenuItem :class="helpMenu.item" @select="openShortcutsHelp">
            <span>{{ menu.keyboardShortcuts }}</span>
            <span :class="helpMenu.shortcut">{{ helpShortcut }}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            data-test-id="panel-rail-documentation"
            :class="helpMenu.item"
            @select="openDocs"
          >
            <span>{{ menu.documentation }}</span>
            <icon-hugeicons-square-arrow-out-up-right :class="helpMenu.icon" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
    <Tip :label="settings.title" side="right">
      <button
        type="button"
        data-test-id="app-settings-trigger"
        :aria-label="settings.title"
        :class="rail.item()"
        @click="openSettings()"
      >
        <icon-hugeicons-settings-01 :class="rail.icon()" />
      </button>
    </Tip>
  </div>
</template>
