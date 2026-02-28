<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

import ColorPicker from './ColorPicker.vue'
import ScrubInput from './ScrubInput.vue'
import { useEditorStore } from '../stores/editor'

import type { Color, Fill, Stroke, LayoutSizing, LayoutAlign, LayoutCounterAlign, SceneNode } from '../engine/scene-graph'

const store = useEditorStore()

const node = computed(() => store.selectedNode.value)
const multiCount = computed(() => store.selectedNodes.value.length)
const showIndividualPadding = ref(false)
const widthSizingOpen = ref(false)
const heightSizingOpen = ref(false)
const widthDimRef = ref<HTMLElement | null>(null)
const heightDimRef = ref<HTMLElement | null>(null)

onClickOutside(widthDimRef, () => { widthSizingOpen.value = false })
onClickOutside(heightDimRef, () => { heightSizingOpen.value = false })

const isInAutoLayout = computed(() => {
  const n = node.value
  if (!n?.parentId) return false
  const parent = store.graph.getNode(n.parentId)
  return parent ? parent.layoutMode !== 'NONE' : false
})

const widthSizing = computed(() => {
  const n = node.value
  if (!n) return 'FIXED'
  if (n.layoutMode !== 'NONE') {
    return n.layoutMode === 'HORIZONTAL' ? n.primaryAxisSizing : n.counterAxisSizing
  }
  if (isInAutoLayout.value && n.layoutGrow > 0) return 'FILL'
  return 'FIXED'
})

const heightSizing = computed(() => {
  const n = node.value
  if (!n) return 'FIXED'
  if (n.layoutMode !== 'NONE') {
    return n.layoutMode === 'VERTICAL' ? n.primaryAxisSizing : n.counterAxisSizing
  }
  if (isInAutoLayout.value && n.layoutAlignSelf === 'STRETCH') return 'FILL'
  return 'FIXED'
})

function setWidthSizing(sizing: LayoutSizing) {
  const n = node.value
  if (!n) return
  if (n.layoutMode !== 'NONE') {
    if (n.layoutMode === 'HORIZONTAL') updateProp('primaryAxisSizing', sizing)
    else updateProp('counterAxisSizing', sizing)
  } else if (isInAutoLayout.value) {
    updateProp('layoutGrow', sizing === 'FILL' ? 1 : 0)
  }
  widthSizingOpen.value = false
}

function setHeightSizing(sizing: LayoutSizing) {
  const n = node.value
  if (!n) return
  if (n.layoutMode !== 'NONE') {
    if (n.layoutMode === 'VERTICAL') updateProp('primaryAxisSizing', sizing)
    else updateProp('counterAxisSizing', sizing)
  } else if (isInAutoLayout.value) {
    updateProp('layoutAlignSelf', sizing === 'FILL' ? 'STRETCH' : 'AUTO')
  }
  heightSizingOpen.value = false
}

function sizingLabel(s: string) {
  if (s === 'HUG') return 'Hug'
  if (s === 'FILL') return 'Fill'
  return 'Fixed'
}

function hasUniformPadding() {
  const n = node.value
  if (!n) return true
  return n.paddingTop === n.paddingRight &&
    n.paddingRight === n.paddingBottom &&
    n.paddingBottom === n.paddingLeft
}

function setUniformPadding(v: number) {
  if (!node.value) return
  store.updateNode(node.value.id, {
    paddingTop: v,
    paddingRight: v,
    paddingBottom: v,
    paddingLeft: v
  })
}

function commitUniformPadding(_value: number, previous: number) {
  if (!node.value) return
  store.commitNodeUpdate(node.value.id, {
    paddingTop: previous,
    paddingRight: previous,
    paddingBottom: previous,
    paddingLeft: previous
  } as unknown as Partial<SceneNode>, 'Change padding')
}

const ALIGN_GRID: Array<{ primary: LayoutAlign; counter: LayoutCounterAlign }> = [
  { primary: 'MIN', counter: 'MIN' },
  { primary: 'CENTER', counter: 'MIN' },
  { primary: 'MAX', counter: 'MIN' },
  { primary: 'MIN', counter: 'CENTER' },
  { primary: 'CENTER', counter: 'CENTER' },
  { primary: 'MAX', counter: 'CENTER' },
  { primary: 'MIN', counter: 'MAX' },
  { primary: 'CENTER', counter: 'MAX' },
  { primary: 'MAX', counter: 'MAX' }
]

