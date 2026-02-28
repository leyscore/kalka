<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

const pages = computed(() => {
  void store.state.renderVersion
  return store.graph.getPages()
})

const editingPageId = ref<string | null>(null)
const editInput = ref<HTMLInputElement | null>(null)

function startRename(pageId: string) {
  editingPageId.value = pageId
  nextTick(() => {
    editInput.value?.select()
  })
}

function commitRename(pageId: string) {
  const value = editInput.value?.value.trim()
  if (value && value !== store.graph.getNode(pageId)?.name) {
    store.renamePage(pageId, value)
  }
  editingPageId.value = null
}

function cancelRename() {
  editingPageId.value = null
}
</script>

<template>
  <div class="shrink-0 border-b border-border">
    <div class="flex items-center justify-between px-3 py-1.5">
      <span class="text-[11px] uppercase tracking-wider text-muted">Pages</span>
      <button
        class="cursor-pointer rounded border-none bg-transparent px-1 text-base leading-none text-muted hover:bg-hover hover:text-surface"
        title="Add page"
        @click="store.addPage()"
      >+</button>
    </div>
    <div class="px-1 pb-1">
      <div v-for="pg in pages" :key="pg.id">
        <input
          v-if="editingPageId === pg.id"
          ref="editInput"
          class="w-full rounded border border-accent bg-input px-2 py-1 text-xs text-surface outline-none"
          :value="pg.name"
          @blur="commitRename(pg.id)"
          @keydown.enter="commitRename(pg.id)"
          @keydown.escape="cancelRename()"
        />
        <button
          v-else
          class="flex w-full cursor-pointer items-center gap-1.5 rounded border-none px-2 py-1 text-left text-xs"
          :class="pg.id === store.state.currentPageId ? 'bg-hover text-surface' : 'bg-transparent text-muted hover:bg-hover hover:text-surface'"
          @click="store.switchPage(pg.id)"
          @dblclick="startRename(pg.id)"
        >
          <icon-lucide-file class="size-3 shrink-0" />
          {{ pg.name }}
        </button>
      </div>
    </div>
  </div>
</template>
