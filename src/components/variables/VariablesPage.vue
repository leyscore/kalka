<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { defineAsyncComponent, nextTick, useTemplateRef, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { useDocumentShortcuts } from '@/app/shell/keyboard/document'
import { isEditing } from '@/app/shell/keyboard/focus'
import IconButton from '@/components/ui/button/IconButton.vue'
import TokensPanel from '@/components/variables/TokensPanel.vue'
import { useTokenFiles } from '@/components/variables/useTokenFiles'

/**
 * The variables as a page of the desktop editor: it covers the panels and the canvas, which stay
 * as they were underneath, until it is closed or another panel is chosen in the rail.
 */
const { open } = defineProps<{ open: boolean }>()
const store = useEditorStore()
const { variables, common } = useI18n()
const { copyTokens, exportTokens, importBundle, importOpen, openTokenFiles } = useTokenFiles(store)
const TokenImportDialog = defineAsyncComponent(
  () => import('@/components/variables/TokenImportDialog.vue')
)

const root = useTemplateRef<HTMLElement>('root')
/** Undo and redo reach the document from the page, as they do on the canvas. */
const onDocumentKeys = useDocumentShortcuts()

function close() {
  store.state.variablesOpen = false
}

// Keys go to the page once it opens, so they never reach the canvas under it.
watch(
  () => open,
  (isOpen) => {
    if (isOpen) void nextTick(() => root.value?.focus({ preventScroll: true }))
  },
  { immediate: true }
)

/**
 * Keys pressed on the page, or on nothing once a deleted row took the focus with it, are the
 * page's: undo and redo, and Escape to close it unless a field or an open menu takes it first.
 */
function onKeydown(event: KeyboardEvent) {
  const target = event.target
  const page = root.value
  if (!open || !page || !(target instanceof Node)) return
  if (target !== document.body && !page.contains(target)) return
  onDocumentKeys(event)
  if (event.key !== 'Escape' || event.defaultPrevented || isEditing(event)) return
  event.preventDefault()
  close()
}
useEventListener(document, 'keydown', onKeydown)
</script>

<template>
  <section
    ref="root"
    tabindex="-1"
    :aria-label="variables.localVariables"
    data-test-id="variables-page"
    class="flex min-h-0 min-w-0 flex-col overflow-hidden panel-float outline-none"
  >
    <TokensPanel @copy="copyTokens" @export="exportTokens">
      <template #actions>
        <IconButton
          :label="variables.importDesignTokens"
          data-test-id="variables-import-tokens"
          @click="openTokenFiles()"
        >
          <icon-hugeicons-file-input class="size-3.5" />
        </IconButton>
        <IconButton :label="common.close" data-test-id="variables-page-close" @click="close">
          <icon-hugeicons-cancel-01 class="size-3.5" />
        </IconButton>
      </template>
    </TokensPanel>
    <TokenImportDialog v-if="importBundle" v-model:open="importOpen" :bundle="importBundle" />
  </section>
</template>
