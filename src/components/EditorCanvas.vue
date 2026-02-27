<script setup lang="ts">
import { ref, computed } from 'vue'

import { useCanvas } from '../composables/use-canvas'
import { useCanvasInput } from '../composables/use-canvas-input'
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

useCanvas(canvasRef, store)
const { cursorOverride } = useCanvasInput(canvasRef, store)

const cursor = computed(() => {
  if (cursorOverride.value) return cursorOverride.value
  const tool = store.state.activeTool
  if (tool === 'HAND') return 'grab'
  if (tool === 'SELECT') return 'default'
  return 'crosshair'
})
</script>

<template>
  <canvas ref="canvasRef" :style="{ cursor }" class="editor-canvas" />
</template>

<style scoped>
.editor-canvas {
  flex: 1;
  display: block;
  min-width: 0;
  min-height: 0;
}
</style>
