<script setup lang="ts">
import { onKeyStroke, useObjectUrl } from '@vueuse/core'
import { computed, defineAsyncComponent, onScopeDispose, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import {
  closeFolderFile,
  folderFileDraft,
  folderFileMode,
  imageType,
  openFolderFile
} from '@/app/document/folder/view'
import { useLeftPanel } from '@/app/shell/left-panel/use'
import { folderFileView } from '@/theme/panel/folder'

const CodeEditor = defineAsyncComponent(() => import('@/components/code-editor/CodeEditor.vue'))
const decoder = new TextDecoder()

const { panels } = useI18n()
const styles = folderFileView()
const file = openFolderFile

// Its path, the choice between clean and saved HTML, and the way out are in the top bar.
const view = folderFileMode
const text = computed(() => {
  if (!file.value || (file.value.kind !== 'html' && file.value.kind !== 'text')) return null
  if (view.value === 'clean' && file.value.clean !== undefined) return file.value.clean
  return decoder.decode(file.value.bytes)
})
const picture = useObjectUrl(
  computed(() =>
    file.value?.kind === 'image'
      ? new Blob([file.value.bytes.slice()], { type: imageType(file.value.name) })
      : null
  )
)

const close = closeFolderFile

function onEdit(event: Event): void {
  if (event.target instanceof HTMLTextAreaElement) folderFileDraft.value = event.target.value
}
// The file belongs to the folder and instructions panels: leaving them for layers, code or the
// agent gives the canvas back, and so does leaving this document.
const { activePanel } = useLeftPanel()
watch(activePanel, (panel) => {
  if (panel !== 'folder' && panel !== 'instructions') close()
})
onScopeDispose(close)
onKeyStroke('Escape', () => {
  if (file.value) close()
})
</script>

<template>
  <section
    v-if="file"
    :aria-label="file.path"
    data-test-id="folder-file-view"
    data-canvas-obstacle
    :class="styles.root()"
  >
    <!-- The folder's instructions are the person's to write, here, as plain text. -->
    <textarea
      v-if="text !== null && file.editablePath"
      :value="folderFileDraft ?? text"
      :aria-label="file.path"
      spellcheck="false"
      data-test-id="folder-file-editor"
      :class="styles.editor()"
      @input="onEdit"
    />
    <CodeEditor
      v-else-if="text !== null"
      :key="`${file.path}:${view}`"
      :model-value="text"
      language="html-css"
      read-only
      :label="file.path"
    />
    <div v-else-if="picture" :class="styles.picture()">
      <img :src="picture" :alt="file.name" :class="styles.image()" />
    </div>
    <p v-else :class="styles.note()">{{ panels.folderNoPreview }}</p>
  </section>
</template>
