<script setup lang="ts">
import { computed } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import { useCommentsMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { agentHasWritten } from '@/app/presence/activity'
import { presenceOf } from '@/app/presence/registry'
import { agentSkeleton } from '@/theme/collaboration/agent-skeleton'

/**
 * Where an agent's work will land, before it has anything to show: a skeleton that breathes
 * beside the page's designs, with the agent's name and what it says it is doing, from the moment
 * it starts until it touches its first layer. Display only.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const ui = agentSkeleton()
const messages = useCommentsMessages()
const placement = computed(() => drawn ?? view)

/** A new top-level frame's usual size and the gap to the designs beside it. */
const GHOST = { width: 390, height: 260, gap: 80 }

const spot = computed(() => {
  void store.state.sceneVersion
  const page = store.graph.getNode(view.currentPageId)
  let right = 0
  let top = Number.POSITIVE_INFINITY
  for (const id of page?.childIds ?? []) {
    const node = store.graph.getNode(id)
    if (!node?.visible) continue
    right = Math.max(right, node.x + node.width)
    top = Math.min(top, node.y)
  }
  return { x: right + GHOST.gap, y: Number.isFinite(top) ? top : 0 }
})

const ghosts = computed(() =>
  presenceOf(store)
    .agents.value.filter(
      (agent) =>
        agent.status !== 'idle' &&
        !agent.cursor &&
        !(agent.working?.length ?? 0) &&
        // Once it has written, its work is where it wrote, not in a frame of its own.
        !agentHasWritten(store, agent.id) &&
        (agent.pageId ?? view.currentPageId) === view.currentPageId
    )
    .map((agent, index) => {
      const { panX, panY, zoom } = placement.value
      const x = spot.value.x + index * (GHOST.width + GHOST.gap)
      return {
        id: agent.id,
        label: agent.note
          ? `${agent.name} · ${agent.note}`
          : messages.value.designing({ name: agent.name }),
        left: x * zoom + panX,
        top: spot.value.y * zoom + panY,
        width: GHOST.width * zoom,
        height: GHOST.height * zoom
      }
    })
)
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div
      v-for="ghost in ghosts"
      :key="ghost.id"
      :class="ui.root({ class: 'border-accent/60' })"
      data-slot="agent-ghost-frame"
      :style="{
        left: `${ghost.left}px`,
        top: `${ghost.top}px`,
        width: `${ghost.width}px`,
        height: `${ghost.height}px`
      }"
    >
      <div :class="ui.clip()"><div :class="ui.shine()" /></div>
      <span
        class="absolute -top-6 right-0 max-w-full truncate rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white"
      >
        {{ ghost.label }}
      </span>
    </div>
  </div>
</template>
