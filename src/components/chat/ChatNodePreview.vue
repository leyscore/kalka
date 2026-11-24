<script setup lang="ts">
import { useObjectUrl } from '@vueuse/core'
import { shallowRef, watch } from 'vue'

import type { Editor } from '@kalka/core/editor'
import { renderNodesToImage } from '@kalka/core/io'
import { loadCanvasKit } from '@kalka/vue'

import type { ReferencedNode } from '@/app/ai/chat/context'

const {
  editor,
  node,
  size = 'md'
} = defineProps<{ editor: Editor; node: ReferencedNode; size?: 'sm' | 'md' }>()
const blob = shallowRef<Blob | null>(null)
const previewURL = useObjectUrl(blob)
let requestId = 0

watch(
  () => node.id,
  async () => {
    const request = ++requestId
    // The thumbnail is drawn with Skia, loaded the first time a preview needs it.
    const renderer = await loadCanvasKit(editor)
    if (request !== requestId) return
    const liveNode = editor.graph.getNode(node.id)
    if (!renderer || !liveNode) return
    const maxDimension = Math.max(liveNode.width, liveNode.height, 1)
    const data = await renderNodesToImage(
      renderer.ck,
      renderer,
      editor.graph,
      editor.state.currentPageId,
      [node.id],
      { scale: 40 / maxDimension, format: 'PNG' }
    )
    if (request === requestId) blob.value = data ? new Blob([data], { type: 'image/png' }) : null
  },
  { immediate: true }
)
</script>

<template>
  <img
    v-if="previewURL"
    :src="previewURL"
    alt=""
    class="shrink-0 border border-hairline bg-panel-field object-contain"
    :class="size === 'sm' ? 'size-4 rounded-[4px]' : 'size-10 rounded-[7px]'"
  />
  <div
    v-else
    class="flex shrink-0 items-center justify-center border border-hairline bg-panel-field"
    :class="size === 'sm' ? 'size-4 rounded-[4px]' : 'size-10 rounded-[7px]'"
  >
    <icon-hugeicons-box
      class="text-muted"
      :class="size === 'sm' ? 'size-2.5' : 'size-4'"
      aria-hidden="true"
    />
  </div>
</template>
