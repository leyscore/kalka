<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { tv } from 'tailwind-variants'

import { useI18n } from '@kalka/vue'

import type { FolderRow } from '@/app/document/folder/tree'
import { useDocumentFolder } from '@/app/document/folder/use'
import { openFolderFile } from '@/app/document/folder/view'
import { useDocumentVersions } from '@/app/document/versions/use'
import { useEditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import VersionsPanel from '@/components/versions/VersionsPanel.vue'
import { FOLDER_INDENT, folderPanel } from '@/theme/panel/folder'
import splitterTheme from '@/theme/splitter'

const LETTERS = { added: 'A', conflict: '!', deleted: 'D', modified: 'M' } as const

const { common, panels } = useI18n()
const store = useEditorStore()
// Git runs on this computer: one reading of the repository for the tree's marks and the versions
// below it in the desktop app, none in a browser.
const versions = isTauri() ? useDocumentVersions(store) : null
const { source, rows, collapsed, error, toggle, refresh, read } = useDocumentFolder(store, versions)
const styles = folderPanel()
const splitterStyles = tv(splitterTheme)({ direction: 'vertical' })

function indent(row: FolderRow): string {
  return FOLDER_INDENT[Math.min(row.depth, FOLDER_INDENT.length - 1)] ?? ''
}

/** A folder opens and closes; a file opens over the canvas, as in a code editor. */
async function open(row: FolderRow): Promise<void> {
  if (row.kind === 'folder') {
    toggle(row.path)
    return
  }
  try {
    openFolderFile.value = await read(row.path)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}
</script>

<template>
  <div :class="styles.root()" data-test-id="folder-panel">
    <SplitterGroup direction="vertical" auto-save-id="folder-layout" class="flex-1 overflow-hidden">
      <SplitterPanel :default-size="50" :min-size="15" class="flex flex-col overflow-hidden">
        <h3 :class="styles.heading()">
          {{ panels.folder }}
          <IconButton
            :label="common.refresh"
            data-test-id="folder-refresh"
            :class="styles.refresh()"
            @click="refresh"
          >
            <icon-hugeicons-refresh class="size-3" />
          </IconButton>
        </h3>
        <p v-if="source === 'document'" :class="styles.note()">{{ panels.folderGenerated }}</p>
        <ul :class="styles.tree()" data-test-id="folder-tree">
          <li v-for="row in rows" :key="row.path">
            <button
              type="button"
              :class="[
                styles.row(),
                indent(row),
                openFolderFile?.path === row.path && styles.selected()
              ]"
              :data-kind="row.kind"
              :aria-expanded="row.kind === 'folder' ? !collapsed.has(row.path) : undefined"
              :aria-label="row.name"
              @click="open(row)"
            >
              <template v-if="row.kind === 'folder'">
                <icon-hugeicons-chevron-right
                  :class="styles.chevron()"
                  :data-open="!collapsed.has(row.path) || undefined"
                />
                <icon-hugeicons-folder-01 :class="styles.icon()" />
              </template>
              <icon-hugeicons-file-01 v-else :class="[styles.icon(), 'ml-[18px]']" />
              <span :class="styles.name()" :data-change="row.change ?? undefined">
                {{ row.name }}
              </span>
              <span v-if="row.change && row.kind === 'folder'" :class="styles.dot()" />
              <span v-else-if="row.change" :class="styles.mark()" :data-change="row.change">
                {{ LETTERS[row.change] }}
              </span>
            </button>
          </li>
        </ul>
        <AppAlert v-if="error" tone="error" :heading="error" class="mx-4 mb-3" />
      </SplitterPanel>
      <SplitterResizeHandle :class="splitterStyles.handle()">
        <div :class="splitterStyles.divider({ class: 'inset-x-3 bg-hairline' })" />
      </SplitterResizeHandle>
      <SplitterPanel :default-size="50" :min-size="20" class="flex flex-col overflow-hidden">
        <h3 :class="styles.heading()">{{ panels.versions }}</h3>
        <VersionsPanel v-if="versions" :versions="versions" />
        <p v-else :class="styles.note()" data-test-id="folder-versions-desktop">
          {{ panels.folderVersionsDesktop }}
        </p>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>
