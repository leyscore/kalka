<script setup lang="ts">
import { computed, ref } from 'vue'
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

import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

const pastePosition = ref<{ x: number; y: number } | null>(null)

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

const pages = computed(() => {
  void store.state.renderVersion
  return store.graph.getPages()
})

const otherPages = computed(() =>
  pages.value.filter((p) => p.id !== store.state.currentPageId)
)

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

function onContextMenu(e: MouseEvent) {
  const canvas = (e.currentTarget as HTMLElement).querySelector('canvas')
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  pastePosition.value = store.screenToCanvas(sx, sy)
}

function doCopy() {
  document.execCommand('copy')
}

function doCut() {
  document.execCommand('cut')
}

function doPaste() {
  document.execCommand('paste')
}
</script>

<template>
  <ContextMenuRoot>
    <ContextMenuTrigger as-child @contextmenu="onContextMenu">
      <slot />
    </ContextMenuTrigger>

    <ContextMenuPortal>
      <ContextMenuContent
        class="context-menu"
        :side-offset="2"
        align="start"
      >
        <!-- Clipboard -->
        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="doCopy">
          <span>Copy</span>
          <span class="shortcut">⌘C</span>
        </ContextMenuItem>
        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="doCut">
          <span>Cut</span>
          <span class="shortcut">⌘X</span>
        </ContextMenuItem>
        <ContextMenuItem class="context-item" @select="doPaste">
          <span>Paste here</span>
          <span class="shortcut">⌘V</span>
        </ContextMenuItem>
        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="store.duplicateSelected()">
          <span>Duplicate</span>
          <span class="shortcut">⌘D</span>
        </ContextMenuItem>
        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="store.deleteSelected()">
          <span>Delete</span>
          <span class="shortcut">⌫</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="separator" />

        <!-- Z-order -->
        <ContextMenuSub v-if="otherPages.length > 0">
          <ContextMenuSubTrigger class="context-item" :disabled="!hasSelection">
            <span>Move to page</span>
            <span class="submenu-arrow">›</span>
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent class="context-menu">
              <ContextMenuItem
                v-for="page in otherPages"
                :key="page.id"
                class="context-item"
                @select="store.moveToPage(page.id)"
              >
                {{ page.name }}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>

        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="store.bringToFront()">
          <span>Bring to front</span>
          <span class="shortcut">]</span>
        </ContextMenuItem>
        <ContextMenuItem class="context-item" :disabled="!hasSelection" @select="store.sendToBack()">
          <span>Send to back</span>
          <span class="shortcut">[</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="separator" />

        <!-- Grouping -->
        <ContextMenuItem
          class="context-item"
          :disabled="multiCount < 2"
          @select="store.groupSelected()"
        >
          <span>Group</span>
          <span class="shortcut">⌘G</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isGroup"
          class="context-item"
          @select="store.ungroupSelected()"
        >
          <span>Ungroup</span>
          <span class="shortcut">⇧⌘G</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="hasSelection && multiCount === 1"
          class="context-item"
          @select="store.wrapInAutoLayout()"
        >
          <span>Add auto layout</span>
          <span class="shortcut">⇧A</span>
        </ContextMenuItem>

        <ContextMenuSeparator class="separator" />

        <!-- Components -->
        <ContextMenuItem
          class="context-item component-item"
          :disabled="!hasSelection"
          @select="store.createComponentFromSelection()"
        >
          <span>Create component</span>
          <span class="shortcut">⌥⌘K</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="canCreateComponentSet"
          class="context-item component-item"
          @select="store.createComponentSetFromComponents()"
        >
          <span>Create component set</span>
          <span class="shortcut">⇧⌘K</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isComponent"
          class="context-item component-item"
          @select="store.createInstanceFromComponent(singleNode!.id)"
        >
          <span>Create instance</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isInstance"
          class="context-item component-item"
          @select="store.goToMainComponent()"
        >
          <span>Go to main component</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-if="isInstance"
          class="context-item"
          @select="store.detachInstance()"
        >
          <span>Detach instance</span>
          <span class="shortcut">⌥⌘B</span>
        </ContextMenuItem>

        <ContextMenuSeparator v-if="hasSelection" class="separator" />

        <!-- Visibility/Lock -->
        <ContextMenuItem v-if="hasSelection" class="context-item" @select="store.toggleVisibility()">
          <span>{{ isVisible ? 'Hide' : 'Show' }}</span>
          <span class="shortcut">⇧⌘H</span>
        </ContextMenuItem>
        <ContextMenuItem v-if="hasSelection" class="context-item" @select="store.toggleLock()">
          <span>{{ isLocked ? 'Unlock' : 'Lock' }}</span>
          <span class="shortcut">⇧⌘L</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>

<style scoped>
.context-menu {
  min-width: 220px;
  padding: 4px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.4);
  z-index: 100;
  animation: contextFadeIn 0.12s ease-out;
}

@keyframes contextFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-surface);
  cursor: pointer;
  outline: none;
  user-select: none;
}

.context-item:hover,
.context-item[data-highlighted] {
  background: var(--color-hover);
}

.context-item[data-disabled] {
  color: var(--color-muted);
  cursor: default;
  pointer-events: none;
}

.context-item.component-item {
  color: #9747ff;
}

.context-item.component-item:hover,
.context-item.component-item[data-highlighted] {
  background: rgb(151 71 255 / 0.12);
}

.context-item.component-item[data-disabled] {
  color: rgb(151 71 255 / 0.4);
}

.shortcut {
  font-size: 11px;
  color: var(--color-muted);
  flex-shrink: 0;
}

.submenu-arrow {
  font-size: 14px;
  color: var(--color-muted);
  flex-shrink: 0;
}

.separator {
  height: 1px;
  margin: 4px 0;
  background: var(--color-border);
}
</style>
