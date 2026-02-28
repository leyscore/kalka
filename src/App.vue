<script setup lang="ts">
import { useEventListener, useUrlSearchParams } from '@vueuse/core'

import { useKeyboard } from './composables/use-keyboard'
import { createDemoShapes } from './demo'
import { provideEditorStore } from './stores/editor'

import EditorCanvas from './components/EditorCanvas.vue'
import LayersPanel from './components/LayersPanel.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import Toolbar from './components/Toolbar.vue'

const store = provideEditorStore()
useKeyboard(store)

useEventListener(document, 'wheel', (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) e.preventDefault()
}, { passive: false })

const params = useUrlSearchParams('history')
if (!('test' in params)) {
  createDemoShapes(store)
}
</script>

<template>
  <div class="flex h-screen w-screen flex-col">
    <div class="flex flex-1 overflow-hidden">
      <LayersPanel />
      <div class="relative flex min-w-0 flex-1">
        <EditorCanvas />
        <Toolbar />
      </div>
      <PropertiesPanel />
    </div>
  </div>
</template>