function setAlignment(primary: LayoutAlign, counter: LayoutCounterAlign) {
  if (!node.value) return
  store.updateNodeWithUndo(node.value.id, {
    primaryAxisAlign: primary,
    counterAxisAlign: counter
  }, 'Change alignment')
}

function updateProp(key: string, value: number | string) {
  if (multiCount.value > 1) {
    for (const n of store.selectedNodes.value) {
      store.updateNode(n.id, { [key]: value })
    }
  } else if (node.value) {
    store.updateNode(node.value.id, { [key]: value })
  }
}

function commitProp(key: string, _value: number | string, previous: number | string) {
  if (multiCount.value > 1) {
    for (const n of store.selectedNodes.value) {
      store.commitNodeUpdate(n.id, { [key]: previous } as Partial<SceneNode>, `Change ${key}`)
    }
  } else if (node.value) {
    store.commitNodeUpdate(node.value.id, { [key]: previous } as Partial<SceneNode>, `Change ${key}`)
  }
}

function updateFillColor(index: number, color: Color) {
  if (!node.value) return
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], color }
  store.updateNodeWithUndo(node.value.id, { fills }, "Change fill")
}

function addFill() {
  if (!node.value) return
  const fill: Fill = {
    type: 'SOLID',
    color: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
    opacity: 1,
    visible: true
  }
  store.updateNodeWithUndo(node.value.id, { fills: [...node.value.fills, fill] }, "Add fill")
}

function removeFill(index: number) {
  if (!node.value) return
  const fills = node.value.fills.filter((_, i) => i !== index)
  store.updateNodeWithUndo(node.value.id, { fills }, "Change fill")
}

function toggleFillVisibility(index: number) {
  if (!node.value) return
  const fills = [...node.value.fills]
  fills[index] = { ...fills[index], visible: !fills[index].visible }
  store.updateNodeWithUndo(node.value.id, { fills }, "Change fill")
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
  store.updateNodeWithUndo(node.value.id, { strokes: [...node.value.strokes, stroke] }, "Add stroke")
}

function updateStrokeColor(index: number, color: Color) {
  if (!node.value) return
  const strokes = [...node.value.strokes]
  strokes[index] = { ...strokes[index], color }
  store.updateNodeWithUndo(node.value.id, { strokes }, "Change stroke")
}

function updateStrokeWeight(index: number, weight: number) {
  if (!node.value) return
  const strokes = [...node.value.strokes]
  strokes[index] = { ...strokes[index], weight }
  store.updateNodeWithUndo(node.value.id, { strokes }, "Change stroke")
}

