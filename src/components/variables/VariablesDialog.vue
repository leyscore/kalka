<script setup lang="ts">
import { DialogTitle } from 'reka-ui'
import { computed, defineAsyncComponent, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { useDocumentShortcuts } from '@/app/shell/keyboard/document'
import IconButton from '@/components/ui/button/IconButton.vue'
import { AppDialogClose, AppDialogRoot } from '@/components/ui/dialog'
import TokensPanel from '@/components/variables/TokensPanel.vue'
import { useTokenFiles } from '@/components/variables/useTokenFiles'

/** The variables outside the desktop layout, where they open as a dialog over the canvas. */
const store = useEditorStore()
const open = computed({
  get: () => store.state.variablesOpen,
  set: (value: boolean) => {
    store.state.variablesOpen = value
  }
})

/** Undo and redo reach the document from inside the dialog, as they do on the canvas. */
const onKeydown = useDocumentShortcuts()

const { variables, common } = useI18n()
/** Expanding gives a large design system most of the window; it is kept for this session. */
const expanded = ref(false)
const { copyTokens, exportTokens, importBundle, importOpen, openTokenFiles } = useTokenFiles(store)

const TokenImportDialog = defineAsyncComponent(
  () => import('@/components/variables/TokenImportDialog.vue')
)
</script>

<template>
  <AppDialogRoot
    v-model:open="open"
    :size="expanded ? 'screen' : 'xl'"
    :height="expanded ? 'screen' : 'full'"
    data-test-id="variables-dialog"
    @keydown="onKeydown"
    :aria-describedby="undefined"
  >
    <DialogTitle class="sr-only">{{ variables.localVariables }}</DialogTitle>
    <TokensPanel @copy="copyTokens" @export="exportTokens">
      <template #actions>
        <IconButton
          :label="variables.importDesignTokens"
          data-test-id="variables-import-tokens"
          @click="openTokenFiles()"
        >
          <icon-hugeicons-file-input class="size-3.5" />
        </IconButton>
        <IconButton
          :label="expanded ? variables.collapse : variables.expand"
          data-test-id="variables-expand"
          @click="expanded = !expanded"
        >
          <icon-hugeicons-minimize-02 v-if="expanded" class="size-3.5" />
          <icon-hugeicons-maximize-02 v-else class="size-3.5" />
        </IconButton>
        <AppDialogClose :ariaLabel="common.close" />
      </template>
    </TokensPanel>
    <TokenImportDialog v-if="importBundle" v-model:open="importOpen" :bundle="importBundle" />
  </AppDialogRoot>
</template>
