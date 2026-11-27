<script setup lang="ts">
import { AlertDialogCancel, AlertDialogDescription, AlertDialogTitle } from 'reka-ui'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from '@kalka/vue'

import { IS_DEMO_SITE } from '@/app/demo/site'
import type { RecoverySnapshot, RecoverySnapshotMeta } from '@/app/document/recovery'
import { recoveryEnabled } from '@/app/document/recovery/preferences'
import { useNotificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'
import { formatStorageBytes } from '@/app/storage/format-bytes'
import {
  discardRecoverySnapshot,
  keepRecoverySnapshot,
  listRecoverySnapshots,
  restoreRecoverySnapshot
} from '@/app/tabs'
import AppButton from '@/components/ui/button/AppButton.vue'

const { recovery, common } = useI18n()
const notifications = useNotificationMessages()
const route = useRoute()
const snapshots = ref<RecoverySnapshotMeta[]>([])
const busyId = ref<string | null>(null)
const open = ref(false)
/**
 * Snapshots discarded while the dialog is open, by ID: their row stays with an Undo, since a
 * slip beside Restore would otherwise lose a whole document.
 */
const discarded = ref(new Map<string, RecoverySnapshot>())

function updatedLabel(snapshot: RecoverySnapshotMeta): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(snapshot.updatedAt))
}

async function restore(snapshot: RecoverySnapshotMeta): Promise<void> {
  busyId.value = snapshot.id
  try {
    await restoreRecoverySnapshot(snapshot.id)
    snapshots.value = snapshots.value.filter((candidate) => candidate.id !== snapshot.id)
    if (snapshots.value.every((candidate) => discarded.value.has(candidate.id))) open.value = false
  } catch (error) {
    toast.error(
      notifications.value.operationFailed({
        error: error instanceof Error ? error.message : recovery.value.restoreFailed
      })
    )
  } finally {
    busyId.value = null
  }
}

async function discard(snapshot: RecoverySnapshotMeta): Promise<void> {
  busyId.value = snapshot.id
  try {
    const removed = await discardRecoverySnapshot(snapshot.id)
    if (removed) discarded.value.set(snapshot.id, removed)
    else snapshots.value = snapshots.value.filter((candidate) => candidate.id !== snapshot.id)
  } finally {
    busyId.value = null
  }
}

async function undoDiscard(snapshot: RecoverySnapshotMeta): Promise<void> {
  const removed = discarded.value.get(snapshot.id)
  if (!removed) return
  busyId.value = snapshot.id
  try {
    await keepRecoverySnapshot(removed)
    discarded.value.delete(snapshot.id)
  } finally {
    busyId.value = null
  }
}

onMounted(async () => {
  if (IS_DEMO_SITE || route.path !== '/' || !recoveryEnabled.value) return
  try {
    snapshots.value = await listRecoverySnapshots()
    open.value = snapshots.value.length > 0
  } catch (error) {
    console.warn('[Recovery] Failed to list snapshots:', error)
  }
})
</script>

<template>
  <AppAlertDialogRoot v-model:open="open" size="md" data-test-id="recovery-dialog">
    <div class="border-b border-border px-4 py-3">
      <AlertDialogTitle class="text-sm font-semibold text-surface">
        {{ recovery.dialogTitle }}
      </AlertDialogTitle>
    </div>
    <AppDialogBody class="space-y-3">
      <AlertDialogDescription class="text-xs text-muted">
        {{ recovery.dialogDescription }}
      </AlertDialogDescription>
      <div class="max-h-72 space-y-2 overflow-y-auto">
        <div
          v-for="snapshot in snapshots"
          :key="snapshot.id"
          class="flex items-center gap-3 rounded-[10px] border border-hairline bg-group p-3 data-discarded:opacity-70"
          :data-discarded="discarded.has(snapshot.id) || undefined"
        >
          <icon-hugeicons-file-clock class="size-4 shrink-0 text-muted" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-medium text-surface">{{ snapshot.documentName }}</p>
            <p class="flex flex-wrap gap-x-3 text-[11px] text-muted">
              <span>{{ updatedLabel(snapshot) }}</span>
              <span>{{ formatStorageBytes(snapshot.byteLength) }}</span>
            </p>
          </div>
          <template v-if="discarded.has(snapshot.id)">
            <span class="text-[11px] text-muted">{{ recovery.discarded }}</span>
            <AppButton
              color="neutral"
              variant="outline"
              size="xs"
              :disabled="busyId !== null"
              @click="undoDiscard(snapshot)"
            >
              {{ recovery.undoDiscard }}
            </AppButton>
          </template>
          <template v-else>
            <AppButton
              color="error"
              variant="ghost"
              size="xs"
              :disabled="busyId !== null"
              @click="discard(snapshot)"
            >
              {{ recovery.discard }}
            </AppButton>
            <AppButton
              color="primary"
              variant="solid"
              size="xs"
              :disabled="busyId !== null"
              @click="restore(snapshot)"
            >
              {{ recovery.restore }}
            </AppButton>
          </template>
        </div>
      </div>
    </AppDialogBody>
    <AppDialogFooter>
      <AlertDialogCancel as-child>
        <AppButton color="neutral" variant="ghost">{{ common.close }}</AppButton>
      </AlertDialogCancel>
    </AppDialogFooter>
  </AppAlertDialogRoot>
</template>
