<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventListener } from '@vueuse/core'

import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

function nodeIcon(type: string) {
  switch (type) {
    case 'ELLIPSE':
      return '○'
    case 'FRAME':
      return '⊞'
    case 'GROUP':
      return '⊟'
    case 'LINE':
      return '╱'
    case 'TEXT':
      return 'T'
    default:
      return '□'
  }
}

function hasChildren(nodeId: string) {
  const node = store.graph.getNode(nodeId)
  return node ? node.childIds.length > 0 : false
}

const listRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragNodeId = ref<string | null>(null)
const indicatorY = ref(-1)
const indicatorDepth = ref(0)
const dropTarget = ref<{ parentId: string; index: number } | null>(null)
const dropIntoId = ref<string | null>(null)

const tree = computed(() => store.layerTree.value)

let stopMove: (() => void) | undefined
let stopUp: (() => void) | undefined
let dragStartY = 0
let didMove = false

function onPointerDown(e: PointerEvent, nodeId: string) {
  dragStartY = e.clientY
  didMove = false
  dragNodeId.value = nodeId

  stopMove = useEventListener(document, 'pointermove', (ev: PointerEvent) => {
    if (!didMove && Math.abs(ev.clientY - dragStartY) < 4) return
    didMove = true
    dragging.value = true
    updateDropTarget(ev)
  })

  stopUp = useEventListener(document, 'pointerup', () => {
    if (didMove && dropTarget.value && dragNodeId.value) {
      const { parentId, index } = dropTarget.value
      const node = store.graph.getNode(dragNodeId.value)
      if (node && parentId !== dragNodeId.value && !store.graph.isDescendant(parentId, dragNodeId.value)) {
        store.graph.reorderChild(dragNodeId.value, parentId, index)
        store.requestRender()
      }
    } else if (!didMove && dragNodeId.value) {
      store.select([dragNodeId.value])
    }
    cleanup()
  })
}

function cleanup() {
  dragging.value = false
  dragNodeId.value = null
  indicatorY.value = -1
  dropTarget.value = null
  dropIntoId.value = null
  stopMove?.()
  stopUp?.()
}

function updateDropTarget(ev: PointerEvent) {
  const list = listRef.value
  if (!list || !dragNodeId.value) return

  const rows = list.querySelectorAll<HTMLElement>('[data-node-id]')
  const listRect = list.getBoundingClientRect()
  const mouseY = ev.clientY

  let bestInsertBefore: { parentId: string; index: number; y: number; depth: number } | null = null
  let bestInto: { nodeId: string } | null = null

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowId = row.dataset.nodeId!
    if (rowId === dragNodeId.value) continue

    const rect = row.getBoundingClientRect()
    const rowMid = rect.top + rect.height / 2
    const topZone = rect.top + rect.height * 0.25
    const bottomZone = rect.top + rect.height * 0.75

    const rowNode = store.graph.getNode(rowId)
    if (!rowNode) continue

    // Drop into a container (frame/group) — middle zone
    if (mouseY > topZone && mouseY < bottomZone && store.graph.isContainer(rowId)) {
      bestInto = { nodeId: rowId }
      bestInsertBefore = null
      break
    }

    // Drop above this row
    if (mouseY <= rowMid) {
      const parentId = rowNode.parentId ?? store.graph.rootId
      const parent = store.graph.getNode(parentId)
      if (parent) {
        const idx = parent.childIds.indexOf(rowId)
        const treeItem = tree.value.find(t => t.node.id === rowId)
        bestInsertBefore = { parentId, index: Math.max(0, idx), y: rect.top - listRect.top + list.scrollTop, depth: treeItem?.depth ?? 0 }
      }
      break
    }

    // If last row and mouse is below mid
    if (i === rows.length - 1 && mouseY > rowMid) {
      const parentId = rowNode.parentId ?? store.graph.rootId
      const parent = store.graph.getNode(parentId)
      if (parent) {
        const idx = parent.childIds.indexOf(rowId)
        const treeItem = tree.value.find(t => t.node.id === rowId)
        bestInsertBefore = { parentId, index: idx + 1, y: rect.bottom - listRect.top + list.scrollTop, depth: treeItem?.depth ?? 0 }
      }
    }
  }

  if (bestInto) {
    dropIntoId.value = bestInto.nodeId
    indicatorY.value = -1
    const container = store.graph.getNode(bestInto.nodeId)
    dropTarget.value = container ? { parentId: bestInto.nodeId, index: container.childIds.length } : null
  } else if (bestInsertBefore) {
    dropIntoId.value = null
    indicatorY.value = bestInsertBefore.y
    indicatorDepth.value = bestInsertBefore.depth
    dropTarget.value = { parentId: bestInsertBefore.parentId, index: bestInsertBefore.index }
  } else {
    dropIntoId.value = null
    indicatorY.value = -1
    dropTarget.value = null
  }
}
</script>

<template>
  <aside class="flex w-60 flex-col overflow-y-auto border-r border-border bg-panel">
    <header class="shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider text-muted">Layers</header>
    <div ref="listRef" class="relative flex-1 overflow-y-auto px-1">
      <button
        v-for="{ node, depth } in tree"
        :key="node.id"
        :data-node-id="node.id"
        class="flex w-full cursor-pointer items-center gap-1 rounded border-none py-1 text-left text-xs"
        :class="[
          store.state.selectedIds.has(node.id)
            ? 'bg-accent text-white'
            : 'bg-transparent text-surface hover:bg-hover',
          dragging && dragNodeId === node.id ? 'opacity-30' : '',
          dropIntoId === node.id ? 'ring-2 ring-accent ring-inset' : ''
        ]"
        :style="{ paddingLeft: `${8 + depth * 16}px` }"
        @pointerdown.prevent="onPointerDown($event, node.id)"
      >
        <span v-if="hasChildren(node.id)" class="w-3 shrink-0 text-center text-[10px] opacity-50">▾</span>
        <span class="w-3.5 shrink-0 text-center text-[11px] opacity-70">{{ nodeIcon(node.type) }}</span>
        <span class="truncate">{{ node.name }}</span>
      </button>

      <!-- Drop indicator line -->
      <div
        v-if="dragging && indicatorY >= 0"
        class="pointer-events-none absolute right-1 left-1 h-0.5 bg-accent"
        :style="{ top: `${indicatorY}px`, marginLeft: `${indicatorDepth * 16}px` }"
      />
    </div>
  </aside>
</template>
