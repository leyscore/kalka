<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import {
  checkpointTime,
  closePreview,
  previewOf,
  restorePreviewed
} from '@/app/document/versions/checkpoints/use'
import type { EditorStore } from '@/app/editor/active-store'
import { toast } from '@/app/shell/ui'
import AppButton from '@/components/ui/button/AppButton.vue'

/**
 * Over a version opened to look at: which version it is, that nothing done here changes the file,
 * and the way to restore it or go back, as Figma shows above a version from its history.
 */
const { store } = defineProps<{ store: EditorStore }>()
const { panels } = useI18n()
const preview = computed(() => previewOf(store))
const time = computed(() => (preview.value ? checkpointTime(preview.value.checkpoint) : ''))
const restoring = ref(false)

async function restore() {
  restoring.value = true
  try {
    await restorePreviewed(store, panels.value.versionsBeforeRestoreAt({ time: time.value }))
    toast.info(panels.value.versionsRestoredAt({ time: time.value }))
  } catch (cause) {
    toast.error(cause instanceof Error ? cause.message : String(cause))
  } finally {
    restoring.value = false
  }
}
</script>

<template>
  <div
    v-if="preview"
    role="status"
    class="flex shrink-0 items-center gap-3 border-b border-border bg-panel px-4 py-2 text-xs text-surface"
    data-test-id="checkpoint-preview-banner"
  >
    <icon-hugeicons-clock-01 class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
    <span class="font-medium">{{ panels.versionsPreviewing({ time }) }}</span>
    <span class="min-w-0 flex-1 truncate text-muted">{{ panels.versionsPreviewHint }}</span>
    <AppButton size="xs" variant="ghost" @click="closePreview(store)">
      {{ panels.versionsClosePreview }}
    </AppButton>
    <AppButton
      size="xs"
      color="primary"
      variant="solid"
      :loading="restoring"
      data-test-id="checkpoint-preview-restore"
      @click="restore"
    >
      {{ panels.versionsRestoreThis }}
    </AppButton>
  </div>
</template>