function removeStroke(index: number) {
  if (!node.value) return
  const strokes = node.value.strokes.filter((_, i) => i !== index)
  store.updateNodeWithUndo(node.value.id, { strokes }, "Change stroke")
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
  <aside class="flex w-[241px] flex-col overflow-hidden border-l border-border bg-panel">
    <!-- Tabs -->
    <div class="flex h-10 shrink-0 items-center gap-1 border-b border-border px-2">
      <button class="rounded px-2.5 py-1 text-xs font-semibold text-surface">Design</button>
      <button class="rounded px-2.5 py-1 text-xs text-muted">Prototype</button>
      <span class="ml-auto cursor-pointer rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-hover">
        {{ Math.round(store.state.zoom * 100) }}%
      </span>
    </div>

    <!-- Multi-select summary -->
    <div v-if="multiCount > 1" class="flex-1 overflow-y-auto pb-4">
      <div class="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span class="text-[11px] text-muted">Mixed</span>
        <span class="text-xs font-semibold">{{ multiCount }} layers</span>
      </div>

      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Appearance</label>
        <div class="flex gap-1.5">
          <ScrubInput
            icon="⊘"
            suffix="%"
            :model-value="Math.round((store.selectedNodes.value[0]?.opacity ?? 1) * 100)"
            :min="0"
            :max="100"
            @update:model-value="updateProp('opacity', $event / 100)"
          />
        </div>
      </div>
    </div>

    <!-- Single selection -->
    <div v-else-if="node" class="flex-1 overflow-y-auto pb-4">
      <!-- Node header -->
      <div class="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span class="text-[11px] text-muted">{{ node.type }}</span>
        <span class="text-xs font-semibold">{{ node.name }}</span>
      </div>

      <!-- Position -->
      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Position</label>
        <div class="flex gap-1.5">
          <ScrubInput icon="X" :model-value="Math.round(node.x)" @update:model-value="updateProp('x', $event)" @commit="(v: number, p: number) => commitProp('x', v, p)" />
          <ScrubInput icon="Y" :model-value="Math.round(node.y)" @update:model-value="updateProp('y', $event)" @commit="(v: number, p: number) => commitProp('y', v, p)" />
        </div>
      </div>

      <!-- Rotation -->
      <div class="border-b border-border px-3 py-2">
        <div class="flex gap-1.5">
          <ScrubInput icon="R" suffix="°" :model-value="Math.round(node.rotation)" :min="-360" :max="360" @update:model-value="updateProp('rotation', $event)" @commit="(v: number, p: number) => commitProp('rotation', v, p)" />
        </div>
      </div>

      <!-- Layout / Dimensions -->
      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Layout</label>
        <div class="flex gap-1.5">
          <!-- Width -->
          <div ref="widthDimRef" class="relative flex min-w-0 flex-1 items-center gap-1">
            <ScrubInput icon="W" :model-value="Math.round(node.width)" :min="0" @update:model-value="updateProp('width', $event)" @commit="(v: number, p: number) => commitProp('width', v, p)" />
            <button
              v-if="node.layoutMode !== 'NONE' || isInAutoLayout"
              class="cursor-pointer whitespace-nowrap rounded border-none bg-transparent px-1 py-px text-[10px] text-muted hover:bg-hover hover:text-surface"
              @click="widthSizingOpen = !widthSizingOpen"
            >{{ sizingLabel(widthSizing) }}</button>
            <div v-if="widthSizingOpen" class="absolute top-full left-0 right-0 z-10 min-w-40 rounded-md border border-border bg-panel p-1 shadow-lg">
              <button
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="widthSizing === 'FIXED' ? 'text-accent' : 'text-surface'"
                @click="setWidthSizing('FIXED')"
              ><span class="w-4 text-center text-[11px] opacity-70">↔</span>Fixed width ({{ Math.round(node.width) }})</button>
              <button
                v-if="node.layoutMode !== 'NONE'"
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="widthSizing === 'HUG' ? 'text-accent' : 'text-surface'"
                @click="setWidthSizing('HUG')"
              ><span class="w-4 text-center text-[11px] opacity-70">↤↦</span>Hug contents</button>
              <button
                v-if="isInAutoLayout"
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="widthSizing === 'FILL' ? 'text-accent' : 'text-surface'"
                @click="setWidthSizing('FILL')"
              ><span class="w-4 text-center text-[11px] opacity-70">⟷</span>Fill container</button>
            </div>
          </div>
          <!-- Height -->
          <div ref="heightDimRef" class="relative flex min-w-0 flex-1 items-center gap-1">
            <ScrubInput icon="H" :model-value="Math.round(node.height)" :min="0" @update:model-value="updateProp('height', $event)" @commit="(v: number, p: number) => commitProp('height', v, p)" />
            <button
              v-if="node.layoutMode !== 'NONE' || isInAutoLayout"
              class="cursor-pointer whitespace-nowrap rounded border-none bg-transparent px-1 py-px text-[10px] text-muted hover:bg-hover hover:text-surface"
              @click="heightSizingOpen = !heightSizingOpen"
            >{{ sizingLabel(heightSizing) }}</button>
            <div v-if="heightSizingOpen" class="absolute top-full left-0 right-0 z-10 min-w-40 rounded-md border border-border bg-panel p-1 shadow-lg">
              <button
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="heightSizing === 'FIXED' ? 'text-accent' : 'text-surface'"
                @click="setHeightSizing('FIXED')"
              ><span class="w-4 text-center text-[11px] opacity-70">↕</span>Fixed height ({{ Math.round(node.height) }})</button>
              <button
                v-if="node.layoutMode !== 'NONE'"
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="heightSizing === 'HUG' ? 'text-accent' : 'text-surface'"
                @click="setHeightSizing('HUG')"
              ><span class="w-4 text-center text-[11px] opacity-70">↤↦</span>Hug contents</button>
              <button
                v-if="isInAutoLayout"
                class="flex w-full cursor-pointer items-center gap-2 rounded border-none bg-transparent px-2 py-1.5 text-left text-xs hover:bg-hover"
                :class="heightSizing === 'FILL' ? 'text-accent' : 'text-surface'"
                @click="setHeightSizing('FILL')"
              ><span class="w-4 text-center text-[11px] opacity-70">⟷</span>Fill container</button>
            </div>
          </div>
        </div>
        <!-- Corner radius -->
        <div class="mt-1.5 flex gap-1.5">
          <ScrubInput icon="↻" :model-value="node.cornerRadius" :min="0" @update:model-value="updateProp('cornerRadius', $event)" @commit="(v: number, p: number) => commitProp('cornerRadius', v, p)" />
        </div>
      </div>

      <!-- Auto Layout -->
      <div v-if="node.type === 'FRAME'" class="border-b border-border px-3 py-2">
        <div class="flex items-center justify-between">
          <label class="mb-1.5 block text-[11px] text-muted">Auto layout</label>
          <button
            v-if="node.layoutMode === 'NONE'"
            class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface"
            title="Add auto layout (Shift+A)"
            @click="store.setLayoutMode(node.id, 'VERTICAL')"
          >+</button>
          <button
            v-else
            class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface"
            title="Remove auto layout"
            @click="store.setLayoutMode(node.id, 'NONE')"
          >−</button>
        </div>

        <template v-if="node.layoutMode !== 'NONE'">
          <!-- Direction -->
          <div class="mt-1.5 flex gap-0.5">
            <button
              class="flex cursor-pointer items-center justify-center rounded border px-2 py-1"
              :class="node.layoutMode === 'VERTICAL'
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-input text-muted hover:bg-hover hover:text-surface'"
              title="Vertical layout"
              @click="store.setLayoutMode(node.id, 'VERTICAL')"
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="3" rx="0.5" fill="currentColor" /><rect x="3" y="6.5" width="10" height="3" rx="0.5" fill="currentColor" /><rect x="3" y="11" width="10" height="3" rx="0.5" fill="currentColor" /></svg>
            </button>
            <button
              class="flex cursor-pointer items-center justify-center rounded border px-2 py-1"
              :class="node.layoutMode === 'HORIZONTAL'
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-input text-muted hover:bg-hover hover:text-surface'"
              title="Horizontal layout"
              @click="store.setLayoutMode(node.id, 'HORIZONTAL')"
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="3" width="3" height="10" rx="0.5" fill="currentColor" /><rect x="6.5" y="3" width="3" height="10" rx="0.5" fill="currentColor" /><rect x="11" y="3" width="3" height="10" rx="0.5" fill="currentColor" /></svg>
            </button>
            <button
              class="flex cursor-pointer items-center justify-center rounded border px-2 py-1"
              :class="node.layoutWrap === 'WRAP'
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-input text-muted hover:bg-hover hover:text-surface'"
              title="Wrap"
              @click="updateProp('layoutWrap', node.layoutWrap === 'WRAP' ? 'NO_WRAP' : 'WRAP')"
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" rx="0.5" fill="currentColor" /><rect x="9" y="2" width="5" height="5" rx="0.5" fill="currentColor" /><rect x="2" y="9" width="5" height="5" rx="0.5" fill="currentColor" /></svg>
            </button>
          </div>

          <!-- Alignment grid + Gap -->
          <div class="mt-1.5 flex items-center gap-2">
            <div class="grid grid-cols-3 gap-0.5 rounded border border-border bg-input p-1">
              <button
                v-for="(a, i) in ALIGN_GRID"
                :key="i"
                class="flex size-3.5 cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-0 hover:bg-hover"
                @click="setAlignment(a.primary, a.counter)"
              >
                <span
                  class="rounded-full"
                  :class="node.primaryAxisAlign === a.primary && node.counterAxisAlign === a.counter
                    ? 'size-1.5 bg-accent'
                    : 'size-1 bg-muted opacity-40'"
                />
              </button>
            </div>
            <ScrubInput :model-value="node.itemSpacing" :min="0" @update:model-value="updateProp('itemSpacing', $event)" @commit="(v: number, p: number) => commitProp('itemSpacing', v, p)">
              <template #icon>
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="0" y="1" width="4" height="12" rx="0.5" fill="currentColor" opacity="0.4" /><rect x="5" y="5" width="4" height="4" rx="0.5" fill="currentColor" /><rect x="10" y="1" width="4" height="12" rx="0.5" fill="currentColor" opacity="0.4" /></svg>
              </template>
            </ScrubInput>
          </div>

          <!-- Padding -->
          <div class="mt-1.5 flex items-start gap-1">
            <template v-if="showIndividualPadding || !hasUniformPadding()">
              <div class="grid flex-1 grid-cols-2 gap-0.5">
                <div v-for="side in ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const" :key="side">
                  <input
                    type="number"
                    class="w-full rounded border border-border bg-input px-1 py-0.5 text-center text-[11px] text-surface [&::-webkit-inner-spin-button]:hidden"
                    :value="node[side]"
                    min="0"
                    @change="updateProp(side, +($event.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <ScrubInput :model-value="node.paddingTop" :min="0" @update:model-value="setUniformPadding($event)" @commit="commitUniformPadding">
                <template #icon>
                  <svg width="14" height="14" viewBox="0 0 14 14"><rect x="0" y="0" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1" /><rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" opacity="0.3" /></svg>
                </template>
              </ScrubInput>
            </template>
            <button
              class="flex shrink-0 cursor-pointer items-center justify-center rounded border p-1"
              :class="showIndividualPadding || !hasUniformPadding()
                ? 'border-accent bg-accent text-white'
                : 'border-border text-muted hover:bg-hover hover:text-surface'"
              title="Individual padding"
              @click="showIndividualPadding = !showIndividualPadding"
            >
              <svg width="14" height="14" viewBox="0 0 14 14"><rect x="0" y="0" width="14" height="4" rx="1" fill="currentColor" opacity="0.6" /><rect x="10" y="0" width="4" height="14" rx="1" fill="currentColor" opacity="0.6" /><rect x="0" y="10" width="14" height="4" rx="1" fill="currentColor" opacity="0.6" /><rect x="0" y="0" width="4" height="14" rx="1" fill="currentColor" opacity="0.6" /></svg>
            </button>
          </div>
        </template>
      </div>

      <!-- Appearance -->
      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Appearance</label>
        <div class="flex gap-1.5">
          <ScrubInput icon="⊘" suffix="%" :model-value="Math.round(node.opacity * 100)" :min="0" :max="100" @update:model-value="updateProp('opacity', $event / 100)" @commit="(v: number, p: number) => commitProp('opacity', v / 100, p / 100)" />
        </div>
      </div>

      <!-- Fill -->
      <div class="border-b border-border px-3 py-2">
        <div class="flex items-center justify-between">
          <label class="mb-1.5 block text-[11px] text-muted">Fill</label>
          <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="addFill">+</button>
        </div>
        <div v-for="(fill, i) in node.fills" :key="i" class="group flex items-center gap-1.5 py-0.5">
          <button
            class="w-4 cursor-pointer border-none bg-transparent p-0 text-center text-xs text-muted"
            :class="{ 'opacity-40': !fill.visible }"
            @click="toggleFillVisibility(i)"
          >{{ fill.visible ? '◉' : '○' }}</button>
          <ColorPicker :color="fill.color" @update="updateFillColor(i, $event)" />
          <span class="flex-1 font-mono text-xs">{{ colorHex(fill.color) }}</span>
          <button class="cursor-pointer border-none bg-transparent px-0.5 text-sm leading-none text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface" @click="removeFill(i)">×</button>
        </div>
      </div>

      <!-- Stroke -->
      <div class="border-b border-border px-3 py-2">
        <div class="flex items-center justify-between">
          <label class="mb-1.5 block text-[11px] text-muted">Stroke</label>
          <button class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface" @click="addStroke">+</button>
        </div>
        <div v-for="(stroke, i) in node.strokes" :key="i" class="group flex items-center gap-1.5 py-0.5">
          <ColorPicker :color="stroke.color" @update="updateStrokeColor(i, $event)" />
          <span class="flex-1 font-mono text-xs">{{ colorHex(stroke.color) }}</span>
          <input
            type="number"
            class="w-9 rounded border border-border bg-input px-1 py-0.5 text-center text-[11px] text-surface [&::-webkit-inner-spin-button]:hidden"
            :value="stroke.weight"
            min="0"
            @change="updateStrokeWeight(i, +($event.target as HTMLInputElement).value)"
          />
          <button class="cursor-pointer border-none bg-transparent px-0.5 text-sm leading-none text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface" @click="removeStroke(i)">×</button>
        </div>
      </div>

      <!-- Effects -->
      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Effects</label>
      </div>

      <!-- Export -->
      <div class="border-b border-border px-3 py-2">
        <label class="mb-1.5 block text-[11px] text-muted">Export</label>
      </div>
    </div>

    <div v-else class="px-3 py-4 text-xs text-muted">No selection</div>
  </aside>
</template>
