<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useFloating, offset, flip, shift, type VirtualElement } from '@floating-ui/vue'

import { useEditorStore } from '../stores/editor'

const store = useEditorStore()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const submenuOpen = ref<string | null>(null)

const virtualAnchor = ref<VirtualElement>({
  getBoundingClientRect: () => new DOMRect(0, 0, 0, 0)
})

const { floatingStyles } = useFloating(virtualAnchor, menuRef, {
  placement: 'right-start',
  middleware: [offset(2), flip(), shift({ padding: 8 })]
})

onClickOutside(menuRef, () => close(), { ignore: ['.context-submenu'] })
onKeyStroke('Escape', () => close())

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

function close() {
  open.value = false
  submenuOpen.value = null
}

function exec(fn: () => void) {
  fn()
  close()
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()

  const canvas = (e.currentTarget as HTMLElement).querySelector('canvas')
  if (canvas) {
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

  virtualAnchor.value = {
    getBoundingClientRect: () => new DOMRect(e.clientX, e.clientY, 0, 0)
  }

  open.value = true
  nextTick(() => menuRef.value?.focus())
}

watch(open, (val) => {
  if (!val) submenuOpen.value = null
})
</script>

<template>
  <div @contextmenu="onContextMenu">
    <slot />
  </div>

  <Teleport to="body">
    <div
      v-if="open"
      ref="menuRef"
      role="menu"
      tabindex="-1"
      class="context-menu"
      :style="floatingStyles"
      @keydown.escape="close"
    >
      <!-- Clipboard -->
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => document.execCommand('copy'))">
        <span>Copy</span><span class="shortcut">⌘C</span>
      </button>
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => document.execCommand('cut'))">
        <span>Cut</span><span class="shortcut">⌘X</span>
      </button>
      <button role="menuitem" @click="exec(() => document.execCommand('paste'))">
        <span>Paste here</span><span class="shortcut">⌘V</span>
      </button>
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => store.duplicateSelected())">
        <span>Duplicate</span><span class="shortcut">⌘D</span>
      </button>
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => store.deleteSelected())">
        <span>Delete</span><span class="shortcut">⌫</span>
      </button>

      <div class="separator" />

      <!-- Move to page -->
      <div
        v-if="otherPages.length > 0 && hasSelection"
        class="submenu-trigger"
        @mouseenter="submenuOpen = 'move-page'"
        @mouseleave="submenuOpen = null"
      >
        <button role="menuitem">
          <span>Move to page</span><span class="shortcut">›</span>
        </button>
        <div v-if="submenuOpen === 'move-page'" role="menu" class="context-submenu">
          <button
            v-for="page in otherPages"
            :key="page.id"
            role="menuitem"
            @click="exec(() => store.moveToPage(page.id))"
          >
            {{ page.name }}
          </button>
        </div>
      </div>

      <!-- Z-order -->
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => store.bringToFront())">
        <span>Bring to front</span><span class="shortcut">]</span>
      </button>
      <button role="menuitem" :disabled="!hasSelection" @click="exec(() => store.sendToBack())">
        <span>Send to back</span><span class="shortcut">[</span>
      </button>

      <div class="separator" />

      <!-- Grouping -->
      <button role="menuitem" :disabled="multiCount < 2" @click="exec(() => store.groupSelected())">
        <span>Group</span><span class="shortcut">⌘G</span>
      </button>
      <button v-if="isGroup" role="menuitem" @click="exec(() => store.ungroupSelected())">
        <span>Ungroup</span><span class="shortcut">⇧⌘G</span>
      </button>
      <button v-if="hasSelection" role="menuitem" @click="exec(() => store.wrapInAutoLayout())">
        <span>Add auto layout</span><span class="shortcut">⇧A</span>
      </button>

      <div class="separator" />

      <!-- Components -->
      <button class="component-item" role="menuitem" :disabled="!hasSelection" @click="exec(() => store.createComponentFromSelection())">
        <span>Create component</span><span class="shortcut">⌥⌘K</span>
      </button>
      <button v-if="canCreateComponentSet" class="component-item" role="menuitem" @click="exec(() => store.createComponentSetFromComponents())">
        <span>Create component set</span><span class="shortcut">⇧⌘K</span>
      </button>
      <button v-if="isComponent" class="component-item" role="menuitem" @click="exec(() => store.createInstanceFromComponent(singleNode!.id))">
        <span>Create instance</span>
      </button>
      <button v-if="isInstance" class="component-item" role="menuitem" @click="exec(() => store.goToMainComponent())">
        <span>Go to main component</span>
      </button>
      <button v-if="isInstance" role="menuitem" @click="exec(() => store.detachInstance())">
        <span>Detach instance</span><span class="shortcut">⌥⌘B</span>
      </button>

      <template v-if="hasSelection">
        <div class="separator" />

        <button role="menuitem" @click="exec(() => store.toggleVisibility())">
          <span>{{ isVisible ? 'Hide' : 'Show' }}</span><span class="shortcut">⇧⌘H</span>
        </button>
        <button role="menuitem" @click="exec(() => store.toggleLock())">
          <span>{{ isLocked ? 'Unlock' : 'Lock' }}</span><span class="shortcut">⇧⌘L</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  min-width: 220px;
  padding: 4px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.4);
  z-index: 100;
  outline: none;
  animation: contextFadeIn 0.12s ease-out;
}

@keyframes contextFadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.context-menu > button,
.submenu-trigger > button,
.context-submenu > button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  color: var(--color-surface);
  background: transparent;
  cursor: pointer;
  outline: none;
  user-select: none;
  text-align: left;
}

.context-menu > button:hover:not(:disabled),
.submenu-trigger > button:hover,
.context-submenu > button:hover {
  background: var(--color-hover);
}

.context-menu > button:disabled {
  color: var(--color-muted);
  cursor: default;
}

.context-menu > button.component-item {
  color: #9747ff;
}

.context-menu > button.component-item:hover:not(:disabled) {
  background: rgb(151 71 255 / 0.12);
}

.context-menu > button.component-item:disabled {
  color: rgb(151 71 255 / 0.4);
}

.shortcut {
  font-size: 11px;
  color: var(--color-muted);
  flex-shrink: 0;
}

.separator {
  height: 1px;
  margin: 4px 0;
  background: var(--color-border);
}

.submenu-trigger {
  position: relative;
}

.context-submenu {
  position: absolute;
  left: 100%;
  top: -4px;
  min-width: 160px;
  padding: 4px;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 0.4);
}
</style>
