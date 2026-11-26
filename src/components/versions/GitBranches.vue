<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '@kalka/vue'

import type { DocumentVersions } from '@/app/document/versions/use'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

/**
 * A Kalka folder's branches: the one open, the others to open, review and merge, and a new one
 * started from what is on screen. Moving between branches or merging records the work here first.
 */
const { versions } = defineProps<{ versions: DocumentVersions }>()
const { panels } = useI18n()
const { branches, review, running } = versions
const name = ref('')

async function create() {
  const branch = name.value.trim()
  if (!branch) return
  await versions.createBranch(branch)
  if (!versions.error.value) name.value = ''
}

function open(branch: string) {
  void versions.switchBranch(branch, panels.value.versionsBeforeSwitch({ branch }))
}

function merge(branch: string) {
  void versions.mergeBranch(branch, panels.value.versionsBeforeMerge({ branch }))
}
</script>

<template>
  <section v-if="branches" class="flex flex-col pb-3" data-test-id="git-branches">
    <h3 class="px-4 pt-2 pb-1.5 text-[11px] font-semibold text-muted">
      {{ panels.versionsBranches }}
    </h3>
    <ul class="flex flex-col px-2">
      <li
        v-for="branch in branches.branches"
        :key="branch"
        class="flex h-7 items-center gap-1 rounded-md px-2 text-xs"
        data-slot="git-branch"
        :data-current="branch === branches.current || undefined"
      >
        <icon-hugeicons-git-branch class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-surface">{{ branch }}</span>
        <span v-if="branch === branches.current" class="text-[11px] text-muted">
          {{ panels.versionsBranchCurrent }}
        </span>
        <template v-else>
          <AppButton size="xs" variant="ghost" :disabled="running !== null" @click="open(branch)">
            {{ panels.versionsBranchSwitch }}
          </AppButton>
          <AppButton
            size="xs"
            variant="ghost"
            :disabled="running !== null"
            data-test-id="git-branch-review"
            @click="versions.reviewBranch(branch)"
          >
            {{ panels.versionsBranchReview }}
          </AppButton>
        </template>
      </li>
    </ul>
    <!-- What a branch changed, looked at before merging it into the one open. -->
    <div
      v-if="review"
      class="mx-4 mt-2 flex flex-col gap-2 rounded-lg border border-border p-2"
      data-test-id="git-branch-review"
    >
      <p class="text-[11px] text-muted">
        {{
          review.changes.length
            ? panels.versionsBranchChanges({ branch: review.branch })
            : panels.versionsBranchNoChanges
        }}
      </p>
      <ul v-if="review.changes.length" class="flex flex-col font-mono text-[11px]">
        <li v-for="change in review.changes" :key="change.path" class="flex gap-2">
          <span class="w-3 shrink-0 text-muted">{{ change.status }}</span>
          <span class="truncate text-surface">{{ change.path }}</span>
        </li>
      </ul>
      <div class="flex items-center gap-1">
        <AppButton size="xs" variant="ghost" @click="versions.closeReview()">
          {{ panels.versionsCancel }}
        </AppButton>
        <AppButton
          size="xs"
          variant="ghost"
          :disabled="running !== null"
          @click="versions.deleteBranch(review.branch)"
        >
          {{ panels.versionsBranchDelete }}
        </AppButton>
        <span class="flex-1" />
        <AppButton
          size="xs"
          color="primary"
          variant="solid"
          :disabled="!review.changes.length || running !== null"
          :loading="running === 'merge'"
          data-test-id="git-branch-merge"
          @click="merge(review.branch)"
        >
          {{ panels.versionsBranchMerge({ branch: branches.current ?? '' }) }}
        </AppButton>
      </div>
    </div>
    <form class="flex gap-2 px-4 pt-2" @submit.prevent="create">
      <AppInput
        v-model="name"
        tone="panel"
        class="min-w-0 flex-1"
        autocomplete="off"
        :aria-label="panels.versionsBranchName"
        :placeholder="panels.versionsBranchName"
        data-test-id="git-branch-name"
      />
      <AppButton
        type="submit"
        size="sm"
        variant="outline"
        :disabled="!name.trim()"
        :loading="running === 'branch'"
      >
        {{ panels.versionsBranchCreate }}
      </AppButton>
    </form>
  </section>
</template>
