<script setup lang="ts">
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

function nodeIcon(type: string) {
  switch (type) {
    case 'ELLIPSE':
      return '○'
    case 'FRAME':
      return '⊞'
    case 'LINE':
      return '╱'
    case 'TEXT':
      return 'T'
    default:
      return '□'
  }
}
</script>

<template>
  <aside class="layers-panel">
    <header class="panel-section-label">Layers</header>
    <div class="layers-list">
      <button
        v-for="node in store.layerNodes.value"
        :key="node.id"
        class="layer-row"
        :class="{ selected: store.state.selectedIds.has(node.id) }"
        @click="store.select([node.id])"
      >
        <span class="layer-icon">{{ nodeIcon(node.type) }}</span>
        <span class="layer-name">{{ node.name }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.layers-panel {
  width: 240px;
  background: var(--panel-bg);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-section-label {
  padding: 6px 12px;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.layers-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;
}

.layer-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
}

.layer-row:hover {
  background: var(--hover);
}

.layer-row.selected {
  background: var(--accent);
  color: white;
}

.layer-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.7;
}

.layer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
