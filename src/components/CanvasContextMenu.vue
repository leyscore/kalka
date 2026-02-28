<script setup lang="ts">
import { computed } from 'vue'
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuPortal
} from 'reka-ui'

import { useEditorStore } from '@/stores/editor'

const store = useEditorStore()

const hasSelection = computed(() => {
  void store.state.renderVersion
  return store.state.selectedIds.size > 0
})

const singleNode = computed(() => {
  void store.state.renderVersion
  if (store.state.selectedIds.size !== 1) return null
  const id = [...store.state.selectedIds][0]
  return store.graph.getNode(id) ?? null
})

const multiCount = computed(() => {
  void store.state.renderVersion
  return store.state.selectedIds.size
})

const isInstance = computed(() => singleNode.value?.type === 'INSTANCE')
const isComponent = computed(() => singleNode.value?.type === 'COMPONENT')
const isGroup = computed(() => singleNode.value?.type === 'GROUP')

const canCreateComponentSet = computed(() => {
  void store.state.renderVersion
  if (store.state.selectedIds.size < 2) return false
  return [...store.state.selectedIds].every((id) => {
    const n = store.graph.getNode(id)
    return n?.type === 'COMPONENT'
  })
})

const otherPages = computed(() => {
  void store.state.renderVersion
  return store.graph.getPages().filter((p) => p.id !== store.state.currentPageId)
})

const isVisible = computed(() => {
  void store.state.renderVersion
  if (!singleNode.value) return true
  return singleNode.value.visible
})

const isLocked = computed(() => {
  void store.state.renderVersion
  if (!singleNode.value) return false
  return singleNode.value.locked
})

function onRightClick(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const canvas = el.querySelector('canvas')
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const { x: cx, y: cy } = store.screenToCanvas(sx, sy)

  const hit = store.graph.hitTest(cx, cy, store.state.currentPageId)
  if (hit) {
    if (!store.state.selectedIds.has(hit.id)) {
      store.select([hit.id])
    }
  } else {
    store.clearSelection()
  }
}

const itemClass =
  'flex w-full cursor-pointer select-none items-center justify-between gap-6 rounded px-2 py-1.5 text-xs text-surface outline-none data-[highlighted]:bg-hover data-[disabled]:cursor-default data-[disabled]:text-muted'
const componentItemClass =
  'flex w-full cursor-pointer select-none items-center justify-between gap-6 rounded px-2 py-1.5 text-xs text-[#9747ff] outline-none data-[highlighted]:bg-[#9747ff]/12 data-[disabled]:cursor-default data-[disabled]:text-[#9747ff]/40'
const menuClass =
  'z-50 min-w-56 rounded-lg border border-border bg-panel p-1 shadow-[0_8px_30px_rgb(0_0_0/0.4)] animate-in fade-in zoom-in-95'
</script>

