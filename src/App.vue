<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

import { useKeyboard } from './composables/use-keyboard'
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

const isTestMode = new URLSearchParams(window.location.search).has('test')

// Demo shapes
if (!isTestMode) {
store.createShape('FRAME', 100, 80, 800, 500)
store.graph.updateNode(store.graph.getChildren(store.graph.rootId)[0].id, {
  name: 'Desktop',
  fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
  strokes: [
    {
      color: { r: 0.87, g: 0.87, b: 0.87, a: 1 },
      weight: 1,
      opacity: 1,
      visible: true,
      align: 'INSIDE'
    }
  ]
})
}

const demo = [
  {
    type: 'RECTANGLE' as const,
    name: 'Blue card',
    x: 150,
    y: 140,
    w: 240,
    h: 160,
    color: { r: 0.23, g: 0.51, b: 0.96, a: 1 },
    radius: 12
  },
  {
    type: 'ELLIPSE' as const,
    name: 'Green circle',
    x: 440,
    y: 160,
    w: 120,
    h: 120,
    color: { r: 0.13, g: 0.77, b: 0.42, a: 1 }
  },
  {
    type: 'RECTANGLE' as const,
    name: 'Orange rect',
    x: 620,
    y: 140,
    w: 200,
    h: 100,
    color: { r: 0.96, g: 0.52, b: 0.13, a: 1 },
    radius: 8
  },
  {
    type: 'RECTANGLE' as const,
    name: 'Purple pill',
    x: 150,
    y: 360,
    w: 300,
    h: 56,
    color: { r: 0.55, g: 0.36, b: 0.96, a: 1 },
    radius: 28
  }
]

if (!isTestMode)
  for (const d of demo) {
  const id = store.createShape(d.type, d.x, d.y, d.w, d.h)
  store.graph.updateNode(id, {
    name: d.name,
    cornerRadius: d.radius ?? 0,
    fills: [{ type: 'SOLID', color: d.color, opacity: 1, visible: true }]
  })
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
