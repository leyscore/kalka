<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { useHistorySource } from '@/app/document/versions/checkpoints/use'
import { changeKind, type GitCommit } from '@/app/document/versions/git'
import { useNamedVersionFocus } from '@/app/document/versions/save-request'
import { useDocumentVersions, type DocumentVersions } from '@/app/document/versions/use'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import CheckpointHistory from '@/components/versions/CheckpointHistory.vue'
import GitBranches from '@/components/versions/GitBranches.vue'
import ServerBranches from '@/components/versions/ServerBranches.vue'
import { versionTimeline } from '@/theme/panel/folder'

const { panels } = useI18n()
const store = useEditorStore()
/** The folder panel reads the same repository and passes its own, so Git is asked once. */
const { versions: shared } = defineProps<{ versions?: DocumentVersions }>()
const versions = shared ?? useDocumentVersions(store)
const {
  state,
  status,
  changes,
  history,
  remote,
  needsIdentity,
  unsaved,
  running,
  error,
  message,
  canCommit,
  bursts
} = versions

/** Restores a version, recording what is there now first, as the history says it does. */
function restore(commit: GitCommit): void {
  void versions.restore(commit, {
    before: panels.value.versionsBeforeRestore({ subject: commit.subject }),
    restored: panels.value.versionsRestored({ subject: commit.subject })
  })
}

/**
 * A server file lists its branches here; a file Git does not keep still has a history: versions
 * kept on this device as it is edited.
 */
const { serverRoomId, checkpoints } = useHistorySource(store)

const timeline = versionTimeline()
useNamedVersionFocus(useTemplateRef<HTMLElement>('commitForm'))
const remoteURL = ref('')
const identityName = ref('')
const identityEmail = ref('')

async function connect(): Promise<void> {
  await versions.connect(remoteURL.value)
  if (!versions.error.value) remoteURL.value = ''
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col" data-test-id="versions-panel">
    <template v-if="serverRoomId">
      <ServerBranches :room-id="serverRoomId" />
      <CheckpointHistory :key="serverRoomId" :server-room-id="serverRoomId" />
    </template>
    <div
      v-else-if="state === 'unsaved' || state === 'untracked'"
      class="flex flex-col gap-3 px-4 py-3"
    >
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
    <CheckpointHistory
      v-if="!serverRoomId && checkpoints && (state === 'unsaved' || state === 'untracked')"
    />

    <template v-else-if="state === 'tracked' && status">
      <header class="flex shrink-0 items-center gap-2 px-4 pt-1 pb-2 text-xs">
        <icon-hugeicons-git-branch class="size-3.5 shrink-0 text-muted" />
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
          v-if="remote"
          size="xs"
          variant="ghost"
          data-test-id="versions-push"
          :loading="running === 'push'"
          :disabled="Boolean(status.upstream) && status.ahead === 0"
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
        <GitBranches :versions="versions" />
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

        <form
          v-if="needsIdentity"
          class="flex flex-col gap-2 px-4 pt-3"
          data-test-id="versions-identity"
          @submit.prevent="versions.saveIdentity(identityName, identityEmail)"
        >
          <p class="text-[11px] leading-relaxed text-muted">{{ panels.versionsIdentityHint }}</p>
          <AppInput
            v-model="identityName"
            tone="panel"
            autocomplete="name"
            :aria-label="panels.versionsIdentityName"
            :placeholder="panels.versionsIdentityName"
          />
          <AppInput
            v-model="identityEmail"
            tone="panel"
            autocomplete="email"
            inputmode="email"
            :aria-label="panels.versionsIdentityEmail"
            :placeholder="panels.versionsIdentityEmail"
          />
          <AppButton
            type="submit"
            variant="outline"
            size="sm"
            :disabled="!identityName.trim() || !identityEmail.trim()"
            :loading="running === 'identity'"
          >
            {{ panels.versionsIdentitySave }}
          </AppButton>
        </form>

        <form
          ref="commitForm"
          class="flex flex-col gap-2 px-4 pt-3 pb-4"
          @submit.prevent="versions.commit"
        >
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

        <form
          v-if="!remote"
          class="flex flex-col gap-2 px-4 pb-4"
          data-test-id="versions-connect"
          @submit.prevent="connect"
        >
          <h3 class="text-[11px] font-semibold text-muted">{{ panels.versionsRemote }}</h3>
          <p class="text-[11px] leading-relaxed text-muted">{{ panels.versionsRemoteHint }}</p>
          <AppInput
            v-model="remoteURL"
            tone="panel"
            name="repository-url"
            autocomplete="off"
            :aria-label="panels.versionsRemoteAddress"
            placeholder="https://github.com/…/….git"
          />
          <AppButton
            type="submit"
            variant="outline"
            size="sm"
            :disabled="!remoteURL.trim()"
            :loading="running === 'connect'"
          >
            {{ panels.versionsRemoteConnect }}
          </AppButton>
        </form>
        <p
          v-else
          class="truncate px-4 pb-3 font-mono text-[11px] text-muted"
          data-test-id="versions-remote"
        >
          {{ remote }}
        </p>

        <h3 class="px-4 pt-1 pb-1.5 text-[11px] font-semibold text-muted">
          {{ panels.versionsHistory }}
        </h3>
        <!-- A timeline: each version a point on one line, the latest on top. -->
        <!-- Versions in bursts: one stretch of work by a person, with the agents that helped. -->
        <div v-if="history.length" data-test-id="versions-history">
          <section
            v-for="burst in bursts"
            :key="burst.commits[0].hash"
            data-slot="version-burst"
            :data-agents="burst.agents.length > 0 || undefined"
          >
            <p class="flex items-center gap-1 px-4 pt-1 pb-1 text-[11px] text-muted">
              <span class="truncate font-medium text-surface">{{ burst.author }}</span>
              <template v-if="burst.agents.length">
                <icon-hugeicons-ai-magic class="size-3 shrink-0" />
                <span class="truncate">{{
                  panels.versionsWithAgents({ names: burst.agents.join(', ') })
                }}</span>
              </template>
              <span class="flex-1" />
              <span v-if="burst.commits.length > 1" class="shrink-0">{{
                panels.versionsBurst({ count: burst.commits.length })
              }}</span>
            </p>
            <ol :class="timeline.list()">
              <li
                v-for="commit in burst.commits"
                :key="commit.hash"
                :class="timeline.item()"
                class="group"
                data-slot="version"
              >
                <span
                  :class="timeline.point()"
                  :data-latest="commit.hash === history[0]?.hash || undefined"
                />
                <div class="flex items-start gap-2">
                  <div class="min-w-0 flex-1">
                    <p :class="timeline.subject()">{{ commit.subject }}</p>
                    <p :class="timeline.detail()">{{ dateFormat.format(commit.time * 1000) }}</p>
                  </div>
                  <AppButton
                    v-if="commit.hash !== history[0]?.hash"
                    size="xs"
                    variant="ghost"
                    class="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    data-slot="version-restore"
                    :aria-label="panels.versionsRestoreLabel({ subject: commit.subject })"
                    :disabled="running !== null"
                    @click="restore(commit)"
                  >
                    {{ panels.versionsRestore }}
                  </AppButton>
                </div>
              </li>
            </ol>
          </section>
        </div>
        <p v-else class="px-4 pb-4 text-xs text-muted">{{ panels.versionsNoHistory }}</p>
      </div>
    </template>

    <AppAlert v-if="error" tone="error" :heading="error" class="mx-4 mb-3" />
  </div>
</template>
