<script setup lang="ts">
import { onMounted, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { useLibraryService } from '@/app/libraries'
import { announceLibraryUpdatesOnce } from '@/app/libraries/review'
import { toast } from '@/app/shell/ui'
import LibraryManagerDialog from '@/components/libraries/LibraryManagerDialog.vue'
import { useLibraryEntry } from '@/components/libraries/useLibraryEntry'

/**
 * Says so when a file opens with library updates waiting, as Figma does, with a Review that
 * opens them; the badge on the library button keeps counting them after.
 */
const editor = useEditorStore()
const service = useLibraryService()
const { panels } = useI18n()
const { open, initialSection, updateCount, openManager } = useLibraryEntry(editor, service)

onMounted(() => {
  service.refresh(editor).catch((error: unknown) => {
    console.warn('[Libraries] Failed to check for updates:', error)
  })
})

watch(
  updateCount,
  (count) => {
    if (count === 0 || !announceLibraryUpdatesOnce(editor.graph)) return
    toast.info(panels.value.libraryUpdatesAvailable, {
      label: panels.value.libraryUpdatesReview,
      run: openManager
    })
  },
  { immediate: true }
)
</script>

<template>
  <LibraryManagerDialog v-model="open" :initial-section="initialSection" />
</template>
