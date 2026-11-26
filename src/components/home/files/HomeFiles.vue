<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import { useDocumentWorkspace, useI18n, useViewportKind } from '@kalka/vue'

import { serverAccount, serverSessionExpired } from '@/app/collab/server/account'
import { openServerDocumentById } from '@/app/collab/server/documents'
import { recoveryEnabled } from '@/app/document/recovery/preferences'
import {
  deleteDraft,
  draftsPersist,
  listDrafts,
  openDraft,
  restoreDeletedDraft,
  type DraftDocument
} from '@/app/home/drafts'
import { duplicateDraft, duplicateLocalFile } from '@/app/home/duplicate'
import { homeFilesTab } from '@/app/home/files-tab'
import {
  activeStorageProviderID,
  readStoragePreferences,
  storagePreferencesComplete,
  storageProviderRegistry,
  type StorageDocument
} from '@/app/integrations/storage'
import {
  clearRecentFiles,
  forgetRecentDocument,
  loadRecentFileThumbnail,
  recentFiles,
  type RecentDocument
} from '@/app/recent-files'
import { openSettings } from '@/app/settings/open'
import { openFileFromPath } from '@/app/shell/menu/use'
import { toast } from '@/app/shell/ui'
import { createStorageWorkspaceSource } from '@/app/storage/workspace/source'
import { activeTab, openStorageDocumentInNewTab } from '@/app/tabs'
import DocumentEntry from '@/components/home/document/DocumentEntry.vue'
import FileActions from '@/components/home/files/FileActions.vue'
import HomeSampleTile from '@/components/home/learn/HomeSampleTile.vue'
import HomeSearchField from '@/components/home/search/HomeSearchField.vue'
import HomeServerDocuments from '@/components/home/server/HomeServerDocuments.vue'
import HomeServerNotifications from '@/components/home/server/HomeServerNotifications.vue'
import HomeServerTrash from '@/components/home/server/HomeServerTrash.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import { filesHeading, storageChip } from '@/theme/home/start'

/**
 * The files on Home and on the lists of files. Home shows the recent files from every place, led
 * by the last one opened, with the sample file. A list shows one place in full: the files opened
 * from this computer, the storage workspace the team shares, or the signed-in Kalka server.
 */
const { place } = defineProps<{ place: 'home' | 'files' }>()

const { panels, locale, storage, files, common, settings, collaboration, commands } = useI18n()
const { isMobile } = useViewportKind()
const view = useLocalStorage<'grid' | 'list'>('kalka:home-files-view', 'grid')
const query = ref('')
const openError = ref<string | null>(null)
const storageConfigured = ref(storagePreferencesComplete(activeStorageProviderID.value))
const inStorage = computed(() => place === 'files' && homeFilesTab.value === 'storage')
const inServer = computed(() => place === 'files' && homeFilesTab.value === 'server')
const inTrash = computed(() => place === 'files' && homeFilesTab.value === 'trash')
const serverList = useTemplateRef<{ refresh: () => Promise<void> }>('serverList')

const workspace = useDocumentWorkspace<RecentDocument>({
  source: {
    async refresh() {
      if (place === 'home') return recentFiles.value
      return recentFiles.value.filter((document) => document.kind === 'local')
    },
    loadPreview(documentId) {
      const document = recentFiles.value.find((candidate) => candidate.id === documentId)
      if (!document) return Promise.resolve(null)
      if (document.kind === 'local') return loadRecentFileThumbnail(document.path)
      if (document.kind === 'server') return Promise.resolve(null)
      return createStorageWorkspaceSource(() => undefined).loadPreview(document.documentId)
    }
  },
  refreshOnFocus: false,
  refreshOnReconnect: false,
  previewConcurrency: 2
})

const documents = workspace.documents
const previewURL = workspace.previewURL
const vWorkspacePreview = workspace.previewDirective

