<script setup lang="ts">
import { ToolbarRoot } from 'reka-ui'
import { computed, useTemplateRef } from 'vue'

import type { EditorToolDef } from '@open-pencil/core/editor'
import {
  getToolbarToolSelection,
  isToolbarToolActive,
  toolbarToolTestId,
  ToolbarItem
} from '@open-pencil/vue'
import type { Tool } from '@open-pencil/vue'

import ToolButton from '@/components/Toolbar/ToolButton.vue'
import ToolFlyout from '@/components/Toolbar/ToolFlyout.vue'
import type { ToolbarUI, ToolIconMap, ToolLabels } from '@/components/Toolbar/types'
import { useGlide } from '@/components/ui/motion/useGlide'
import Tip from '@/components/ui/overlay/Tip.vue'
import { glidePills } from '@/theme/motion/glide'

const { tools, activeTool, flyoutSelections, toolIcons, toolLabels, toolShortcuts, ui } =
  defineProps<{
    tools: EditorToolDef[]
    activeTool: Tool
    flyoutSelections: ReadonlyMap<Tool, Tool>
    toolIcons: ToolIconMap
    toolLabels: ToolLabels
    toolShortcuts: Record<Tool, string>
    ui?: ToolbarUI
  }>()

const emit = defineEmits<{
  setTool: [tool: Tool]
}>()

// The active tool's accent pill slides from tool to tool, and a soft one follows the pointer.
const toolbarRoot = useTemplateRef<{ $el: HTMLElement }>('toolbarRoot')
const toolbarElement = computed(() => toolbarRoot.value?.$el ?? null)
useGlide(toolbarElement, {
  items: 'button',
  active: 'button[aria-pressed="true"]',
  pillClass: glidePills.accent
})
useGlide(toolbarElement, { items: 'button', hover: true, pillClass: glidePills.hover })
</script>

<template>
  <div
    data-canvas-obstacle
    class="absolute bottom-[18px] left-1/2 z-10 flex -translate-x-1/2 items-center"
  >
    <ToolbarRoot
      ref="toolbarRoot"
      data-test-id="toolbar"
      class="flex items-center gap-0.5 rounded-[14px] border border-glass-strong-border bg-glass-strong p-[5px] shadow-(--toolbar-shadow) backdrop-blur-[24px]"
    >
      <template v-for="tool in tools" :key="tool.key">
        <Tip
          v-if="tool.flyout && tool.flyout.length > 1"
          :label="`${toolLabels[getToolbarToolSelection(tool, activeTool, flyoutSelections)]} (${tool.shortcut})`"
        >
          <ToolFlyout
            :tool="tool"
            :active-tool="activeTool"
            :selected-tool="getToolbarToolSelection(tool, activeTool, flyoutSelections)"
            :tool-icons="toolIcons"
            :tool-labels="toolLabels"
            :tool-shortcuts="toolShortcuts"
            :ui="ui"
            @select="emit('setTool', $event)"
          />
        </Tip>

        <ToolbarItem v-else v-slot="{ active, actions }" :tool="tool.key">
          <Tip :label="`${toolLabels[tool.key]} (${tool.shortcut})`">
            <ToolButton
              :data-test-id="toolbarToolTestId(tool.key)"
              :icon="toolIcons[tool.key]"
              :label="toolLabels[tool.key]"
              :active="active || isToolbarToolActive(tool, activeTool)"
              :ui="ui"
              @click="actions.select"
            />
          </Tip>
        </ToolbarItem>
      </template>
      <!-- Inserting rather than drawing: commands such as placing an icon. -->
      <span aria-hidden="true" class="mx-1 h-5 w-px shrink-0 bg-separator" />
      <slot name="end" />
    </ToolbarRoot>
  </div>
</template>
