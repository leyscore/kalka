<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import { useDocumentWorkspace, useI18n, useViewportKind } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
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
import { openSettingsDialog } from '@/app/settings/dialog'
import { openFileFromPath } from '@/app/shell/menu/use'
import { createStorageWorkspaceSource } from '@/app/storage/workspace/source'
import { openStorageDocumentInNewTab } from '@/app/tabs'
import DocumentEntry from '@/components/home/document/DocumentEntry.vue'
import SampleDocumentEntry from '@/components/home/document/SampleDocumentEntry.vue'
import HomeSidebar from '@/components/home/HomeSidebar.vue'
import HomeLearn from '@/components/home/learn/HomeLearn.vue'
import HomePrompt from '@/components/home/prompt/HomePrompt.vue'
import HomeSearchActions from '@/components/home/search/HomeSearchActions.vue'
import HomeSearchField from '@/components/home/search/HomeSearchField.vue'
import HomeStart from '@/components/home/start/HomeStart.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import { homeHeading } from '@/theme/home/start'

const emit = defineEmits<{ 'new-document': [] }>()
const { panels, locale, storage, files, common, settings, welcome } = useI18n()
const identity = useCollabIdentity()
const { isMobile } = useViewportKind()
const view = useLocalStorage<'grid' | 'list'>('kalka:home-files-view', 'grid')
const query = ref('')
const openError = ref<string | null>(null)
const storageConfigured = ref(storagePreferencesComplete(activeStorageProviderID.value))

