<script setup lang="ts">
import { useRafFn } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import { colorToCSS } from '@kalka/scene-graph/color'

import { useEditorStore } from '@/app/editor/active-store'
import { agentSkeletons } from '@/app/presence/canvas-scene'
import { skeletonLive, skeletonOpacity } from '@/app/presence/skeletons'
import { agentSkeleton } from '@/theme/collaboration/agent-skeleton'

/**
 * Where agents' work is loading: blocks of white glass with a shine passing over them, each
 * covering a new layer until its content fades in. Display only; the shine is a CSS animation,
 * so frames are drawn here only while a block shows or fades.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const ui = agentSkeleton()
const placement = computed(() => drawn ?? view)
const now = shallowRef(performance.now())

const skeletons = computed(() => agentSkeletons(store))
const live = computed(() => skeletons.value.some((entry) => skeletonLive(entry, now.value)))

const frames = useRafFn(
  () => {
    now.value = performance.now()
    if (!live.value) frames.pause()
  },
  { immediate: false }
)

watch(skeletons, () => {
  now.value = performance.now()
  if (live.value) frames.resume()
})

function onPage(nodeId: string): boolean {
  let node = store.graph.getNode(nodeId)
  while (node && node.type !== 'CANVAS')
    node = node.parentId ? store.graph.getNode(node.parentId) : undefined
  return node?.id === view.currentPageId
}

const blocks = computed(() => {
  void store.state.sceneVersion
  const { panX, panY, zoom } = placement.value
  return skeletons.value.flatMap((skeleton) => {
    const opacity = skeletonOpacity(skeleton, now.value)
    const node = store.graph.getNode(skeleton.nodeId)
    if (opacity <= 0 || !node || !onPage(node.id)) return []
    const origin = store.graph.getAbsolutePosition(node.id)
    return [
      {
        key: skeleton.key,
        opacity,
        borderColor: skeleton.color ? colorToCSS({ ...skeleton.color, a: 0.7 }) : undefined,
        left: origin.x * zoom + panX,
        top: origin.y * zoom + panY,
        width: node.width * zoom,
        height: node.height * zoom
      }
    ]
  })
})
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div
      v-for="block in blocks"
      :key="block.key"
      :class="ui.root()"
      data-slot="agent-skeleton"
      :style="{
        left: `${block.left}px`,
        top: `${block.top}px`,
        width: `${block.width}px`,
        height: `${block.height}px`,
        opacity: block.opacity,
        borderColor: block.borderColor
      }"
    >
      <div :class="ui.clip()"><div :class="ui.shine()" /></div>
    </div>
  </div>
</template>
