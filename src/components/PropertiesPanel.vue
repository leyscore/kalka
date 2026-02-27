<script setup lang="ts">
import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

function updateProp(key: string, value: number) {
  const node = store.selectedNode.value
  if (!node) return
  store.updateNode(node.id, { [key]: value })
}

function colorHex(c: { r: number; g: number; b: number }) {
  const hex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
}

function colorRgba(c: { r: number; g: number; b: number; a: number }) {
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`
}
</script>

<template>
  <aside class="properties-panel">
    <!-- Tabs -->
    <div class="panel-tabs">
      <button class="tab active">Design</button>
      <button class="tab">Prototype</button>
      <span class="zoom-display">{{ Math.round(store.state.zoom * 100) }}%</span>
    </div>

    <div v-if="store.selectedNode.value" class="panel-scroll">
      <!-- Node header -->
      <div class="section node-header">
        <span class="node-type">{{ store.selectedNode.value.type }}</span>
        <span class="node-name">{{ store.selectedNode.value.name }}</span>
      </div>

      <!-- Position -->
      <div class="section">
        <label class="section-label">Position</label>
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">X</span>
            <input
              type="number"
              :value="Math.round(store.selectedNode.value.x)"
              @change="updateProp('x', +($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="prop-input">
            <span class="prop-label">Y</span>
            <input
              type="number"
              :value="Math.round(store.selectedNode.value.y)"
              @change="updateProp('y', +($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </div>

      <!-- Rotation -->
      <div class="section">
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">R</span>
            <input
              type="number"
              :value="Math.round(store.selectedNode.value.rotation)"
              @change="updateProp('rotation', +($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </div>

      <!-- Dimensions -->
      <div class="section">
        <label class="section-label">Layout</label>
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">W</span>
            <input
              type="number"
              :value="Math.round(store.selectedNode.value.width)"
              @change="updateProp('width', +($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="prop-input">
            <span class="prop-label">H</span>
            <input
              type="number"
              :value="Math.round(store.selectedNode.value.height)"
              @change="updateProp('height', +($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">↻</span>
            <input
              type="number"
              :value="store.selectedNode.value.cornerRadius"
              @change="updateProp('cornerRadius', +($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </div>

      <!-- Appearance -->
      <div class="section">
        <label class="section-label">Appearance</label>
        <div class="input-row">
          <label class="prop-input full">
            <span class="prop-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              :value="store.selectedNode.value.opacity * 100"
              @input="updateProp('opacity', +($event.target as HTMLInputElement).value / 100)"
            />
            <span class="prop-value"
              >{{ Math.round(store.selectedNode.value.opacity * 100) }}%</span
            >
          </label>
        </div>
      </div>

      <!-- Fill -->
      <div class="section">
        <label class="section-label">Fill</label>
        <div v-for="(fill, i) in store.selectedNode.value.fills" :key="i" class="fill-row">
          <div class="color-swatch" :style="{ background: colorRgba(fill.color) }" />
          <span class="color-hex">{{ colorHex(fill.color) }}</span>
        </div>
      </div>

      <!-- Stroke -->
      <div class="section">
        <label class="section-label">Stroke</label>
      </div>

      <!-- Effects -->
      <div class="section">
        <label class="section-label">Effects</label>
      </div>

      <!-- Export -->
      <div class="section">
        <label class="section-label">Export</label>
      </div>
    </div>

    <div v-else class="panel-empty">No selection</div>
  </aside>
</template>

<style scoped>
.properties-panel {
  width: 241px;
  background: var(--panel-bg);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tab {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}

.tab.active {
  color: var(--text);
  font-weight: 600;
}

.zoom-display {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.zoom-display:hover {
  background: var(--hover);
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.panel-empty {
  padding: 16px 12px;
  color: var(--text-muted);
  font-size: 12px;
}

.section {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.section-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-type {
  font-size: 11px;
  color: var(--text-muted);
}

.node-name {
  font-size: 12px;
  font-weight: 600;
}

.input-row {
  display: flex;
  gap: 6px;
}

.prop-input {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.prop-input.full {
  flex-basis: 100%;
}

.prop-label {
  font-size: 11px;
  color: var(--text-muted);
  width: 14px;
  flex-shrink: 0;
}

.prop-input input[type='number'] {
  flex: 1;
  min-width: 0;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 3px 6px;
  font: inherit;
  font-size: 12px;
}

.prop-input input[type='range'] {
  flex: 1;
  min-width: 0;
}

.prop-value {
  font-size: 11px;
  color: var(--text-muted);
  width: 32px;
  text-align: right;
}

.fill-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.color-hex {
  font-size: 12px;
  font-family: monospace;
}
</style>
