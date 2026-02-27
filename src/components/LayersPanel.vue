<script setup lang="ts">
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
</script>

<template>
  <aside class="flex w-60 flex-col overflow-y-auto border-r border-border bg-panel">
    <header class="shrink-0 px-3 py-2 text-[11px] uppercase tracking-wider text-muted">Layers</header>
    <div class="flex-1 overflow-y-auto px-1">
      <button
        v-for="{ node, depth } in store.layerTree.value"
        :key="node.id"
        class="flex w-full cursor-pointer items-center gap-1 rounded border-none py-1 text-left font-[inherit] text-xs"
        :class="store.state.selectedIds.has(node.id)
          ? 'bg-accent text-white'
          : 'bg-transparent text-surface hover:bg-hover'"
        :style="{ paddingLeft: `${8 + depth * 16}px` }"
        @click="store.select([node.id])"
        @click.shift.exact="store.select([node.id], true)"
      >
        <span v-if="hasChildren(node.id)" class="w-3 shrink-0 text-center text-[10px] opacity-50">▾</span>
        <span class="w-3.5 shrink-0 text-center text-[11px] opacity-70">{{ nodeIcon(node.type) }}</span>
        <span class="truncate">{{ node.name }}</span>
      </button>
    </div>
  </aside>
</template>
