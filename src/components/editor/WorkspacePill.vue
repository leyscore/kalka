<script setup lang="ts">
import { useI18n, usePrototypeMessages } from '@kalka/vue'

import { resolvedAppTheme } from '@/app/shell/theme'
import BrandMark from '@/components/brand/BrandMark.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * The pill of the canvas-only layout: the document name and the way back. In preview it says
 * so, resets the controls, and leaves preview; presenting a page with several flows, it picks
 * the flow to play, as Figma's flow list in presentation view.
 */
const {
  documentName,
  mode,
  shortcut,
  flows = [],
  flowId = null
} = defineProps<{
  documentName: string
  mode: 'collapsed' | 'preview'
  /** The shortcut of the way back: Toggle UI, or leaving preview. */
  shortcut: string
  /** The page's flows, by the frame each starts at. */
  flows?: { value: string; label: string }[]
  /** The flow presented now, if it started at one. */
  flowId?: string | null
}>()
const emit = defineEmits<{ showUi: []; reset: []; leave: []; flow: [startId: string] }>()
const { editor } = useI18n()
const prototype = usePrototypeMessages()
</script>

<template>
  <div
    class="absolute top-7 left-7 z-10 flex items-center gap-2 rounded-[9px] border border-float-border bg-float px-2 py-1 shadow-(--float-shadow) backdrop-blur-[28px]"
    :data-mode="mode"
  >
    <BrandMark variant="app-icon" :appearance="resolvedAppTheme" class="size-6" />
    <span data-test-id="editor-document-name" class="text-xs text-surface">{{ documentName }}</span>
    <IconButton
      v-if="mode === 'collapsed'"
      :label="editor.showUI({ shortcut })"
      data-test-id="editor-show-ui"
      class="ml-1"
      @click="emit('showUi')"
    >
      <icon-hugeicons-sidebar-left class="size-3.5" />
    </IconButton>
    <template v-else>
      <span
        class="ml-1 flex h-5 items-center gap-1 rounded bg-accent/15 px-1.5 text-[10px] font-medium text-primary"
      >
        <icon-hugeicons-play class="size-3" />
        {{ editor.previewing }}
      </span>
      <AppSelect
        v-if="flows.length > 1"
        :model-value="flowId ?? ''"
        :options="flows"
        :label="prototype.flows"
        :placeholder="prototype.flows"
        data-property="preview-flow"
        @update:model-value="(value) => value && emit('flow', value)"
      />
      <AppButton size="xs" variant="soft" data-property="preview-reset" @click="emit('reset')">
        <icon-hugeicons-rotate-ccw class="size-3" />
        {{ editor.resetPreview }}
      </AppButton>
      <IconButton
        :label="editor.leavePreview({ shortcut })"
        data-property="preview-leave"
        @click="emit('leave')"
      >
        <icon-hugeicons-x class="size-3.5" />
      </IconButton>
    </template>
  </div>
</template>
