<script setup lang="ts">
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuPortal
} from 'reka-ui'
import { computed } from 'vue'
import IconChevronRight from '~icons/hugeicons/chevron-right'

import { frameReview, reviewedFrameOf, setFrameReady } from '@kalka/scene-graph'
import {
  vTestId,
  useEditorCommands,
  useCommentsMessages,
  useI18n,
  useMenuModel,
  useSelectionState,
  editorCommandMetadata,
  formatShortcut
} from '@kalka/vue'
import type { EditorCommandId } from '@kalka/vue'

import { askAboutSelection } from '@/app/ai/chat/ask-selection'
import { currentPersonName, startCommentOn } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import { createCanvasMenuActions } from '@/app/editor/canvas/menu/actions'
import { useCanvasContextMenu } from '@/app/editor/canvas/menu/context'
import { canvasMenuItemClass, canvasMenuShortcutClass } from '@/app/editor/canvas/menu/model'
import { appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import AppShortcutText from '@/components/ui/menu/AppShortcutText.vue'
import { menu, useMenuUI } from '@/components/ui/menu/menu'

const store = useEditorStore()

const { editor, selectedIds, hasSelection } = useSelectionState()
const { getCommand } = useEditorCommands()
const { canvasMenu } = useMenuModel()
const { menu: t } = useI18n()

const canvasMenuActions = createCanvasMenuActions(store, selectedIds)
const { execCommand } = canvasMenuActions
const contextMenu = useCanvasContextMenu(canvasMenu, hasSelection, editor, canvasMenuActions, t)

const selectedGuide = computed(() => store.state.guides.selected)
const commentMessages = useCommentsMessages()

/** The top-level frame holding the selection, which can be marked ready for development. */
const reviewTarget = computed(() => {
  void store.state.sceneVersion
  const [first] = selectedIds.value
  const frame = first ? reviewedFrameOf(store.graph, first) : null
  if (!frame || [...selectedIds.value].some((id) => reviewedFrameOf(store.graph, id) !== frame))
    return null
  return { id: frame, ready: frameReview(store.graph, frame)?.status === 'ready' }
})

function toggleReady() {
  const target = reviewTarget.value
  if (!target) return
  setFrameReady(store.graph, target.id, target.ready ? null : currentPersonName())
  store.requestRefresh()
}

/** Opens a new comment on the first selected layer, at its top-right corner. */
function commentOnSelection() {
  const [id] = selectedIds.value
  if (id) startCommentOn(store, id)
}

function removeSelectedGuide() {
  const guide = selectedGuide.value
  if (!guide) return
  store.removeGuide(guide.ownerId, guide.guideId)
  store.setSelectedGuide(null)
}

const menuCls = useMenuUI({
  content: 'min-w-56 max-w-80',
  separator: 'my-1'
})
const componentMenu = menu({ tone: 'component' })

const cls = {
  menu: menuCls.content,
  submenu: menuCls.content.replace('min-w-56', 'min-w-0 w-max'),
  item: menuCls.item,
  component: componentMenu.item(),
  sep: menuCls.separator
}

function contextCommandTestId(id: EditorCommandId | undefined): string | undefined {
  return id ? editorCommandMetadata(id).contextTestId : undefined
}
</script>

<template>
  <!-- Closing hands focus back to the canvas; when that lands just after a quick reopen, it
       must not close the new menu. Clicks outside and Escape still close it. -->
  <ContextMenuContent :class="cls.menu" :side-offset="2" align="start" @close-auto-focus.prevent>
    <template v-if="selectedGuide">
      <ContextMenuItem data-property="guide" :class="cls.item" @select="removeSelectedGuide">
        <span>{{ t.removeGuide }}</span>
      </ContextMenuItem>
    </template>
    <template v-else>
      <ContextMenuItem
        data-test-id="context-copy"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="execCommand('copy')"
      >
        <span>{{ t.copy }}</span
        ><AppShortcutText>{{ appMenuShortcutLabel('copy') }}</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-cut"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="execCommand('cut')"
      >
        <span>{{ t.cut }}</span
        ><AppShortcutText>{{ appMenuShortcutLabel('cut') }}</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-paste"
        :class="cls.item"
        @select="execCommand('paste')"
      >
        <span>{{ t.pasteHere }}</span
        ><AppShortcutText>{{ appMenuShortcutLabel('paste') }}</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-paste-to-replace"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="canvasMenuActions.pasteToReplace"
      >
        <span>{{ t.pasteToReplace }}</span>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-duplicate"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="getCommand('selection.duplicate').run()"
      >
        <span>{{ getCommand('selection.duplicate').label }}</span
        ><AppShortcutText>{{
          formatShortcut(editorCommandMetadata('selection.duplicate').shortcut)
        }}</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-delete"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="getCommand('selection.delete').run()"
      >
        <span>{{ getCommand('selection.delete').label }}</span
        ><AppShortcutText>{{ editorCommandMetadata('selection.delete').shortcut }}</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuSeparator :class="cls.sep" />
      <ContextMenuItem
        data-test-id="context-comment"
        :class="cls.item"
        :disabled="!hasSelection"
        @select="commentOnSelection"
      >
        <span>{{ commentMessages.commentOnLayer }}</span
        ><AppShortcutText>C</AppShortcutText>
      </ContextMenuItem>
      <ContextMenuItem
        v-if="reviewTarget"
        data-test-id="context-frame-review"
        :class="cls.item"
        @select="toggleReady"
      >
        <span>{{
          reviewTarget.ready ? commentMessages.moveToDraft : commentMessages.markReady
        }}</span>
      </ContextMenuItem>
      <ContextMenuItem
        data-test-id="context-ask-agent"
        :class="cls.item"
        @select="askAboutSelection()"
      >
        <span>{{ commentMessages.askAgent }}</span
        ><AppShortcutText>/</AppShortcutText>
      </ContextMenuItem>

      <template v-for="(item, i) in contextMenu" :key="`menu-${i}`">
        <ContextMenuSeparator v-if="item.separator" :class="cls.sep" />
        <ContextMenuSub v-else-if="item.sub">
          <ContextMenuSubTrigger v-test-id="item.testId" :class="cls.item">
            <span>{{ item.label }}</span>
            <IconChevronRight class="size-3.5 text-muted" />
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent :class="cls.submenu">
              <ContextMenuItem
                v-for="(sub, j) in item.sub"
                :key="j"
                :class="cls.item"
                v-test-id="sub.separator ? undefined : sub.testId"
                :disabled="sub.separator ? true : sub.disabled"
                @select="!sub.separator && sub.action?.()"
              >
                <template v-if="!sub.separator">
                  <span class="min-w-0 flex-1 truncate">{{ sub.label }}</span>
                  <AppShortcutText v-if="sub.shortcut">{{ sub.shortcut }}</AppShortcutText>
                </template>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
        <ContextMenuItem
          v-else
          v-test-id="item.testId ?? contextCommandTestId(item.id)"
          :class="canvasMenuItemClass(item.label, cls)"
          :disabled="item.disabled"
          @select="item.action?.()"
        >
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="item.shortcut"
            class="text-[11px]"
            :class="canvasMenuShortcutClass(item.label)"
            >{{ item.shortcut }}</span
          >
        </ContextMenuItem>
      </template>
    </template>
  </ContextMenuContent>
</template>
