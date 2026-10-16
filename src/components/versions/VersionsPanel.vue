<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useDocumentVersions } from '@/app/document/versions/use'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

const { panels } = useI18n()
const store = useEditorStore()
const versions = useDocumentVersions(store)
const { state, status, changes, history, unsaved, running, error, message, canCommit } = versions

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** A porcelain status as a single letter and the kind of change it is. */
function changeKind(code: string): { letter: string; kind: string } {
  if (code === '??') return { letter: 'N', kind: 'added' }
  if (code.includes('U')) return { letter: '!', kind: 'conflict' }
  if (code.includes('D')) return { letter: 'D', kind: 'deleted' }
  if (code.includes('A')) return { letter: 'A', kind: 'added' }
  if (code.includes('R')) return { letter: 'R', kind: 'modified' }
  return { letter: 'M', kind: 'modified' }
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col" data-test-id="versions-panel">
    <div v-if="state === 'unsaved' || state === 'untracked'" class="flex flex-col gap-3 px-4 py-3">
      <p class="text-xs leading-relaxed text-muted">
        {{ state === 'unsaved' ? panels.versionsUnsaved : panels.versionsUntracked }}
      </p>
      <AppButton
        v-if="state === 'untracked'"
        class="self-start"
        size="sm"
        variant="outline"
        :loading="running === 'init'"
        data-test-id="versions-start"
        @click="versions.start"
      >
        {{ panels.versionsStart }}
      </AppButton>
    </div>

    <template v-else-if="state === 'tracked' && status">
      <header class="flex shrink-0 items-center gap-2 px-4 pt-1 pb-2 text-xs">
        <icon-lucide-git-branch class="size-3.5 shrink-0 text-muted" />
        <span class="min-w-0 flex-1 truncate font-medium text-surface">
          {{ status.branch ?? panels.versionsDetached }}
        </span>
        <AppButton
          v-if="status.upstream"
          size="xs"
          variant="ghost"
          :loading="running === 'pull'"
          @click="versions.pull"
        >
          {{ panels.versionsPull }}
        </AppButton>
        <AppButton
          v-if="status.upstream"
          size="xs"
          variant="ghost"
          :loading="running === 'push'"
          :disabled="status.ahead === 0"
          @click="versions.push"
        >
          {{ panels.versionsPush }}
        </AppButton>
      </header>
      <p
        v-if="status.upstream && (status.ahead || status.behind)"
        class="px-4 pb-2 font-mono text-[11px] text-muted"
      >
        {{ panels.versionsSync({ ahead: status.ahead, behind: status.behind }) }}
      </p>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <h3 class="px-4 pt-2 pb-1.5 text-[11px] font-semibold text-muted">
          {{ panels.versionsChanges }}
        </h3>
        <ul v-if="changes.length" class="flex flex-col px-2" data-test-id="versions-changes">
          <li
            v-for="change in changes"
            :key="change.path"
            class="flex h-7 items-center gap-2 rounded-md px-2 text-xs"
          >
            <span
              class="w-3 shrink-0 font-mono text-[11px] font-semibold data-[kind=added]:text-success data-[kind=conflict]:text-error data-[kind=deleted]:text-error data-[kind=modified]:text-primary"
              :data-kind="changeKind(change.status).kind"
              >{{ changeKind(change.status).letter }}</span
            >
            <span class="min-w-0 flex-1 truncate text-surface">{{ change.path }}</span>
          </li>
        </ul>
        <p v-else class="px-4 text-xs text-muted">{{ panels.versionsNoChanges }}</p>
        <p v-if="unsaved" class="px-4 pt-2 text-[11px] leading-relaxed text-muted">
          {{ panels.versionsUnsavedChanges }}
        </p>

        <form class="flex flex-col gap-2 px-4 pt-3 pb-4" @submit.prevent="versions.commit">
          <AppInput
            v-model="message"
            tone="panel"
            :aria-label="panels.versionsMessage"
            :placeholder="panels.versionsMessagePlaceholder"
            data-test-id="versions-message"
          />
          <AppButton
            type="submit"
            color="primary"
            variant="solid"
            size="sm"
            :disabled="!canCommit"
            :loading="running === 'commit'"
            data-test-id="versions-commit"
          >
            {{ panels.versionsCommit }}
          </AppButton>
        </form>

        <h3 class="px-4 pt-1 pb-1.5 text-[11px] font-semibold text-muted">
          {{ panels.versionsHistory }}
        </h3>
        <ol v-if="history.length" class="flex flex-col px-2 pb-4" data-test-id="versions-history">
          <li v-for="commit in history" :key="commit.hash" class="rounded-md px-2 py-1.5">
            <p class="truncate text-xs text-surface">{{ commit.subject }}</p>
            <p class="truncate text-[11px] text-muted">
              {{ commit.author }} · {{ dateFormat.format(commit.time * 1000) }}
            </p>
          </li>
        </ol>
        <p v-else class="px-4 pb-4 text-xs text-muted">{{ panels.versionsNoHistory }}</p>
      </div>
    </template>

    <AppAlert v-if="error" tone="error" :heading="error" class="mx-4 mb-3" />
  </div>
</template>
