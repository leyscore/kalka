<script setup lang="ts">
import { computed, ref } from 'vue'

import type { SharedStyleType } from '@kalka/scene-graph'
import type { useSharedStyles } from '@kalka/vue'

import StyleRow from './StyleRow.vue'

/**
 * One type's styles in Local styles, by folder. A style is edited from its row, renamed,
 * duplicated, moved by dragging or from its menu, and deleted.
 */
const { type, label, styles } = defineProps<{
  type: SharedStyleType
  label: string
  styles: ReturnType<typeof useSharedStyles>
}>()
const groups = computed(() => styles.groups.value)
const { definition, rename, duplicate, remove, move } = styles
const dragged = ref<string | null>(null)
const drop = ref<{ nodeId: string; placement: 'before' | 'after' } | null>(null)
const order = computed(() => groups.value.flatMap((group) => group.styles))

/** Moves a style past its neighbour in the list, which may sit in another folder. */
function step(nodeId: string, direction: 'up' | 'down') {
  const index = order.value.findIndex((style) => style.nodeId === nodeId)
  const neighbour = order.value[direction === 'up' ? index - 1 : index + 1]
  if (index === -1 || !neighbour) return
  move(nodeId, neighbour.nodeId, direction === 'up' ? 'before' : 'after')
}

function onDragStart(event: DragEvent, nodeId: string) {
  dragged.value = nodeId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', nodeId)
  }
}

function onDragOver(event: DragEvent, nodeId: string) {
  if (!dragged.value || dragged.value === nodeId) return
  event.preventDefault()
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return
  const box = target.getBoundingClientRect()
  drop.value = { nodeId, placement: event.clientY < box.top + box.height / 2 ? 'before' : 'after' }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  if (dragged.value && drop.value) move(dragged.value, drop.value.nodeId, drop.value.placement)
  onDragEnd()
}

function onDragEnd() {
  dragged.value = null
  drop.value = null
}

function dropPlacement(nodeId: string) {
  return drop.value?.nodeId === nodeId ? drop.value.placement : undefined
}
</script>

<template>
  <div :data-local-styles="type">
    <div class="mt-1 mb-1 text-[11px] font-medium text-surface">{{ label }}</div>
    <div v-for="group in groups" :key="group.folder" role="group" :aria-label="group.folder">
      <div v-if="group.folder" class="pt-1.5 pb-0.5 text-[11px] text-muted">
        {{ group.folder }}
      </div>
      <div
        v-for="style in group.styles"
        :key="style.id"
        draggable="true"
        class="relative data-[drop=after]:shadow-[inset_0_-2px_0_var(--color-accent)] data-[drop=before]:shadow-[inset_0_2px_0_var(--color-accent)]"
        :data-drop="dropPlacement(style.nodeId)"
        @dragstart="onDragStart($event, style.nodeId)"
        @dragover="onDragOver($event, style.nodeId)"
        @drop="onDrop"
        @dragend="onDragEnd"
      >
        <StyleRow
          :type="type"
          :name="style.name"
          :label="style.label"
          :definition="definition(style.nodeId)"
          :first="order[0]?.nodeId === style.nodeId"
          :last="order[order.length - 1]?.nodeId === style.nodeId"
          @rename="rename(style.nodeId, $event)"
          @duplicate="duplicate(style.nodeId)"
          @move="step(style.nodeId, $event)"
          @remove="remove(style.nodeId)"
        />
      </div>
    </div>
  </div>
</template>
