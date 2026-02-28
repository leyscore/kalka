<script setup lang="ts">
import IconMousePointer from '~icons/lucide/mouse-pointer'
import IconFrame from '~icons/lucide/frame'
import IconSquare from '~icons/lucide/square'
import IconPenTool from '~icons/lucide/pen-tool'
import IconType from '~icons/lucide/type'
import IconHand from '~icons/lucide/hand'

import { TOOLS, useEditorStore } from '../stores/editor'

import type { Tool } from '../stores/editor'

const store = useEditorStore()

const toolIcons: Record<Tool, typeof IconSquare> = {
  SELECT: IconMousePointer,
  FRAME: IconFrame,
  RECTANGLE: IconSquare,
  ELLIPSE: IconSquare,
  LINE: IconSquare,
  PEN: IconPenTool,
  TEXT: IconType,
  HAND: IconHand
}
</script>

<template>
  <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center">
    <div class="flex gap-0.5 rounded-xl border border-border bg-panel p-1 shadow-lg">
      <button
        v-for="tool in TOOLS"
        :key="tool.key"
        class="flex size-8 cursor-pointer items-center justify-center rounded-lg border-none transition-colors"
        :class="tool.key === store.state.activeTool
          ? 'bg-accent text-white'
          : 'bg-transparent text-muted hover:bg-hover hover:text-surface'"
        :title="`${tool.label} (${tool.shortcut})`"
        @click="store.setTool(tool.key)"
      >
        <component :is="toolIcons[tool.key]" class="size-4" />
      </button>
    </div>
  </div>
</template>
