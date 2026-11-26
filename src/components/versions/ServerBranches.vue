<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import type { ServerDocument } from '@/app/collab/server/api'
import { reviewServerMerge, reviewServerUpdate } from '@/app/collab/server/branch-review'
import {
  createServerBranch,
  listServerBranches,
  mergeServerBranch
} from '@/app/collab/server/branches'
import {
  fetchServerDocument,
  openServerDocument,
  serverDocuments
} from '@/app/collab/server/documents'
import { useEditorStore } from '@/app/editor/active-store'
import { toast } from '@/app/shell/ui'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppConfirmationDialog from '@/components/ui/dialog/AppConfirmationDialog.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

/**
 * Branches of a server file. In the main file: its branches, to open, and a new one made from
 * what is on screen. In a branch: the file it comes from, and merging into it, which asks first
 * when that file changed since the branch began.
 */
const { roomId } = defineProps<{ roomId: string }>()
const { panels } = useI18n()
const store = useEditorStore()

const document = ref<ServerDocument | null>(null)
const branches = ref<ServerDocument[]>([])
const name = ref('')
const busy = ref(false)
const error = ref('')
const confirmMerge = ref(false)

const mainDocument = ref<ServerDocument | null>(null)
const main = computed(() => {
  const id = document.value?.branchOf
  if (!id) return null
  return serverDocuments.value.find((known) => known.id === id) ?? mainDocument.value
})

async function act(action: () => Promise<unknown>) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await action()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    busy.value = false
  }
}

async function load() {
  await act(async () => {
    document.value = await fetchServerDocument(roomId)
    const { branchOf } = document.value
    branches.value = branchOf ? [] : await listServerBranches(roomId)
    mainDocument.value = branchOf ? await fetchServerDocument(branchOf) : null
  })
}
watch(() => roomId, load, { immediate: true })

function create() {
  const branch = name.value.trim()
  if (!branch) return
  void act(async () => {
    await createServerBranch(roomId, store, branch)
    name.value = ''
    branches.value = await listServerBranches(roomId)
  })
}

const labels = () => ({ branch: document.value?.name ?? '', main: main.value?.name ?? '' })

/** Reviews the branch's changes layer by layer before merging; a server too old merges whole. */
async function review() {
  let opened = true
  await act(async () => {
    opened = await reviewServerMerge(roomId, store, labels(), (merged) =>
      toast.info(panels.value.versionsServerBranchMerged({ name: merged.name }))
    )
  })
  if (!opened) merge(false)
}

function update() {
  void act(() =>
    reviewServerUpdate(roomId, store, {
      ...labels(),
      olderServer: panels.value.versionsServerBranchOlder
    })
  )
}

function merge(force: boolean) {
  confirmMerge.value = false
  void act(async () => {
    const result = await mergeServerBranch(roomId, store, force)
    if (result.status === 'main-changed') {
      confirmMerge.value = true
      return
    }
    toast.info(panels.value.versionsServerBranchMerged({ name: result.main.name }))
    openServerDocument(result.main)
  })
}
</script>

<template>
  <section class="flex flex-col gap-2 px-4 py-3" data-test-id="server-branches">
    <h3 class="text-[11px] font-semibold text-muted">{{ panels.versionsBranches }}</h3>
    <template v-if="document?.branchOf">
      <p class="flex items-center gap-1.5 text-xs text-surface">
        <icon-hugeicons-git-branch class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        {{ panels.versionsServerBranchOf({ name: main?.name ?? '' }) }}
      </p>
      <AppButton
        class="self-start"
        size="sm"
        color="primary"
        variant="solid"
        :loading="busy"
        data-test-id="server-branch-merge"
        @click="review"
      >
        {{ panels.versionsServerBranchMerge }}
      </AppButton>
      <AppButton
        class="self-start"
        size="sm"
        variant="outline"
        :disabled="busy || store.state.viewOnly"
        data-test-id="server-branch-update"
        @click="update"
      >
        {{ panels.versionsServerBranchUpdate }}
      </AppButton>
    </template>
    <template v-else-if="document">
      <p class="text-[11px] leading-relaxed text-muted">{{ panels.versionsServerBranchesHint }}</p>
      <ul v-if="branches.length" class="flex flex-col">
        <li
          v-for="branch in branches"
          :key="branch.id"
          class="flex h-7 items-center gap-1.5 text-xs"
          data-slot="server-branch"
        >
          <icon-hugeicons-git-branch class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-surface">{{ branch.name }}</span>
          <AppButton size="xs" variant="ghost" @click="openServerDocument(branch)">
            {{ panels.versionsBranchSwitch }}
          </AppButton>
        </li>
      </ul>
      <p v-else class="text-xs text-muted">{{ panels.versionsServerBranchNone }}</p>
      <form class="flex gap-2" @submit.prevent="create">
        <AppInput
          v-model="name"
          tone="panel"
          class="min-w-0 flex-1"
          autocomplete="off"
          :aria-label="panels.versionsBranchName"
          :placeholder="panels.versionsBranchName"
          data-test-id="server-branch-name"
        />
        <AppButton
          type="submit"
          size="sm"
          variant="outline"
          :disabled="!name.trim()"
          :loading="busy"
        >
          {{ panels.versionsBranchCreate }}
        </AppButton>
      </form>
    </template>
    <AppAlert v-if="error" tone="error" :heading="error" />
    <AppConfirmationDialog
      v-model:open="confirmMerge"
      tone="warning"
      :heading="panels.versionsServerBranchChangedTitle"
      :description="panels.versionsServerBranchChangedDescription"
      :cancel-label="panels.versionsCancel"
      :confirm-label="panels.versionsServerBranchMergeAnyway"
      @confirm="merge(true)"
    />
  </section>
</template>