<template>
  <ContextMenuRoot :modal="false">
    <ContextMenuTrigger as-child @contextmenu="onRightClick">
      <slot />
    </ContextMenuTrigger>

    <ContextMenuPortal>
      <ContextMenuContent :class="menuClass" :side-offset="2" align="start">
        <!-- Clipboard -->
        <ContextMenuItem
          :class="itemClass"
          :disabled="!hasSelection"
          @select="document.execCommand('copy')"
        >
          <span>Copy</span>
          <span class="text-[11px] text-muted">⌘C</span>
        </ContextMenuItem>
        <ContextMenuItem
          :class="itemClass"
          :disabled="!hasSelection"
          @select="document.execCommand('cut')"
        >
          <span>Cut</span>
          <span class="text-[11px] text-muted">⌘X</span>
        </ContextMenuItem>
        <ContextMenuItem :class="itemClass" @select="document.execCommand('paste')">
          <span>Paste here</span>
          <span class="text-[11px] text-muted">⌘V</span>
        </ContextMenuItem>
        <ContextMenuItem
          :class="itemClass"
          :disabled="!hasSelection"
          @select="store.duplicateSelected()"
        >
          <span>Duplicate</span>
          <span class="text-[11px] text-muted">⌘D</span>
        </ContextMenuItem>
        <ContextMenuItem
          :class="itemClass"
          :disabled="!hasSelection"
          @select="store.deleteSelected()"
        >
          <span>Delete</span>
          <span class="text-[11px] text-muted">⌫</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="my-1 h-px bg-border" />

        <!-- Move to page -->
        <ContextMenuSub v-if="otherPages.length > 0 && hasSelection">
          <ContextMenuSubTrigger :class="itemClass">
            <span>Move to page</span>
            <span class="text-sm text-muted">›</span>
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent :class="menuClass">
              <ContextMenuItem
                v-for="page in otherPages"
                :key="page.id"
                :class="itemClass"
                @select="store.moveToPage(page.id)"
              >
                {{ page.name }}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>

        <!-- Z-order -->
        <ContextMenuItem
          :class="itemClass"
          :disabled="!hasSelection"
          @select="store.bringToFront()"
        >
          <span>Bring to front</span>
          <span class="text-[11px] text-muted">]</span>
        </ContextMenuItem>
        <ContextMenuItem :class="itemClass" :disabled="!hasSelection" @select="store.sendToBack()">
          <span>Send to back</span>
          <span class="text-[11px] text-muted">[</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="my-1 h-px bg-border" />

        <!-- Grouping -->
        <ContextMenuItem
          :class="itemClass"
          :disabled="multiCount < 2"
          @select="store.groupSelected()"
        >
          <span>Group</span>
          <span class="text-[11px] text-muted">⌘G</span>
        </ContextMenuItem>
        <ContextMenuItem v-if="isGroup" :class="itemClass" @select="store.ungroupSelected()">
          <span>Ungroup</span>
          <span class="text-[11px] text-muted">⇧⌘G</span>
        </ContextMenuItem>
        <ContextMenuItem v-if="hasSelection" :class="itemClass" @select="store.wrapInAutoLayout()">
          <span>Add auto layout</span>
          <span class="text-[11px] text-muted">⇧A</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="my-1 h-px bg-border" />

        <!-- Components -->
        <ContextMenuItem
          :class="componentItemClass"
          :disabled="!hasSelection"
          @select="store.createComponentFromSelection()"
        >
          <span>Create component</span>
          <span class="text-[11px] text-[#9747ff]/60">⌥⌘K</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="canCreateComponentSet"
          :class="componentItemClass"
          @select="store.createComponentSetFromComponents()"
        >
          <span>Create component set</span>
          <span class="text-[11px] text-[#9747ff]/60">⇧⌘K</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isComponent"
          :class="componentItemClass"
          @select="store.createInstanceFromComponent(singleNode!.id)"
        >
          <span>Create instance</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isInstance"
          :class="componentItemClass"
          @select="store.goToMainComponent()"
        >
          <span>Go to main component</span>
        </ContextMenuItem>
        <ContextMenuItem v-if="isInstance" :class="itemClass" @select="store.detachInstance()">
          <span>Detach instance</span>
          <span class="text-[11px] text-muted">⌥⌘B</span>
        </ContextMenuItem>

        <template v-if="hasSelection">
          <ContextMenuSeparator class="my-1 h-px bg-border" />

          <ContextMenuItem :class="itemClass" @select="store.toggleVisibility()">
            <span>{{ isVisible ? 'Hide' : 'Show' }}</span>
            <span class="text-[11px] text-muted">⇧⌘H</span>
          </ContextMenuItem>
          <ContextMenuItem :class="itemClass" @select="store.toggleLock()">
            <span>{{ isLocked ? 'Unlock' : 'Lock' }}</span>
            <span class="text-[11px] text-muted">⇧⌘L</span>
          </ContextMenuItem>
        </template>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
