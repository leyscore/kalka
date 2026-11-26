<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useHistorySource } from '@/app/document/versions/checkpoints/use'
import { useEditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'
import { folderPanel } from '@/theme/panel/folder'

import CheckpointHistory from './CheckpointHistory.vue'
import ServerBranches from './ServerBranches.vue'
import VersionsPanel from './VersionsPanel.vue'

/**
 * The document's history: its versions in Git, which run on this computer, so in the desktop
 * app; in the browser, a server file's branches or the versions kept on this device.
 */
const { panels } = useI18n()
const styles = folderPanel()
const available = isTauri()
const { serverRoomId, checkpoints } = useHistorySource(useEditorStore())
</script>

<template>
  <div :class="styles.root()" data-test-id="history-panel">
    <h3 :class="styles.heading()">{{ panels.versions }}</h3>
    <VersionsPanel v-if="available" />
    <template v-else>
      <ServerBranches v-if="serverRoomId" :room-id="serverRoomId" />
      <CheckpointHistory v-else-if="checkpoints" />
      <p :class="styles.note()" data-test-id="folder-versions-desktop">
        {{ panels.folderVersionsDesktop }}
      </p>
    </template>
  </div>
</template>