const workspace = useDocumentWorkspace<RecentDocument>({
  source: {
    async refresh() {
      return recentFiles.value
    },
    loadPreview(documentId) {
      const document = recentFiles.value.find((candidate) => candidate.id === documentId)
      if (!document) return Promise.resolve(null)
      if (document.kind === 'local') return loadRecentFileThumbnail(document.path)
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
const storageDescription = computed(() => {
  const provider = storageProviderRegistry.get(activeStorageProviderID.value)
  const preferences = readStoragePreferences(activeStorageProviderID.value)
  const bucket = preferences.bucket?.trim()
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
  return bucket ? `${label} · ${bucket}` : label
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
const hasRecentFiles = computed(() => documents.value.length > 0)
const noSearchMatches = computed(
  () =>
    Boolean(normalizedQuery.value) &&
    filteredRecentFiles.value.length === 0 &&
    filteredStorageDocuments.value.length === 0
)

watch(recentFiles, () => void workspace.invalidate())

async function openRecent(document: RecentDocument): Promise<void> {
  openError.value = null
  try {
    if (document.kind === 'local') {
      await openFileFromPath(document.path)
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
  <div class="relative flex min-h-0 flex-1 gap-2 text-surface md:px-2 md:pb-2">
    <HomeSidebar />
    <main
      class="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
      data-test-id="recent-files-home"
    >
      <div
        class="mx-auto flex w-full max-w-[1044px] flex-col gap-12 pt-8 pr-[max(1rem,env(safe-area-inset-right))] pb-12 pl-[max(1rem,env(safe-area-inset-left))] sm:px-8 sm:pt-14"
      >
        <section id="home-top" class="flex scroll-mt-14 flex-col gap-6">
          <header class="flex flex-wrap items-end justify-between gap-5">
            <h1
              class="font-display text-[clamp(30px,3.4vw,44px)] leading-none font-semibold tracking-[-0.035em] text-balance text-surface"
            >
              {{
                identity.hasChosenName.value
                  ? welcome.greeting({ name: identity.name.value })
                  : welcome.homeTitle
              }}
            </h1>
            <HomeSearchActions @new-document="emit('new-document')" />
          </header>
          <HomePrompt />
        </section>

        <HomeStart />

        <section id="home-files" class="flex scroll-mt-14 flex-col gap-3.5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 :class="homeHeading">{{ files.recentFiles }}</h2>
            <div class="flex w-full items-center gap-1.5 sm:w-auto">
              <IconButton
                v-if="hasRecentFiles"
                :label="common.clear"
                class="size-10 sm:size-8"
                data-test-id="recent-files-clear"
                @click="clearRecentFiles"
              >
                <icon-lucide-trash-2 class="size-3.5" />
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
                  <icon-lucide-layout-grid v-if="option.value === 'grid'" class="size-3.5" />
                  <icon-lucide-list v-else class="size-3.5" />
                </template>
              </SegmentedControl>
              <HomeSearchField v-model="query" class="min-w-0 flex-1 sm:w-[244px] sm:flex-none" />
            </div>
          </div>

          <p v-if="openError" class="text-xs text-danger" role="alert">{{ openError }}</p>
          <p
            v-if="noSearchMatches"
            class="rounded-[14px] bg-card px-4 py-8 text-center text-xs text-muted"
          >
            {{ files.noMatchingFiles({ query: query.trim() }) }}
          </p>

          <!-- With nothing opened yet, the sample file stands in for the recent files. -->
          <div
            v-else-if="view === 'grid' || !filteredRecentFiles.length"
            class="grid grid-cols-1 gap-x-2.5 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
          >
            <DocumentEntry
              v-for="document in filteredRecentFiles"
              :key="document.id"
              v-workspace-preview="document.id"
              :name="document.name"
              :metadata="formattedDate(document.updatedAt)"
              :previewURL="previewURL(document.id)"
              @open="openRecent(document)"
            />
            <template v-if="!normalizedQuery">
              <SampleDocumentEntry />
              <div
                v-if="!hasRecentFiles"
                class="flex flex-col justify-center gap-1 px-1 sm:h-[124px] sm:px-3"
              >
                <p class="text-[13px] font-medium text-label">{{ files.noRecentFiles }}</p>
                <p class="text-xs text-muted">{{ files.noRecentFilesDescription }}</p>
              </div>
            </template>
          </div>

          <div v-else class="overflow-hidden rounded-[14px] bg-card">
            <DocumentEntry
              v-for="document in filteredRecentFiles"
              :key="document.id"
              view="list"
              :name="document.name"
              :metadata="formattedDate(document.updatedAt)"
              @open="openRecent(document)"
            />
          </div>
        </section>

        <HomeLearn id="home-learn" class="scroll-mt-14" />

        <section class="flex flex-col gap-3.5">
          <div class="flex items-start gap-3">
            <div class="min-w-0">
              <h2 :class="homeHeading">{{ storage.workspace }}</h2>
              <p class="mt-0.5 truncate text-xs text-muted sm:whitespace-normal">
                {{ storageDescription }}
              </p>
            </div>
            <div class="ml-auto flex shrink-0 items-center gap-1">
              <IconButton
                :label="common.refresh"
                class="size-10 sm:size-8"
                @click="storageWorkspace.refresh"
              >
                <icon-lucide-refresh-cw class="size-3.5" />
              </IconButton>
              <IconButton
                :label="settings.title"
                class="size-10 sm:size-8"
                @click="openSettingsDialog('storage')"
              >
                <icon-lucide-settings-2 class="size-3.5" />
              </IconButton>
            </div>
          </div>

          <div
            v-if="storageLoading && storageDocuments.length === 0"
            class="grid grid-cols-1 gap-x-2.5 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
            :aria-label="storage.loadingWorkspace"
          >
            <div
              v-for="index in 3"
              :key="index"
              class="min-w-0 animate-pulse motion-reduce:animate-none"
            >
              <div class="h-[124px] rounded-[14px] bg-card" />
              <div class="mt-2.5 h-3 w-2/3 rounded bg-card" />
              <div class="mt-1.5 h-2.5 w-1/3 rounded bg-card" />
            </div>
          </div>

          <div
            v-else-if="storageError && storageDocuments.length === 0"
            class="rounded-[14px] border border-danger/40 px-4 py-6 text-center"
            role="alert"
          >
            <p class="text-xs text-danger">{{ storageError }}</p>
            <AppButton variant="outline" class="mt-3" @click="storageWorkspace.refresh">
              {{ common.refresh }}
            </AppButton>
          </div>

          <div
            v-else-if="filteredStorageDocuments.length && view === 'grid'"
            class="grid grid-cols-1 gap-x-2.5 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
          >
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

          <div
            v-else-if="filteredStorageDocuments.length"
            class="overflow-hidden rounded-[14px] bg-card"
          >
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
            <AppButton variant="outline" @click="openSettingsDialog('storage')">
              {{ settings.title }}
            </AppButton>
          </div>

          <div
            v-else-if="!normalizedQuery"
            class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
          >
            {{ storage.emptyStorageWorkspace }}
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
