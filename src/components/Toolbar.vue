<script setup lang="ts">
import { TOOLS, useEditorStore } from '../stores/editor'

const store = useEditorStore()
</script>

<template>
  <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center">
    <div class="flex gap-0.5 rounded-xl border border-border bg-panel p-1 shadow-lg">
      <button
        v-for="tool in TOOLS"
        :key="tool.key"
        class="flex size-8 cursor-pointer items-center justify-center rounded-lg border-none text-sm transition-colors"
        :class="tool.key === store.state.activeTool
          ? 'bg-accent text-white'
          : 'bg-transparent text-muted hover:bg-hover hover:text-surface'"
        :title="`${tool.label} (${tool.shortcut})`"
        @click="store.setTool(tool.key)"
      >
        <span class="leading-none">{{ tool.icon }}</span>
      </button>
    </div>
  </div>
</template>
