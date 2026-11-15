<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { closeFolderFile, folderFileMode, openFolderFile } from '@/app/document/folder/view'
import IconButton from '@/components/ui/button/IconButton.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import { folderFileBar } from '@/theme/panel/folder'

/** What the top bar shows of the file that has the canvas's place: its path, how it is read, and the way out. */
const { common, panels } = useI18n()
const styles = folderFileBar()
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
