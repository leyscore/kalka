<script setup lang="ts">
import { useRafFn } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import type { Color } from '@kalka/scene-graph/primitives'

import { useEditorStore } from '@/app/editor/active-store'
import { agentSkeletons } from '@/app/presence/canvas-scene'
import { backdropTone, skeletonLive } from '@/app/presence/skeletons'

import AgentSkyBlock from './AgentSkyBlock.vue'

/**
 * Where agents' work is loading: clouds of pixel dots, each over a new layer until its content
 * fades in, in Kalka blue on a light backdrop and white on the dark canvas. Display only; the
 * twinkle is a CSS animation, so frames are counted here only while a cloud shows or leaves.
 */
const { view, drawn, canvasColor } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
  /** The canvas behind the page's layers, for clouds that sit straight on it. */
  canvasColor: Color
}>()

const store = useEditorStore()
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

const clouds = computed(() => {
  void store.state.sceneVersion
  const { panX, panY, zoom } = placement.value
  return skeletons.value.flatMap((skeleton) => {
    const node = store.graph.getNode(skeleton.nodeId)
    if (now.value < skeleton.from || !skeletonLive(skeleton, now.value)) return []
    if (!node || !onPage(node.id)) return []
    const origin = store.graph.getAbsolutePosition(node.id)
    return [
      {
        key: skeleton.key,
        seed: skeleton.nodeId,
        tone: backdropTone(store.graph, node.id, canvasColor),
        leaving: now.value >= skeleton.until,
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
    <AgentSkyBlock
      v-for="cloud in clouds"
      :key="cloud.key"
      :style="{ left: `${cloud.left}px`, top: `${cloud.top}px` }"
      :width="cloud.width"
      :height="cloud.height"
      :tone="cloud.tone"
      :seed="cloud.seed"
      :leaving="cloud.leaving"
    />
  </div>
</template>
