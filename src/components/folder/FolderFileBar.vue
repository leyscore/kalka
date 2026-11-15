<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '@kalka/vue'

import {
  closeFolderFile,
  folderFileDraft,
  folderFileMarkdown,
  folderFileMode,
  isEditableFile,
  isMarkdownFile,
  openFolderFile,
  saveFolderFile
} from '@/app/document/folder/view'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import { folderFileBar } from '@/theme/panel/folder'

/** What the top bar shows of the file that has the canvas's place: its path, how it is read, and the way out. */
const { common, panels } = useI18n()
const styles = folderFileBar()
const saving = ref(false)

async function save(): Promise<void> {
  saving.value = true
  try {
    await saveFolderFile()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="openFolderFile" data-test-id="folder-file-bar" :class="styles.root()">
    <icon-hugeicons-file-01 :class="styles.icon()" />
    <span :class="styles.path()">{{ openFolderFile.path }}</span>
    <SegmentedControl
      v-if="openFolderFile.clean !== undefined"
      v-model="folderFileMode"
      required
      size="md"
      :label="openFolderFile.path"
      data-test-id="folder-file-mode"
      :options="[
        { value: 'clean', label: panels.folderViewClean },
        { value: 'saved', label: panels.folderViewSaved }
      ]"
    />
    <SegmentedControl
      v-if="isMarkdownFile(openFolderFile)"
      v-model="folderFileMarkdown"
      required
      size="md"
      :label="openFolderFile.path"
      data-test-id="folder-file-markdown"
      :options="[
        { value: 'preview', label: panels.folderViewPreview },
        {
          value: 'text',
          label: isEditableFile(openFolderFile) ? panels.folderViewEdit : panels.folderViewSource
        }
      ]"
    />
    <AppButton
      v-if="isEditableFile(openFolderFile)"
      size="xs"
      color="primary"
      variant="solid"
      data-test-id="folder-file-save"
      :disabled="folderFileDraft === null"
      :loading="saving"
      @click="save"
    >
      {{ common.save }}
    </AppButton>
    <IconButton
      :label="common.close"
      side="bottom"
      data-test-id="folder-file-close"
      :class="styles.close()"
      @click="closeFolderFile"
    >
      <icon-hugeicons-x class="size-3.5" />
    </IconButton>
  </div>
</template>
