<script setup lang="ts">
import { useEventListener, useUrlSearchParams } from '@vueuse/core'

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
    <div class="flex flex-1 overflow-hidden">
      <LayersPanel v-if="showChrome" />
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
        <Toolbar v-if="showChrome" />
      </div>
      <PropertiesPanel v-if="showChrome" />
    </div>
  </div>
</template>
