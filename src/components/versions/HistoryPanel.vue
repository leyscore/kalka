<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { isTauri } from '@/app/tauri/env'
import { folderPanel } from '@/theme/panel/folder'

import VersionsPanel from './VersionsPanel.vue'

/** The document's history: its versions in Git, which run on this computer, so in the desktop app. */
const { panels } = useI18n()
const styles = folderPanel()
const available = isTauri()
</script>

<template>
  <div :class="styles.root()" data-test-id="history-panel">
    <h3 :class="styles.heading()">{{ panels.versions }}</h3>
    <VersionsPanel v-if="available" />
    <p v-else :class="styles.note()" data-test-id="folder-versions-desktop">
      {{ panels.folderVersionsDesktop }}
    </p>
  </div>
</template>