const storageWorkspace = useDocumentWorkspace<StorageDocument>({
  source: createStorageWorkspaceSource((snapshot) => {
    storageConfigured.value = snapshot.configured
  }),
  refreshInterval: 60_000,
  previewConcurrency: 6
})
const storageDocuments = storageWorkspace.documents
const storageLoading = storageWorkspace.loading
const storageError = computed(() => {
  const error = storageWorkspace.error.value
  if (error == null) return null
  return error instanceof Error ? error.message : String(error)
})
/** The storage provider, named from its endpoint when it is a known host, and the bucket. */
const storagePlace = computed(() => {
  const provider = storageProviderRegistry.get(activeStorageProviderID.value)
  const preferences = readStoragePreferences(activeStorageProviderID.value)
  const endpoint = preferences.endpoint?.trim()
  let label = provider.label
  if (endpoint) {
    try {
      const hostname = new URL(endpoint).hostname
      if (hostname.endsWith('.r2.cloudflarestorage.com')) label = storage.value.providerR2
      else if (hostname.includes('amazonaws.com')) label = storage.value.providerAmazonS3
      else if (hostname.includes('backblazeb2.com')) label = storage.value.providerBackblaze
      else if (hostname) label = storage.value.providerS3
    } catch {
      label = provider.label
    }
  }
  return { label, bucket: preferences.bucket?.trim() ?? '' }
})
const storagePreviewURL = storageWorkspace.previewURL
const vStoragePreview = storageWorkspace.previewDirective
const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase(locale.value))
const filteredRecentFiles = computed(() => {
  if (!normalizedQuery.value) return documents.value
  return documents.value.filter((document) =>
    `${document.name}\n${document.kind === 'local' ? document.path : document.documentId}`
      .toLocaleLowerCase(locale.value)
      .includes(normalizedQuery.value)
  )
})
const filteredStorageDocuments = computed(() => {
  if (!normalizedQuery.value) return storageDocuments.value
  return storageDocuments.value.filter((document) =>
    document.name.toLocaleLowerCase(locale.value).includes(normalizedQuery.value)
  )
})
/** Recent on Home; on a list, the place it shows. */
const heading = computed(() => {
  if (place === 'home') return files.value.recentTab
  if (inStorage.value) return storage.value.tab
  if (inServer.value) return serverAccount.value?.serverName ?? collaboration.value.serverTab
  if (inTrash.value) return files.value.trashPlace
  return files.value.localFiles
})
const hasRecentFiles = computed(() => documents.value.length > 0)

/** Documents never saved anywhere, listed on Home as Figma lists its drafts. */
const drafts = ref<DraftDocument[]>([])
async function refreshDrafts(): Promise<void> {
  drafts.value = place === 'home' ? await listDrafts() : []
}
onMounted(() => void refreshDrafts())
// Coming back to Home from a document picks up what changed there.
watch(activeTab, () => void refreshDrafts())
const filteredDrafts = computed(() =>
  normalizedQuery.value
    ? drafts.value.filter((draft) =>
        draft.name.toLocaleLowerCase(locale.value).includes(normalizedQuery.value)
      )
    : drafts.value
)
/** Said once there are drafts that a reload would lose. */
const draftsNotice = computed(() => {
  if (drafts.value.length === 0 || draftsPersist.value) return null
  return recoveryEnabled.value
    ? files.value.draftsNotKeptStorage
    : files.value.draftsNotKeptRecoveryOff
})

async function openDraftDocument(draft: DraftDocument): Promise<void> {
  openError.value = null
  try {
    await openDraft(draft)
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
    void refreshDrafts()
  }
}
/**
 * Deletes a draft no tab has open, with an Undo in the toast that says so, as Figma lets a
 * deleted file come back.
 */
async function deleteDraftDocument(draft: DraftDocument): Promise<void> {
  openError.value = null
  try {
    const deleted = await deleteDraft(draft)
    await refreshDrafts()
    if (!deleted) return
    toast.info(files.value.draftDeleted({ name: draft.name }), {
      label: commands.value.undo,
      run: () => void restoreDeletedDraft(deleted).then(refreshDrafts)
    })
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
    void refreshDrafts()
  }
}
/** Figma's Duplicate on a draft: a second draft, "<name> copy", listed with the others. */
async function duplicateDraftDocument(draft: DraftDocument): Promise<void> {
  openError.value = null
  try {
    await duplicateDraft(draft)
    await refreshDrafts()
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
  }
}
/** Figma's Duplicate on a file of this computer: a copy beside it, which then leads Recent. */
async function duplicateRecentFile(path: string): Promise<void> {
  openError.value = null
  try {
    if (!(await duplicateLocalFile(path))) toast.error(files.value.duplicateFolderUnsupported)
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
  }
}
const noSearchMatches = computed(
  () =>
    Boolean(normalizedQuery.value) &&
    !inServer.value &&
    !inTrash.value &&
    (inStorage.value
      ? filteredStorageDocuments.value.length
      : filteredRecentFiles.value.length + filteredDrafts.value.length) === 0
)
/** The file that leads the grid: the last one opened, while nothing is being searched. */
const leadID = computed(() => (normalizedQuery.value ? null : (documents.value[0]?.id ?? null)))

const GRID = 'grid grid-cols-1 gap-x-5 gap-y-[30px] sm:grid-cols-2 lg:grid-cols-4'
const LIST = 'overflow-hidden rounded-[14px] bg-card'

watch(recentFiles, () => void workspace.invalidate())

