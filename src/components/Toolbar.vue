<script setup lang="ts">
import { TOOLS, useEditorStore } from '../stores/editor'

const store = useEditorStore()
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-tools">
      <button
        v-for="tool in TOOLS"
        :key="tool.key"
        class="tool-button"
        :class="{ active: store.state.activeTool === tool.key }"
        :title="`${tool.label} (${tool.shortcut})`"
        @click="store.setTool(tool.key)"
      >
        <span class="tool-icon">{{ tool.icon }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  z-index: 10;
}

.toolbar-tools {
  display: flex;
  gap: 2px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.tool-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition:
    background 0.1s,
    color 0.1s;
}

.tool-button:hover {
  background: var(--hover);
  color: var(--text);
}

.tool-button.active {
  background: var(--accent);
  color: white;
}

.tool-icon {
  line-height: 1;
}
</style>
