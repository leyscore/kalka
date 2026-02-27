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
  if (tool === 'TEXT') return 'text'
  return 'crosshair'
})

const editingNode = computed(() => {
  if (!store.state.editingTextId) return null
  return store.graph.getNode(store.state.editingTextId) ?? null
})

const textOverlayStyle = computed(() => {
  const node = editingNode.value
  if (!node) return null
  const abs = store.graph.getAbsolutePosition(node.id)
  return {
    left: `${abs.x * store.state.zoom + store.state.panX}px`,
    top: `${abs.y * store.state.zoom + store.state.panY}px`,
    width: `${node.width * store.state.zoom}px`,
    minHeight: `${node.height * store.state.zoom}px`,
    fontSize: `${(node.fontSize || 14) * store.state.zoom}px`,
    fontFamily: node.fontFamily || 'Inter',
    lineHeight: node.lineHeight ? `${node.lineHeight * store.state.zoom}px` : 'normal',
    letterSpacing: `${(node.letterSpacing || 0) * store.state.zoom}px`,
    textAlign: (node.textAlignHorizontal || 'LEFT').toLowerCase() as 'left' | 'center' | 'right'
  }
})

function onTextInput(e: Event) {
  const node = editingNode.value
  if (!node) return
  const text = (e.target as HTMLTextAreaElement).value
  store.graph.updateNode(node.id, { text })
  store.requestRender()
}

function onTextBlur() {
  const node = editingNode.value
  if (!node) return
  store.commitTextEdit(node.id, node.text)
}

function onTextKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    onTextBlur()
  }
  e.stopPropagation()
}
</script>

<template>
  <div class="canvas-container">
    <canvas ref="canvasRef" :style="{ cursor }" class="editor-canvas" />

    <!-- Inline text editor overlay -->
    <textarea
      v-if="editingNode"
      class="text-overlay"
      :style="textOverlayStyle!"
      :value="editingNode.text"
      @input="onTextInput"
      @blur="onTextBlur"
      @keydown="onTextKeyDown"
      autofocus
    />
  </div>
</template>

<style scoped>
.canvas-container {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.text-overlay {
  position: absolute;
  background: transparent;
  border: 1px solid var(--accent, #3b82f6);
  color: black;
  padding: 0;
  margin: 0;
  outline: none;
  resize: none;
  overflow: hidden;
  z-index: 10;
  font-weight: 400;
}
</style>
