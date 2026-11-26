<script setup lang="ts">
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger
} from 'reka-ui'

import { useI18n } from '@kalka/vue'

import { otherEditorWindows, type EditorWindowSummary } from '@/app/shell/editor-windows/list'
import { moveTabWithFeedback } from '@/app/shell/editor-windows/move'
import { useMenuUI } from '@/components/ui/menu/menu'
import { IS_TAURI } from '@/constants'

/** A design tab's context menu in the desktop app: move it to a new window or another one. */
const { tabId } = defineProps<{ tabId: string }>()
defineSlots<{ default: () => unknown }>()

const { menu } = useI18n()
const menuCls = useMenuUI()

/** A window goes by the document it shows, as the Window menu checks it. */
function windowName(window: EditorWindowSummary): string {
  return (
    window.documents.find((document) => document.active)?.name ??
    window.documents[0]?.name ??
    window.label
  )
}
</script>

<template>
  <ContextMenuRoot v-if="IS_TAURI" :modal="false">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent :class="menuCls.content" :side-offset="2" align="start">
        <ContextMenuItem
          data-test-id="tab-move-new-window"
          :class="menuCls.item"
          @select="moveTabWithFeedback(tabId, null)"
        >
          <span>{{ menu.moveTabToNewWindow }}</span>
        </ContextMenuItem>
        <template v-if="otherEditorWindows.length > 0">
          <ContextMenuSeparator :class="menuCls.separator" />
          <ContextMenuLabel :class="menuCls.label">{{ menu.moveTabToWindow }}</ContextMenuLabel>
          <ContextMenuItem
            v-for="window in otherEditorWindows"
            :key="window.label"
            data-test-id="tab-move-window"
            :class="menuCls.item"
            @select="moveTabWithFeedback(tabId, window.label)"
          >
            <span>{{ windowName(window) }}</span>
          </ContextMenuItem>
        </template>
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
  <slot v-else />
</template>
