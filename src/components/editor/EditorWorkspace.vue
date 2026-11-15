<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, defineAsyncComponent, useTemplateRef } from 'vue'

import { formatShortcut, useViewportKind } from '@kalka/vue'

import { openFolderFile } from '@/app/document/folder/view'
import { provideTabEditorStore } from '@/app/editor/active-store'
import { appRuntimeConfig } from '@/app/runtime/config'
import { latch } from '@/app/shell/latch'
import {
  SIDE_PANEL_MIN_WIDTH,
  loadEditorLayout,
  saveEditorLayout,
  sidePanelSizeLimits
} from '@/app/shell/layout-storage'
import { appMenuShortcut } from '@/app/shell/menu/shortcut'
import type { Tab } from '@/app/tabs'
import CanvasSplitRoot from '@/components/canvas/CanvasSplitRoot.vue'
import ActiveRoomOverlay from '@/components/collab-room/ActiveRoomOverlay.vue'
import { useRoomActions } from '@/components/collab-room/useRoomActions'
import EditorCanvas from '@/components/EditorCanvas.vue'
import FolderFileView from '@/components/folder/FolderFileView.vue'
import LayersPanel from '@/components/LayersPanel.vue'
import MobileDrawer from '@/components/MobileDrawer.vue'
import MobileHud from '@/components/MobileHud/MobileHud.vue'
import PropertiesPanel from '@/components/PropertiesPanel.vue'
import Toolbar from '@/components/Toolbar/Toolbar.vue'
import splitterTheme from '@/theme/splitter'

import EditorTopBar from './EditorTopBar.vue'
import PanelRail from './PanelRail.vue'
import WorkspacePill from './WorkspacePill.vue'

const showChrome = appRuntimeConfig.showChrome
/**
 * The document tab this workspace edits. WorkspaceView keys the workspace by tab, so the tab and
 * its store are fixed for its lifetime, and its editor UI stays bound to that document rather
 * than following the active tab to the next document when this one closes.
 */
const { tab } = defineProps<{ tab: Tab }>()
const store = tab.store
provideTabEditorStore(store)
// Variables and their code views load the first time the dialog opens.
const VariablesDialog = defineAsyncComponent(
  () => import('@/components/variables/VariablesDialog.vue')
)
const variablesUsed = latch(() => store.state.variablesOpen)
const { isMobile } = useViewportKind()
const initialEditorLayout = loadEditorLayout()
// Side panels keep a usable width in pixels however narrow the window, while still scaling with it.
const panels = useTemplateRef<{ $el: HTMLElement }>('panels')
const { width: panelsWidth } = useElementSize(computed(() => panels.value?.$el ?? null))
const layersLimits = computed(() =>
  sidePanelSizeLimits(SIDE_PANEL_MIN_WIDTH.layers, panelsWidth.value)
)
const propertiesLimits = computed(() =>
  sidePanelSizeLimits(SIDE_PANEL_MIN_WIDTH.properties, panelsWidth.value)
)
const horizontalSplitterStyles = tv(splitterTheme)({ direction: 'horizontal', gutter: true })
/** One canvas previewing takes the whole window, in the canvas-only layout; split view keeps panels. */
const playingAlone = computed(() => store.state.play !== null && store.visiblePaneCount.value <= 1)
// Until a room's document arrives there is nothing to edit, so its screen replaces the editor.
const { pending: roomPending } = useRoomActions()
</script>

<template>
  <div v-if="roomPending" :key="'room-' + tab.id" class="relative flex flex-1 overflow-hidden">
    <ActiveRoomOverlay />
  </div>

  <div
    v-else-if="!isMobile && showChrome && store.state.showUI && !playingAlone"
    :key="tab.id"
    class="flex flex-1 flex-col gap-2 overflow-hidden px-2 pb-2 [--color-glass-border:var(--color-border)] [--color-glass:var(--color-panel)]"
  >
    <EditorTopBar />
    <div class="flex min-h-0 flex-1 gap-2">
      <PanelRail class="panel-float" />
      <SplitterGroup
        ref="panels"
        direction="horizontal"
        class="min-w-0 flex-1 overflow-hidden"
        @layout="saveEditorLayout"
      >
        <SplitterPanel
          id="layers"
          :default-size="initialEditorLayout[0]"
          :min-size="layersLimits.minSize"
          :max-size="layersLimits.maxSize"
          class="flex panel-float overflow-hidden"
        >
          <LayersPanel />
        </SplitterPanel>
        <SplitterResizeHandle
          data-test-id="left-splitter-handle"
          :class="horizontalSplitterStyles.handle()"
        >
          <div :class="horizontalSplitterStyles.divider()" />
        </SplitterResizeHandle>
        <SplitterPanel
          id="canvas"
          :default-size="initialEditorLayout[1]"
          :min-size="30"
          class="flex overflow-hidden rounded-[14px] border border-canvas-edge"
        >
          <!-- A container, so the toolbar can shorten its agent field when the canvas is narrow. -->
          <div class="@container/canvas relative flex min-w-0 flex-1">
            <CanvasSplitRoot />
            <ActiveRoomOverlay />
            <!-- A file of the folder takes the canvas's place, tools included, until it is closed. -->
            <FolderFileView />
            <Toolbar v-if="!openFolderFile" />
          </div>
        </SplitterPanel>
        <SplitterResizeHandle :class="horizontalSplitterStyles.handle()">
          <div :class="horizontalSplitterStyles.divider()" />
        </SplitterResizeHandle>
        <SplitterPanel
          id="properties"
          :default-size="initialEditorLayout[2]"
          :min-size="propertiesLimits.minSize"
          :max-size="propertiesLimits.maxSize"
          class="flex flex-col panel-float overflow-hidden"
        >
          <PropertiesPanel />
        </SplitterPanel>
      </SplitterGroup>
    </div>
  </div>

  <div
    v-else-if="isMobile && showChrome && store.state.showUI"
    :key="'mobile-' + tab.id"
    class="flex flex-1 overflow-hidden"
  >
    <div class="relative flex min-w-0 flex-1">
      <EditorCanvas />
      <ActiveRoomOverlay />
      <MobileHud />
      <Toolbar />
    </div>
    <MobileDrawer />
  </div>

  <div v-else-if="showChrome" :key="'collapsed-' + tab.id" class="flex flex-1 overflow-hidden">
    <div class="relative flex min-w-0 flex-1">
      <EditorCanvas />
      <ActiveRoomOverlay />
      <WorkspacePill
        v-if="!isMobile && playingAlone"
        mode="preview"
        :document-name="store.state.documentName"
        :shortcut="formatShortcut(appMenuShortcut('toggle-preview')) ?? ''"
        @reset="store.resetPlay()"
        @leave="store.stopPlay()"
      />
      <WorkspacePill
        v-else-if="!isMobile"
        mode="collapsed"
        :document-name="store.state.documentName"
        :shortcut="formatShortcut(appMenuShortcut('toggle-ui')) ?? ''"
        @show-ui="store.state.showUI = true"
      />
    </div>
  </div>

  <div v-else :key="'bare-' + tab.id" class="flex flex-1 overflow-hidden">
    <div class="relative flex min-w-0 flex-1">
      <EditorCanvas />
      <ActiveRoomOverlay />
    </div>
  </div>

  <VariablesDialog v-if="variablesUsed" />
</template>
