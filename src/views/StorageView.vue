<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@open-pencil/vue'

import {
  activeStorageProviderID,
  createActiveStorageAdapter,
  storageCredentialStatuses,
  storagePreferencesComplete,
  storageProviderRegistry,
  type StorageDocument
} from '@/app/integrations/storage'
import { fadeOutGlobalLoader } from '@/app/editor/canvas/loader-overlay'
import { openSettingsDialog, settingsDialogOpen } from '@/app/settings/dialog'
import type { CredentialStatus } from '@/app/settings/credentials/types'
import { createCanvasId } from '@/app/storage/id'
import { getLocalCanvasStore } from '@/app/storage/local-store'
import { activeTab, createTab, openStorageDocumentInNewTab } from '@/app/tabs'

const { dialogs } = useI18n()
const router = useRouter()
const provider = storageProviderRegistry.get(activeStorageProviderID.value)
const documents = ref<StorageDocument[]>([])
const credentialStatuses = ref<Record<string, CredentialStatus>>({})
const configured = computed(
  () =>
    storagePreferencesComplete(provider.id) &&
    provider.credentialFields.every(
      (field) => !field.required || credentialStatuses.value[field.id] === 'configured'
    )
)
const loading = ref(false)
const error = ref<string | null>(null)

async function paintLocalDocuments(): Promise<void> {
  const local = await getLocalCanvasStore().listMetas()
  documents.value = local.map((metadata) => ({
    id: metadata.id,
    name: metadata.name,
    updatedAt: metadata.updatedAt,
    metadataAuthoritative: true
  }))
}

async function refresh(): Promise<void> {
  loading.value = true
  error.value = null
  await paintLocalDocuments()
  try {
    credentialStatuses.value = await storageCredentialStatuses(provider.id)
    if (!configured.value) {
      error.value = dialogs.value.storageNotConfigured
      return
    }
    const remote = await createActiveStorageAdapter().listDocuments()
    const local = await getLocalCanvasStore().listMetas()
    const localById = new Map(local.map((metadata) => [metadata.id, metadata]))
    const merged = new Map(remote.map((document) => [document.id, document]))
    for (const metadata of local) {
      if (metadata.syncStatus === 'synced' && merged.has(metadata.id)) continue
      merged.set(metadata.id, {
        id: metadata.id,
        name: metadata.name,
        updatedAt: metadata.updatedAt,
        metadataAuthoritative: true
      })
    }
    documents.value = [...merged.values()].sort((first, second) =>
      second.updatedAt.localeCompare(first.updatedAt)
    )

    for (const document of remote) {
      if (localById.has(document.id)) continue
      await getLocalCanvasStore().upsertIndexMeta({
        id: document.id,
        providerId: activeStorageProviderID.value,
        name: document.name,
        updatedAt: document.updatedAt,
        syncStatus: 'synced',
        lastSyncedAt: document.updatedAt,
        lastSyncError: null
      })
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    loading.value = false
  }
}

async function openDocument(document: StorageDocument): Promise<void> {
  await router.push('/')
  await nextTick()
  await openStorageDocumentInNewTab(document)
}

async function createDocument(): Promise<void> {
  if (!configured.value) return
  await router.push('/')
  await nextTick()
  const current = activeTab.value
  const store =
    current?.store.state.documentName === 'Untitled' && !current.store.undo.canUndo
      ? current.store
      : createTab().store
  const documentId = createCanvasId()
  store.setStorageDocumentSource(
    { providerId: activeStorageProviderID.value, documentId },
    'Untitled'
  )
  await store.saveFigFile()
}

watch(settingsDialogOpen, (open, wasOpen) => {
  if (wasOpen && !open) void refresh()
})

onMounted(() => {
  fadeOutGlobalLoader()
  void refresh()
})
</script>

<template>
  <main class="min-h-screen bg-app text-surface" data-test-id="storage-workspace">
    <header class="flex h-14 items-center border-b border-border px-6">
      <div>
        <h1 class="text-sm font-semibold">{{ dialogs.storageWorkspace }}</h1>
        <p class="text-[10px] text-muted">{{ activeStorageProviderID }}</p>
      </div>
      <div class="ml-auto flex gap-2">
        <button
          type="button"
          class="rounded px-3 py-1.5 text-xs text-muted hover:bg-hover hover:text-surface"
          @click="openSettingsDialog('storage')"
        >
          {{ dialogs.settings }}
        </button>
        <button
          type="button"
          class="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!configured"
          data-test-id="storage-new-document"
          @click="createDocument"
        >
          {{ dialogs.newStoredDocument }}
        </button>
      </div>
    </header>

    <section class="mx-auto max-w-6xl p-6">
      <div class="mb-4 flex items-center justify-between">
        <p v-if="loading" class="text-xs text-muted">{{ dialogs.loadingDocuments }}</p>
        <p v-else-if="error && configured" class="text-xs text-danger" role="alert">
          {{ error }}
        </p>
        <span v-else />
        <button
          v-if="configured"
          type="button"
          class="rounded px-2 py-1 text-xs text-muted hover:bg-hover hover:text-surface"
          @click="refresh"
        >
          {{ dialogs.refresh }}
        </button>
      </div>

      <div
        v-if="documents.length"
        class="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4"
      >
        <button
          v-for="document in documents"
          :key="document.id"
          type="button"
          class="group overflow-hidden rounded-lg border border-border bg-panel text-left hover:border-panel-focus hover:bg-hover"
          :data-document-id="document.id"
          @click="openDocument(document)"
        >
          <div class="aspect-[4/3] bg-panel-field" />
          <div class="border-t border-border p-3">
            <p class="truncate text-xs font-medium">{{ document.name }}</p>
            <p class="mt-1 text-[10px] text-muted">
              {{ new Date(document.updatedAt).toLocaleString() }}
            </p>
          </div>
        </button>
      </div>

      <div v-else-if="!loading && configured" class="py-24 text-center text-xs text-muted">
        {{ dialogs.emptyStorageWorkspace }}
      </div>

      <div
        v-else-if="!loading"
        class="mx-auto flex max-w-sm flex-col items-center py-24 text-center"
      >
        <div class="mb-3 flex size-10 items-center justify-center rounded-full bg-panel-field">
          <icon-lucide-cloud class="size-5 text-muted" />
        </div>
        <p class="text-xs text-surface">{{ dialogs.storageNotConfigured }}</p>
        <button
          type="button"
          class="mt-4 rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90"
          @click="openSettingsDialog('storage')"
        >
          {{ dialogs.settings }}
        </button>
      </div>
    </section>
  </main>
</template>
