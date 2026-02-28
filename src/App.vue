<script setup lang="ts">
import { useEventListener, useUrlSearchParams } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

import { useKeyboard } from './composables/use-keyboard'
import { useMenu } from './composables/use-menu'
import { createDemoShapes } from './demo'
import { provideEditorStore } from './stores/editor'

import EditorCanvas from './components/EditorCanvas.vue'
import LayersPanel from './components/LayersPanel.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import Toolbar from './components/Toolbar.vue'

const store = provideEditorStore()
useKeyboard(store)
useMenu(store)

;(window as any).__OPEN_PENCIL_STORE__ = store

useEventListener(document, 'wheel', (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) e.preventDefault()
}, { passive: false })

const params = useUrlSearchParams('history')
const showChrome = !('no-chrome' in params)
if (!('test' in params)) {
  createDemoShapes(store)
}
</script>

<template>
  <div class="flex h-screen w-screen flex-col">
    <SplitterGroup v-if="showChrome" direction="horizontal" class="flex-1 overflow-hidden" auto-save-id="editor-layout">
      <SplitterPanel :default-size="15" :min-size="10" :max-size="30" class="flex">
        <LayersPanel />
      </SplitterPanel>
      <SplitterResizeHandle class="w-0 cursor-col-resize after:absolute after:inset-y-0 after:-left-0.5 after:w-1 after:hover:bg-accent after:hover:opacity-50" />
      <SplitterPanel :default-size="70" :min-size="30" class="flex">
        <div class="relative flex min-w-0 flex-1">
          <EditorCanvas />
          <Toolbar />
        </div>
      </SplitterPanel>
      <SplitterResizeHandle class="w-0 cursor-col-resize after:absolute after:inset-y-0 after:-left-0.5 after:w-1 after:hover:bg-accent after:hover:opacity-50" />
      <SplitterPanel :default-size="15" :min-size="10" :max-size="30" class="flex">
        <PropertiesPanel />
      </SplitterPanel>
    </SplitterGroup>
    <div v-else class="flex flex-1 overflow-hidden">
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
      </div>
    </div>
  </div>
</template>
