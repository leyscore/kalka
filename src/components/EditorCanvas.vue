<script setup lang="ts">
import { ref, computed } from 'vue'

import { useCanvas } from '../composables/use-canvas'
import { useCanvasInput } from '../composables/use-canvas-input'
import { useEditorStore } from '../stores/editor'
import CanvasContextMenu from './CanvasContextMenu.vue'

const store = useEditorStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { hitTestSectionTitle } = useCanvas(canvasRef, store)
const { cursorOverride } = useCanvasInput(canvasRef, store, hitTestSectionTitle)

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
    fontWeight: node.fontWeight || 400,
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
  <CanvasContextMenu v-slot="{ onContextMenu }">
  <div class="relative flex-1 min-w-0 min-h-0 overflow-hidden" @contextmenu="onContextMenu">
    <canvas ref="canvasRef" :style="{ cursor }" class="block size-full" />
    <textarea
      v-if="editingNode"
      class="absolute z-10 resize-none overflow-hidden border border-accent bg-transparent p-0 text-black outline-none"
      :style="textOverlayStyle!"
      :value="editingNode.text"
      @input="onTextInput"
      @blur="onTextBlur"
      @keydown="onTextKeyDown"
      autofocus
    />
  </div>
  </CanvasContextMenu>
</template>
