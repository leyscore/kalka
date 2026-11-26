<script setup lang="ts">
import { computed } from 'vue'

import type { EditorToolDef } from '@kalka/core/editor'
import {
  formatShortcut,
  ToolbarRoot,
  useEditorCommands,
  useI18n,
  useToolbarState,
  useViewportKind
} from '@kalka/vue'
import type { Tool } from '@kalka/vue'

import { commentPlacing, mayComment, stopCommentPlacing } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import { toolIcons } from '@/app/editor/icons'
import { useActionToast } from '@/app/shell/toast/action'
import CommentToolButton from '@/components/comments/CommentToolButton.vue'
import InsertIconButton from '@/components/icon-picker/InsertIconButton.vue'
import { useToolbarActions } from '@/components/Toolbar/actions'
import DesktopToolbar from '@/components/Toolbar/DesktopToolbar.vue'
import MobileToolbar from '@/components/Toolbar/MobileToolbar.vue'
import type { ToolbarActionItem } from '@/components/Toolbar/types'
import { useMenuUI } from '@/components/ui/menu/menu'

const store = useEditorStore()
const { isMobile } = useViewportKind()
const { getCommand } = useEditorCommands()
const { showActionToast } = useActionToast()
const { menu, tools: toolTexts } = useI18n()

const toolLabels = computed<Record<Tool, string>>(() => ({
  SELECT: toolTexts.value.move,
  FRAME: toolTexts.value.frame,
  SECTION: toolTexts.value.section,
  RECTANGLE: toolTexts.value.rectangle,
  ELLIPSE: toolTexts.value.ellipse,
  LINE: toolTexts.value.line,
  ARROW: toolTexts.value.arrow,
  POLYGON: toolTexts.value.polygon,
  STAR: toolTexts.value.star,
  PEN: toolTexts.value.pen,
  PENCIL: toolTexts.value.pencil,
  SCALE: toolTexts.value.scale,
  SHAPE_BUILDER: toolTexts.value.shapeBuilder,
  VARIABLE_WIDTH: toolTexts.value.variableWidth,
  TEXT: toolTexts.value.text,
  HAND: toolTexts.value.hand
}))

const toolShortcuts: Record<Tool, string> = {
  SELECT: 'V',
  FRAME: 'F',
  SECTION: 'S',
  RECTANGLE: 'R',
  ELLIPSE: 'O',
  LINE: 'L',
  ARROW: formatShortcut('SHIFT+L') ?? '',
  POLYGON: '',
  STAR: '',
  PEN: 'P',
  PENCIL: formatShortcut('SHIFT+P') ?? '',
  SCALE: 'K',
  SHAPE_BUILDER: formatShortcut('SHIFT+M') ?? '',
  VARIABLE_WIDTH: formatShortcut('SHIFT+W') ?? '',
  TEXT: 'T',
  HAND: 'H'
}

const flyoutMenuCls = useMenuUI({ content: 'min-w-32' })
const toolbarUI = { flyoutContent: flyoutMenuCls.content }
const commentsPlacing = computed(() => commentPlacing(store))
const { editActions, arrangeActions } = useToolbarActions({ store, getCommand, menu })

const { mobileCategory, slideDirection, hasPrev, hasNext, goPrev, goNext } = useToolbarState()

/**
 * A document open to view only keeps the tools that look: the move and hand tools, alone or in
 * their group. Inserting goes with the drawing tools; commenting stays, as viewers comment in
 * Figma, through the server's comment channel.
 */
const viewOnly = computed(() => store.state.viewOnly === true)
const VIEWING_TOOLS: ReadonlySet<Tool> = new Set(['SELECT', 'HAND'])
function shownTools(tools: EditorToolDef[]): EditorToolDef[] {
  if (!viewOnly.value) return tools
  return tools.filter(
    (tool) =>
      VIEWING_TOOLS.has(tool.key) || tool.flyout?.some((key) => VIEWING_TOOLS.has(key)) === true
  )
}

/** Picking a tool leaves comment mode, even the tool already picked under it. */
function pickTool(setTool: (tool: Tool) => void, tool: Tool) {
  stopCommentPlacing(store)
  setTool(tool)
}

function onActionTap(item: ToolbarActionItem) {
  item.action()
  showActionToast(item.label)
}
</script>

<template>
  <ToolbarRoot v-slot="{ tools, activeTool, flyoutSelections, actions }">
    <DesktopToolbar
      v-if="!isMobile"
      :tools="shownTools(tools)"
      :active-tool="activeTool"
      :flyout-selections="flyoutSelections"
      :tool-icons="toolIcons"
      :tool-labels="toolLabels"
      :tool-shortcuts="toolShortcuts"
      :ui="toolbarUI"
      :tools-idle="commentsPlacing"
      @set-tool="pickTool(actions.setTool, $event)"
    >
      <template #end>
        <InsertIconButton v-if="!viewOnly" :ui="toolbarUI" />
        <CommentToolButton v-if="mayComment(store)" :ui="toolbarUI" />
      </template>
    </DesktopToolbar>

    <MobileToolbar
      v-else
      :tools="shownTools(tools)"
      :active-tool="activeTool"
      :flyout-selections="flyoutSelections"
      :tool-icons="toolIcons"
      :tool-labels="toolLabels"
      :tool-shortcuts="toolShortcuts"
      :ui="toolbarUI"
      :mobile-category="mobileCategory"
      :slide-direction="slideDirection"
      :has-prev="hasPrev"
      :has-next="hasNext"
      :edit-actions="viewOnly ? [] : editActions"
      :arrange-actions="viewOnly ? [] : arrangeActions"
      @set-tool="pickTool(actions.setTool, $event)"
      @prev="goPrev"
      @next="goNext"
      @action="onActionTap"
    >
      <template v-if="!viewOnly" #end>
        <InsertIconButton mobile :ui="toolbarUI" />
      </template>
    </MobileToolbar>
  </ToolbarRoot>
</template>