async function openRecent(document: RecentDocument): Promise<void> {
  openError.value = null
  try {
    if (document.kind === 'local') {
      await openFileFromPath(document.path)
      return
    }
    if (document.kind === 'server') {
      openServerDocumentById(document.documentId, document.name, document.serverURL)
      return
    }
    const storageDocument = storageDocuments.value.find(
      (candidate) => candidate.id === document.documentId
    )
    await openStorageDocumentInNewTab(
      storageDocument ?? {
        id: document.documentId,
        name: document.name,
        updatedAt: document.updatedAt
      }
    )
  } catch (error) {
    forgetRecentDocument(document.id)
    openError.value = error instanceof Error ? error.message : String(error)
  }
}

async function openStorageDocument(document: StorageDocument): Promise<void> {
  openError.value = null
  try {
    await openStorageDocumentInNewTab(document)
  } catch (error) {
    openError.value = error instanceof Error ? error.message : String(error)
  }
}

function formattedDate(updatedAt: string): string {
  const date = new Date(updatedAt)
  if (date.getTime() === 0) return ''
  return date.toLocaleString(locale.value)
}
</script>

<template>
  <section id="home-files" class="flex scroll-mt-14 flex-col gap-5">
    <div class="flex flex-wrap items-center gap-x-2.5 gap-y-3">
      <div class="flex min-w-0 flex-1 items-baseline gap-[22px]">
        <h2 id="home-files-heading" :class="filesHeading" data-test-id="home-files-heading">
          {{ heading }}
        </h2>
        <span v-if="inStorage && storageConfigured" :class="storageChip">
          <span class="size-[7px] shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span class="truncate">{{ storagePlace.label }}</span>
          <span v-if="storagePlace.bucket" class="truncate font-mono text-surface">
            {{ storagePlace.bucket }}
          </span>
        </span>
      </div>
      <div v-if="!inTrash" class="flex w-full items-center gap-1.5 sm:w-auto">
        <template v-if="inStorage">
          <IconButton
            :label="common.refresh"
            class="size-10 sm:size-8"
            @click="storageWorkspace.refresh"
          >
            <icon-hugeicons-refresh-cw class="size-3.5" />
          </IconButton>
          <IconButton
            :label="settings.title"
            class="size-10 sm:size-8"
            @click="openSettings('storage')"
          >
            <icon-hugeicons-settings-02 class="size-3.5" />
          </IconButton>
        </template>
        <template v-else-if="inServer">
          <HomeServerNotifications v-if="serverAccount && !serverSessionExpired" />
          <IconButton
            :label="common.refresh"
            class="size-10 sm:size-8"
            @click="serverList?.refresh()"
          >
            <icon-hugeicons-refresh-cw class="size-3.5" />
          </IconButton>
          <IconButton
            :label="settings.title"
            class="size-10 sm:size-8"
            @click="openSettings('server')"
          >
            <icon-hugeicons-settings-02 class="size-3.5" />
          </IconButton>
        </template>
        <IconButton
          v-else-if="hasRecentFiles"
          :label="common.clear"
          class="size-10 sm:size-8"
          data-test-id="recent-files-clear"
          @click="clearRecentFiles"
        >
          <icon-hugeicons-delete-02 class="size-3.5" />
        </IconButton>
        <SegmentedControl
          v-model="view"
          required
          :label="files.recentFiles"
          :size="isMobile ? 'touch' : 'md'"
          :options="[
            { value: 'grid', label: panels.gridView },
            { value: 'list', label: panels.listView }
          ]"
        >
          <template #option="{ option }">
            <icon-hugeicons-layout-grid v-if="option.value === 'grid'" class="size-3.5" />
            <icon-hugeicons-list v-else class="size-3.5" />
          </template>
        </SegmentedControl>
        <HomeSearchField v-model="query" class="min-w-0 flex-1 sm:w-[244px] sm:flex-none" />
      </div>
    </div>

    <div id="home-files-panel" aria-labelledby="home-files-heading" class="flex flex-col gap-3">
      <AppAlert v-if="openError" tone="error" :heading="openError" />
      <p
        v-if="noSearchMatches"
        class="rounded-[14px] bg-card px-4 py-8 text-center text-xs text-muted"
      >
        {{ files.noMatchingFiles({ query: query.trim() }) }}
      </p>

      <HomeServerTrash v-else-if="inTrash" />

      <HomeServerDocuments
        v-else-if="inServer"
        ref="serverList"
        :query="normalizedQuery"
        :view="view"
      />

      <template v-else-if="!inStorage">
        <!-- With nothing opened yet, the sample file stands in for the recent files. -->
        <AppAlert v-if="draftsNotice" tone="info" :heading="draftsNotice" />
        <div
          v-if="view === 'grid' || !(filteredRecentFiles.length || filteredDrafts.length)"
          :class="GRID"
        >
          <DocumentEntry
            v-for="draft in filteredDrafts"
            :key="draft.id"
            :name="draft.name"
            :badge="files.draftBadge"
            :metadata="formattedDate(draft.updatedAt)"
            data-test-id="home-draft"
            @open="openDraftDocument(draft)"
          >
            <template v-if="draft.snapshotId && !draft.tabId" #actions>
              <FileActions
                :name="draft.name"
                deletable
                @duplicate="duplicateDraftDocument(draft)"
                @delete="deleteDraftDocument(draft)"
              />
            </template>
          </DocumentEntry>
          <DocumentEntry
            v-for="document in filteredRecentFiles"
            :key="document.id"
            v-workspace-preview="document.id"
            :name="document.name"
            :metadata="formattedDate(document.updatedAt)"
            :previewURL="previewURL(document.id)"
            :lead="document.id === leadID"
            :class="document.id === leadID ? 'sm:col-span-2 lg:row-span-2' : undefined"
            @open="openRecent(document)"
          >
            <template v-if="document.kind === 'local'" #actions>
              <FileActions :name="document.name" @duplicate="duplicateRecentFile(document.path)" />
            </template>
          </DocumentEntry>
          <template v-if="!normalizedQuery">
            <HomeSampleTile />
            <div
              v-if="!hasRecentFiles && !drafts.length"
              class="flex flex-col justify-center gap-1 px-1 sm:px-3"
            >
              <p class="text-[13px] font-medium text-label">{{ files.noRecentFiles }}</p>
              <p class="text-xs text-muted">{{ files.noRecentFilesDescription }}</p>
            </div>
          </template>
        </div>
        <div v-else :class="LIST">
          <DocumentEntry
            v-for="draft in filteredDrafts"
            :key="draft.id"
            view="list"
            :name="draft.name"
            :badge="files.draftBadge"
            :metadata="formattedDate(draft.updatedAt)"
            data-test-id="home-draft"
            @open="openDraftDocument(draft)"
          >
            <template v-if="draft.snapshotId && !draft.tabId" #actions>
              <FileActions
                :name="draft.name"
                deletable
                @duplicate="duplicateDraftDocument(draft)"
                @delete="deleteDraftDocument(draft)"
              />
            </template>
          </DocumentEntry>
          <DocumentEntry
            v-for="document in filteredRecentFiles"
            :key="document.id"
            view="list"
            :name="document.name"
            :metadata="formattedDate(document.updatedAt)"
            @open="openRecent(document)"
          >
            <template v-if="document.kind === 'local'" #actions>
              <FileActions :name="document.name" @duplicate="duplicateRecentFile(document.path)" />
            </template>
          </DocumentEntry>
        </div>
      </template>

      <template v-else>
        <div
          v-if="storageLoading && storageDocuments.length === 0"
          :class="GRID"
          :aria-label="storage.loadingWorkspace"
        >
          <div
            v-for="index in 4"
            :key="index"
            class="min-w-0 animate-pulse motion-reduce:animate-none"
          >
            <div class="h-3 w-2/3 rounded bg-card" />
            <div class="mt-2 aspect-[16/10] rounded-[4px] bg-card" />
          </div>
        </div>

        <div
          v-else-if="storageError && storageDocuments.length === 0"
          class="rounded-[14px] border border-error-border px-4 py-6 text-center"
          role="alert"
        >
          <p class="text-xs text-error">{{ storageError }}</p>
          <AppButton variant="outline" class="mt-3" @click="storageWorkspace.refresh">
            {{ common.refresh }}
          </AppButton>
        </div>

        <div v-else-if="filteredStorageDocuments.length && view === 'grid'" :class="GRID">
          <DocumentEntry
            v-for="document in filteredStorageDocuments"
            :key="document.id"
            v-storage-preview="document.id"
            :name="document.name"
            :metadata="formattedDate(document.updatedAt)"
            :previewURL="storagePreviewURL(document.id)"
            @open="openStorageDocument(document)"
          />
        </div>

        <div v-else-if="filteredStorageDocuments.length" :class="LIST">
          <DocumentEntry
            v-for="document in filteredStorageDocuments"
            :key="document.id"
            view="list"
            :name="document.name"
            :metadata="formattedDate(document.updatedAt)"
            @open="openStorageDocument(document)"
          />
        </div>

        <div
          v-else-if="!storageConfigured"
          class="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
        >
          <p>{{ storage.notConfigured }}</p>
          <AppButton variant="outline" @click="openSettings('storage')">
            {{ settings.title }}
          </AppButton>
        </div>

        <div v-else class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted">
          {{ storage.emptyStorageWorkspace }}
        </div>
      </template>
    </div>
  </section>
</template>
