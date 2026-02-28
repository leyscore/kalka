<script setup lang="ts">
import { computed } from 'vue'

import ScrubInput from '../ScrubInput.vue'
import { useNodeProps } from '../../composables/use-node-props'

import type { SceneNode } from '../../engine/scene-graph'

const { store, node, updateProp, commitProp } = useNodeProps()

const CORNER_RADIUS_TYPES = new Set(['RECTANGLE', 'ROUNDED_RECTANGLE', 'FRAME', 'COMPONENT', 'INSTANCE'])

const hasCornerRadius = computed(() => node.value && CORNER_RADIUS_TYPES.has(node.value.type))

function toggleVisibility() {
  store.updateNodeWithUndo(node.value.id, { visible: !node.value.visible }, 'Toggle visibility')
  store.requestRender()
}

function toggleIndependentCorners() {
  const n = node.value
  if (!n) return

  if (n.independentCorners) {
    const uniform = n.topLeftRadius
    store.updateNodeWithUndo(
      n.id,
      {
        independentCorners: false,
        cornerRadius: uniform,
        topLeftRadius: uniform,
        topRightRadius: uniform,
        bottomRightRadius: uniform,
        bottomLeftRadius: uniform,
      } as Partial<SceneNode>,
      'Uniform corner radius',
    )
  } else {
    store.updateNodeWithUndo(
      n.id,
      {
        independentCorners: true,
        topLeftRadius: n.cornerRadius,
        topRightRadius: n.cornerRadius,
        bottomRightRadius: n.cornerRadius,
        bottomLeftRadius: n.cornerRadius,
      } as Partial<SceneNode>,
      'Independent corner radii',
    )
  }
}

function updateCornerProp(key: string, value: number) {
  store.updateNode(node.value.id, { [key]: value })
}

function commitCornerProp(key: string, value: number, previous: number) {
  store.commitNodeUpdate(node.value.id, { [key]: previous } as Partial<SceneNode>, `Change ${key}`)
}
</script>

<template>
  <div v-if="node" class="border-b border-border px-3 py-2">
    <div class="mb-1.5 flex items-center justify-between">
      <label class="text-[11px] text-muted">Appearance</label>
      <button
        class="flex cursor-pointer items-center justify-center rounded border-none bg-transparent p-0.5 text-muted hover:bg-hover hover:text-surface"
        :class="{ 'text-accent': !node.visible }"
        title="Toggle visibility"
        @click="toggleVisibility"
      >
        <icon-lucide-eye v-if="node.visible" class="size-3.5" />
        <icon-lucide-eye-off v-else class="size-3.5" />
      </button>
    </div>
    <div class="flex gap-1.5">
      <ScrubInput
        suffix="%"
        :model-value="Math.round(node.opacity * 100)"
        :min="0"
        :max="100"
        @update:model-value="updateProp('opacity', $event / 100)"
        @commit="(v: number, p: number) => commitProp('opacity', v / 100, p / 100)"
      >
        <template #icon>
          <icon-lucide-blend class="size-3" />
        </template>
      </ScrubInput>
      <template v-if="hasCornerRadius">
        <ScrubInput
          v-if="!node.independentCorners"
          :model-value="node.cornerRadius"
          :min="0"
          @update:model-value="updateProp('cornerRadius', $event)"
          @commit="(v: number, p: number) => commitProp('cornerRadius', v, p)"
        >
          <template #icon>
            <icon-lucide-radius class="size-3" />
          </template>
        </ScrubInput>
        <button
          class="flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded border border-border bg-input text-muted hover:bg-hover hover:text-surface"
          :class="{ '!border-accent !text-accent': node.independentCorners }"
          title="Independent corner radii"
          @click="toggleIndependentCorners"
        >
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 4V2.5A1.5 1.5 0 0 1 2.5 1H4" />
            <path d="M8 1h1.5A2.5 2.5 0 0 1 11 3.5V5" />
            <path d="M11 8v1a2 2 0 0 1-2 2H8" />
            <path d="M4 11H3a2 2 0 0 1-2-2V8" />
          </svg>
        </button>
      </template>
    </div>

    <div v-if="hasCornerRadius && node.independentCorners" class="mt-1.5 grid grid-cols-2 gap-1.5">
      <ScrubInput
        :model-value="node.topLeftRadius"
        :min="0"
        @update:model-value="updateCornerProp('topLeftRadius', $event)"
        @commit="(v: number, p: number) => commitCornerProp('topLeftRadius', v, p)"
      >
        <template #icon>
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 11V4a3 3 0 0 1 3-3h7" />
          </svg>
        </template>
      </ScrubInput>
      <ScrubInput
        :model-value="node.topRightRadius"
        :min="0"
        @update:model-value="updateCornerProp('topRightRadius', $event)"
        @commit="(v: number, p: number) => commitCornerProp('topRightRadius', v, p)"
      >
        <template #icon>
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M11 11V4a3 3 0 0 0-3-3H1" />
          </svg>
        </template>
      </ScrubInput>
      <ScrubInput
        :model-value="node.bottomLeftRadius"
        :min="0"
        @update:model-value="updateCornerProp('bottomLeftRadius', $event)"
        @commit="(v: number, p: number) => commitCornerProp('bottomLeftRadius', v, p)"
      >
        <template #icon>
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 1v7a3 3 0 0 0 3 3h7" />
          </svg>
        </template>
      </ScrubInput>
      <ScrubInput
        :model-value="node.bottomRightRadius"
        :min="0"
        @update:model-value="updateCornerProp('bottomRightRadius', $event)"
        @commit="(v: number, p: number) => commitCornerProp('bottomRightRadius', v, p)"
      >
        <template #icon>
          <svg class="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M11 1v7a3 3 0 0 1-3 3H1" />
          </svg>
        </template>
      </ScrubInput>
    </div>
  </div>
</template>
