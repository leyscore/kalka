<script setup lang="ts">
import { formatShortcut, useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { useEditorStore } from '@/app/editor/active-store'
import { appMenuShortcut, appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import CollabPanel from '@/components/collab-panel/CollabPanel.vue'
import AppMenu from '@/components/shell/AppMenu.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { editorTopBar } from '@/theme/editor-top-bar'

import BreakpointSwitcher from './BreakpointSwitcher.vue'
import ZoomDropdown from './ZoomDropdown.vue'

const store = useEditorStore()
const { editor, menu, panels } = useI18n()
const { activeTab, isConfigured } = useAIChat()
const styles = editorTopBar()

/**
 * The agent button is the one way in: without an agent it opens guided setup, where an installed
 * Claude Code, Codex or Gemini CLI connects in one click; with one it opens the conversation.
 */
function toggleAgent(): void {
  if (!isConfigured.value) {
    openAISetup()
    return
  }
  activeTab.value = activeTab.value === 'ai' ? 'design' : 'ai'
}
</script>

<template>
  <header data-test-id="editor-top-bar" :class="styles.root()">
    <div :class="styles.start()">
      <AppMenu />
    </div>
    <BreakpointSwitcher />
    <div :class="styles.end()">
      <IconButton
        :label="panels.ai"
        side="bottom"
        data-test-id="editor-agent"
        :active="activeTab === 'ai'"
        :class="styles.action({ class: 'relative' })"
        @click="toggleAgent"
      >
        <icon-lucide-bot class="size-4" />
        <span
          aria-hidden="true"
          :data-connected="isConfigured || undefined"
          :class="styles.agentStatus()"
        />
      </IconButton>
      <!-- The dropdown pushes itself to the end of a tab row; here its neighbours set its place. -->
      <div class="flex shrink-0">
        <ZoomDropdown />
      </div>
      <IconButton
        :label="`${menu.toggleUI} (${appMenuShortcutLabel('toggle-ui')})`"
        side="bottom"
        data-test-id="app-toggle-ui"
        :class="styles.action()"
        @click="store.state.showUI = !store.state.showUI"
      >
        <icon-lucide-panel-left class="size-[15px]" />
      </IconButton>
      <IconButton
        :label="
          editor.startPreview({
            shortcut: formatShortcut(appMenuShortcut('toggle-preview')) ?? ''
          })
        "
        side="bottom"
        data-test-id="editor-start-preview"
        :class="styles.action()"
        @click="store.startPlay()"
      >
        <icon-lucide-play class="size-3.5" />
      </IconButton>
      <!-- Sized by its content: on its own the panel stretches to push Share to the far edge. -->
      <div class="flex shrink-0">
        <CollabPanel />
      </div>
    </div>
  </header>
</template>
