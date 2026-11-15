<script setup lang="ts">
import { onKeyStroke, useObjectUrl } from '@vueuse/core'
import { computed, defineAsyncComponent } from 'vue'

import { useI18n } from '@kalka/vue'

import { imageType, openFolderFile } from '@/app/document/folder/view'
import IconButton from '@/components/ui/button/IconButton.vue'
import { folderFileView } from '@/theme/panel/folder'

const CodeEditor = defineAsyncComponent(() => import('@/components/code-editor/CodeEditor.vue'))
const decoder = new TextDecoder()

const { common, panels } = useI18n()
const styles = folderFileView()
const file = openFolderFile

const text = computed(() =>
  file.value && (file.value.kind === 'html' || file.value.kind === 'text')
    ? decoder.decode(file.value.bytes)
    : null
)
const picture = useObjectUrl(
  computed(() =>
    file.value?.kind === 'image'
      ? new Blob([file.value.bytes.slice()], { type: imageType(file.value.name) })
      : null
  )
)

function close(): void {
  file.value = null
}
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
    <header :class="styles.header()">
      <icon-hugeicons-file-01 class="size-3.5 shrink-0 text-muted" />
      <span :class="styles.path()">{{ file.path }}</span>
      <IconButton
        :label="common.close"
        data-test-id="folder-file-close"
        :class="styles.action()"
        @click="close"
      >
        <icon-hugeicons-x class="size-3.5" />
      </IconButton>
    </header>
    <div :class="styles.body()">
      <CodeEditor
        v-if="text !== null"
        :key="file.path"
        :model-value="text"
        language="html-css"
        read-only
        :label="file.path"
      />
      <div v-else-if="picture" :class="styles.picture()">
        <img :src="picture" :alt="file.name" :class="styles.image()" />
      </div>
      <p v-else :class="styles.note()">{{ panels.folderNoPreview }}</p>
    </div>
  </section>
</template>
