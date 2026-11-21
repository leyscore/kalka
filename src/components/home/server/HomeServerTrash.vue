<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import {
  eraseServerDocument,
  refreshTrash,
  restoreServerDocument,
  trashedDocuments
} from '@/app/collab/server/documents'
import type { TrashedDocument } from '@/app/collab/server/trash-api'
import { toast } from '@/app/shell/ui'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import { AppConfirmationDialog } from '@/components/ui/dialog'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'

/**
 * The server's trash: each deleted file with who deleted it and when it goes for good, to
 * restore it or erase it now. Files wait here 30 days.
 */
const { files, common, locale } = useI18n()
const loading = ref(true)
const error = ref('')
const erasing = ref<TrashedDocument | null>(null)
const confirming = ref(false)

onMounted(async () => {
  try {
    await refreshTrash()
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  } finally {
    loading.value = false
  }
})

function date(time: number): string {
  return new Date(time).toLocaleDateString(locale.value, { day: 'numeric', month: 'long' })
}

function deleted(document: TrashedDocument): string {
  const when = date(document.deletedAt)
  return document.deletedBy
    ? files.value.trashedBy({ name: document.deletedBy, date: when })
    : files.value.trashedOn({ date: when })
}

async function run(action: () => Promise<void>): Promise<void> {
  try {
    await action()
  } catch (failure) {
    toast.error(failure instanceof Error ? failure.message : String(failure))
  }
}

function askErase(document: TrashedDocument): void {
  erasing.value = document
  confirming.value = true
}

function erase(): void {
  const document = erasing.value
  if (document) void run(() => eraseServerDocument(document.id))
}
</script>

<template>
  <AppAlert v-if="error" tone="error" :heading="error" />
  <p
    v-else-if="!loading && trashedDocuments.length === 0"
    class="rounded-[14px] bg-card px-4 py-8 text-center text-xs text-muted"
    data-test-id="home-trash-empty"
  >
    {{ files.trashEmpty }}
  </p>
  <SettingsGroup v-else-if="trashedDocuments.length" data-test-id="home-trash">
    <div
      v-for="document in trashedDocuments"
      :key="document.id"
      class="flex min-h-14 items-center gap-3 px-4 py-2.5 max-sm:flex-wrap"
      :data-trashed="document.name"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-panel-field text-muted"
      >
        <icon-hugeicons-file-01 class="size-4" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="truncate text-[13px] font-medium text-surface">{{ document.name }}</span>
        <span class="truncate text-xs text-muted">
          {{ deleted(document) }} &ndash; {{ files.erasedOn({ date: date(document.expiresAt) }) }}
        </span>
      </span>
      <AppButton variant="ghost" @click="askErase(document)">{{ files.eraseFile }}</AppButton>
      <AppButton variant="outline" @click="run(() => restoreServerDocument(document.id))">
        {{ files.restoreFile }}
      </AppButton>
    </div>
  </SettingsGroup>
  <AppConfirmationDialog
    v-model:open="confirming"
    :heading="files.eraseFile"
    :description="files.eraseFileConfirm({ name: erasing?.name ?? '' })"
    :cancel-label="common.cancel"
    :confirm-label="files.eraseFile"
    tone="danger"
    @confirm="erase"
  />
</template>
