<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import type { FolderRow } from '@/app/document/folder/tree'
import { useDocumentFolder } from '@/app/document/folder/use'
import { folderEntryType, openFolderFile } from '@/app/document/folder/view'
import { useDocumentVersions } from '@/app/document/versions/use'
import { useEditorStore } from '@/app/editor/active-store'
import { saveAsFolderDialog } from '@/app/shell/menu/files'
import { isTauri } from '@/app/tauri/env'
import FolderEntryIcon from '@/components/folder/FolderEntryIcon.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import { FOLDER_INDENT, folderPanel } from '@/theme/panel/folder'

const LETTERS = { added: 'A', conflict: '!', deleted: 'D', modified: 'M' } as const

const { common, menu, panels } = useI18n()
const store = useEditorStore()
// Git runs on this computer: the desktop app reads the repository for the tree's marks, a browser
// does not.
const versions = isTauri() ? useDocumentVersions(store) : null
const { source, rows, collapsed, error, toggle, refresh, read } = useDocumentFolder(store, versions)
const styles = folderPanel()

function indent(row: FolderRow): string {
  return FOLDER_INDENT[Math.min(row.depth, FOLDER_INDENT.length - 1)] ?? ''
}

/** Writes the folder shown here to the computer; the document then lives in it, with its versions. */
async function saveAsFolder(): Promise<void> {
  await saveAsFolderDialog(store)
  await versions?.refresh()
}

/** A folder opens and closes; a file takes the canvas's place, as in a code editor. */
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
    <div v-if="source === 'document'" :class="styles.note()">
      <p>{{ panels.folderGenerated }}</p>
      <AppButton
        v-if="versions"
        size="sm"
        variant="outline"
        class="mt-2"
        data-test-id="folder-save-as"
        @click="saveAsFolder"
      >
        {{ menu.saveAsFolder }}
      </AppButton>
    </div>
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
            <FolderEntryIcon :type="folderEntryType(row.path, row.kind)" />
          </template>
          <span v-else class="ml-[18px] flex shrink-0">
            <FolderEntryIcon :type="folderEntryType(row.path, row.kind)" />
          </span>
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
  </div>
</template>
