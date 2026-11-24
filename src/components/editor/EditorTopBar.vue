<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'

import { formatShortcut, useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { openFolderFile } from '@/app/document/folder/view'
import { useEditorStore } from '@/app/editor/active-store'
import { aiHidden } from '@/app/settings/preferences/store'
import { useLeftPanel } from '@/app/shell/left-panel/use'
import { useDocumentNameRename } from '@/app/shell/menu/document-name'
import { appMenuShortcut, appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import { useTabsHost } from '@/app/tabs/placement'
import CollabPanel from '@/components/collab-panel/CollabPanel.vue'
import FolderFileBar from '@/components/folder/FolderFileBar.vue'
import AppMenu from '@/components/shell/AppMenu.vue'
import TabBar from '@/components/TabBar.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { IS_TAURI } from '@/constants'
import { editorTopBar } from '@/theme/editor-top-bar'

import BreakpointSwitcher from './BreakpointSwitcher.vue'
import ZoomDropdown from './ZoomDropdown.vue'

const store = useEditorStore()
const { editor, menu, panels } = useI18n()
const { activeTab, isConfigured } = useAIChat()
// In the browser the tabs live here, so the editor has a single bar. The desktop app keeps them in
// the window's title bar, which it needs anyway.
const hostsTabs = !IS_TAURI
if (hostsTabs) useTabsHost()
const styles = editorTopBar({ tabs: hostsTabs })

const { rename, editingName, startRename, commitRename } = useDocumentNameRename(store)
const nameInput = useTemplateRef<HTMLInputElement>('nameInput')
watch(nameInput, (input) => {
  if (input) void rename.focusInput(input)
})

// Without an agent the panel itself offers to connect one, so the button only opens it.
const { toggleAgent } = useLeftPanel()
</script>

<template>
  <header data-test-id="editor-top-bar" :class="styles.root()">
    <div :class="styles.start()">
      <AppMenu v-if="!hostsTabs" />
      <AppMenu v-else>
        <TabBar embedded :renaming="editingName" @rename="startRename">
          <template #rename>
            <input
              ref="nameInput"
              data-test-id="app-document-name-input"
              class="w-32 min-w-0 rounded-md border border-accent bg-input px-1 py-0.5 text-[13px] text-surface outline-none"
              :value="store.state.documentName"
              @blur="commitRename($event)"
              @keydown="rename.onKeydown"
            />
          </template>
        </TabBar>
      </AppMenu>
    </div>
    <!-- The middle says what has the canvas's place: the design's screens, or a file of the folder. -->
    <div :class="styles.middle()">
      <FolderFileBar v-if="openFolderFile" />
      <BreakpointSwitcher v-else />
    </div>
    <div :class="styles.end()">
      <IconButton
        v-if="!aiHidden"
        :label="panels.ai"
        side="bottom"
        data-test-id="editor-agent"
        :active="activeTab === 'ai'"
        :class="styles.action({ class: 'relative' })"
        @click="toggleAgent"
      >
        <icon-hugeicons-sparkle class="size-4" />
        <span
          aria-hidden="true"
          :data-connected="isConfigured || undefined"
          :class="styles.agentStatus()"
        />
      </IconButton>
      <!-- The dropdown pushes itself to the end of a tab row; here its neighbours set its place. -->
      <div v-if="!openFolderFile" class="flex shrink-0">
        <ZoomDropdown />
      </div>
      <IconButton
        :label="`${menu.toggleUI} (${appMenuShortcutLabel('toggle-ui')})`"
        side="bottom"
        data-test-id="app-toggle-ui"
        :class="styles.action()"
        @click="store.state.showUI = !store.state.showUI"
      >
        <icon-hugeicons-panel-left class="size-[15px]" />
      </IconButton>
      <IconButton
        v-if="!openFolderFile"
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
        <icon-hugeicons-play class="size-3.5" />
      </IconButton>
      <!-- Sized by its content: on its own the panel stretches to push Share to the far edge. -->
      <div class="flex shrink-0">
        <CollabPanel />
      </div>
    </div>
  </header>
</template>
