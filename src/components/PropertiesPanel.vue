<script setup lang="ts">
import { computed } from 'vue'

import ColorPicker from './ColorPicker.vue'
import { useEditorStore } from '../stores/editor'

import type { Color, Fill, Stroke } from '../engine/scene-graph'

const store = useEditorStore()

const node = computed(() => store.selectedNode.value)
const multiCount = computed(() => store.selectedNodes.value.length)

function updateProp(key: string, value: number | string) {
  if (multiCount.value > 1) {
    for (const n of store.selectedNodes.value) {
      store.updateNode(n.id, { [key]: value })
    }
  } else if (node.value) {
    store.updateNode(node.value.id, { [key]: value })
  }
}

function updateFillColor(index: number, color: Color) {
  if (!node.value) return
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], color }
  store.updateNode(node.value.id, { fills })
}

function addFill() {
  if (!node.value) return
  const fill: Fill = {
    type: 'SOLID',
    color: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
    opacity: 1,
    visible: true
  }
  store.updateNode(node.value.id, { fills: [...node.value.fills, fill] })
}

function removeFill(index: number) {
  if (!node.value) return
  const fills = node.value.fills.filter((_, i) => i !== index)
  store.updateNode(node.value.id, { fills })
}

function toggleFillVisibility(index: number) {
  if (!node.value) return
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], visible: !fills[index].visible }
  store.updateNode(node.value.id, { fills })
}

function addStroke() {
  if (!node.value) return
  const stroke: Stroke = {
    color: { r: 0, g: 0, b: 0, a: 1 },
    weight: 1,
    opacity: 1,
    visible: true,
    align: 'CENTER'
  }
  store.updateNode(node.value.id, { strokes: [...node.value.strokes, stroke] })
}

function updateStrokeColor(index: number, color: Color) {
  if (!node.value) return
  const strokes = [...node.value.strokes]
  strokes[index] = { ...strokes[index], color }
  store.updateNode(node.value.id, { strokes })
}

function updateStrokeWeight(index: number, weight: number) {
  if (!node.value) return
  const strokes = [...node.value.strokes]
  strokes[index] = { ...strokes[index], weight }
  store.updateNode(node.value.id, { strokes })
}

function removeStroke(index: number) {
  if (!node.value) return
  const strokes = node.value.strokes.filter((_, i) => i !== index)
  store.updateNode(node.value.id, { strokes })
}

function colorHex(c: Color) {
  const hex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(c.r)}${hex(c.g)}${hex(c.b)}`
}
</script>

<template>
  <aside class="properties-panel">
    <div class="panel-tabs">
      <button class="tab active">Design</button>
      <button class="tab">Prototype</button>
      <span class="zoom-display">{{ Math.round(store.state.zoom * 100) }}%</span>
    </div>

    <!-- Multi-select summary -->
    <div v-if="multiCount > 1" class="panel-scroll">
      <div class="section node-header">
        <span class="node-type">Mixed</span>
        <span class="node-name">{{ multiCount }} layers</span>
      </div>

      <div class="section">
        <label class="section-label">Appearance</label>
        <div class="input-row">
          <label class="prop-input full">
            <span class="prop-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              :value="store.selectedNodes.value[0]?.opacity * 100"
              @input="updateProp('opacity', +($event.target as HTMLInputElement).value / 100)"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Single selection -->
    <div v-else-if="node" class="panel-scroll">
      <div class="section node-header">
        <span class="node-type">{{ node.type }}</span>
        <span class="node-name">{{ node.name }}</span>
      </div>

      <!-- Position -->
      <div class="section">
        <label class="section-label">Position</label>
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">X</span>
            <input
              type="number"
              :value="Math.round(node.x)"
              @change="updateProp('x', +($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="prop-input">
            <span class="prop-label">Y</span>
            <input
              type="number"
              :value="Math.round(node.y)"
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
              :value="Math.round(node.rotation)"
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
              :value="Math.round(node.width)"
              @change="updateProp('width', +($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="prop-input">
            <span class="prop-label">H</span>
            <input
              type="number"
              :value="Math.round(node.height)"
              @change="updateProp('height', +($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
        <div class="input-row">
          <label class="prop-input">
            <span class="prop-label">↻</span>
            <input
              type="number"
              :value="node.cornerRadius"
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
              :value="node.opacity * 100"
              @input="updateProp('opacity', +($event.target as HTMLInputElement).value / 100)"
            />
            <span class="prop-value">{{ Math.round(node.opacity * 100) }}%</span>
          </label>
        </div>
      </div>

      <!-- Fill -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Fill</label>
          <button class="section-add" @click="addFill">+</button>
        </div>
        <div v-for="(fill, i) in node.fills" :key="i" class="fill-row">
          <button
            class="visibility-toggle"
            :class="{ hidden: !fill.visible }"
            @click="toggleFillVisibility(i)"
          >
            {{ fill.visible ? '◉' : '○' }}
          </button>
          <ColorPicker :color="fill.color" @update="updateFillColor(i, $event)" />
          <span class="color-hex">{{ colorHex(fill.color) }}</span>
          <button class="remove-btn" @click="removeFill(i)">×</button>
        </div>
      </div>

      <!-- Stroke -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Stroke</label>
          <button class="section-add" @click="addStroke">+</button>
        </div>
        <div v-for="(stroke, i) in node.strokes" :key="i" class="fill-row">
          <ColorPicker :color="stroke.color" @update="updateStrokeColor(i, $event)" />
          <span class="color-hex">{{ colorHex(stroke.color) }}</span>
          <input
            type="number"
            class="stroke-weight"
            :value="stroke.weight"
            min="0"
            @change="updateStrokeWeight(i, +($event.target as HTMLInputElement).value)"
          />
          <button class="remove-btn" @click="removeStroke(i)">×</button>
        </div>
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.section-add {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  border-radius: 4px;
}

.section-add:hover {
  background: var(--hover);
  color: var(--text);
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
  gap: 6px;
  padding: 3px 0;
}

.visibility-toggle {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  width: 16px;
  text-align: center;
}

.visibility-toggle.hidden {
  opacity: 0.4;
}

.color-hex {
  font-size: 12px;
  font-family: monospace;
  flex: 1;
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.1s;
}

.fill-row:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--text);
}

.stroke-weight {
  width: 36px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  padding: 2px 4px;
  font: inherit;
  font-size: 11px;
  text-align: center;
}

.stroke-weight::-webkit-inner-spin-button {
  display: none;
}
</style>
