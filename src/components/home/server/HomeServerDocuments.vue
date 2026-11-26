<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed, onMounted, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { serverAccount, serverSessionExpired } from '@/app/collab/server/account'
import { groupServerBranches, type ServerDocument } from '@/app/collab/server/api'
import {
  openServerDocument,
  refreshServerDocuments,
  serverDocuments,
  serverDocumentsLoading,
  trashServerDocument
} from '@/app/collab/server/documents'
import { serverProblem, type ServerProblem } from '@/app/collab/server/problem'
import { openSettings } from '@/app/settings/open'
import { toast } from '@/app/shell/ui'
import DocumentEntry from '@/components/home/document/DocumentEntry.vue'
import { serverProblemText } from '@/components/settings/server/problemText'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'

/** The files on the signed-in Kalka server; opening one joins its room in a tab of its own. */
const { query, view } = defineProps<{ query: string; view: 'grid' | 'list' }>()
const { collaboration, files, locale, settings } = useI18n()
const problem = ref<ServerProblem | null>(null)
const error = computed(() =>
  problem.value ? serverProblemText(collaboration.value, problem.value) : null
)

const signedIn = computed(() => serverAccount.value !== null && !serverSessionExpired.value)
/** Viewers cannot delete; editors and administrators move files to the trash. */
const canDelete = computed(() => serverAccount.value?.user.role !== 'viewer')
const menu = useMenuUI()
const item = menuItem()

async function moveToTrash(document: ServerDocument) {
  try {
    await trashServerDocument(document.id)
    toast.info(files.value.movedToTrash({ name: document.name }))
  } catch (reason) {
    toast.error(reason instanceof Error ? reason.message : String(reason))
  }
}
const grouped = computed(() => groupServerBranches(serverDocuments.value))
const branchesOf = computed(() => grouped.value.branches)

const matches = (document: ServerDocument) =>
  document.name.toLocaleLowerCase(locale.value).includes(query)

/** The main files; a search also finds a file by one of its branches. */
const filtered = computed(() =>
  grouped.value.files.filter(
    (document) =>
      !query || matches(document) || (branchesOf.value.get(document.id) ?? []).some(matches)
  )
)

function branchBadge(document: ServerDocument): string | undefined {
  const count = branchesOf.value.get(document.id)?.length ?? 0
  return count > 0 ? collaboration.value.serverBranchBadge({ count }) : undefined
}

async function refresh() {
  if (!signedIn.value) return
  problem.value = null
  try {
    await refreshServerDocuments()
  } catch (reason) {
    problem.value = serverProblem(reason)
  }
}

onMounted(refresh)
useIntervalFn(refresh, 60_000)
defineExpose({ refresh })

const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }

function formattedDate(updatedAt: number): string {
  return new Date(updatedAt).toLocaleString(locale.value, DATE_FORMAT)
}

function open(document: ServerDocument) {
  openServerDocument(document)
}

const GRID = 'grid grid-cols-1 gap-x-5 gap-y-[30px] sm:grid-cols-2 lg:grid-cols-4'
const LIST = 'overflow-hidden rounded-[14px] bg-card'
</script>

<template>
  <div
    v-if="!signedIn"
    class="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
  >
    <p>
      {{
        serverSessionExpired ? collaboration.serverSessionExpired : collaboration.serverNotSignedIn
      }}
    </p>
    <AppButton variant="outline" @click="openSettings('server')">{{ settings.title }}</AppButton>
  </div>

  <AppAlert v-else-if="error" tone="error" :heading="error" data-test-id="home-server-error" />

  <div
    v-if="signedIn && serverDocumentsLoading && !serverDocuments.length"
    class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
    role="status"
  >
    {{ collaboration.serverLoadingFiles }}
  </div>

  <div
    v-else-if="signedIn && filtered.length"
    :class="view === 'grid' ? GRID : LIST"
    data-test-id="home-server-files"
  >
    <DocumentEntry
      v-for="document in filtered"
      :key="document.id"
      :view="view === 'list' ? 'list' : undefined"
      :name="document.name"
      :metadata="formattedDate(document.updatedAt)"
      :badge="branchBadge(document)"
      :data-branches="branchesOf.get(document.id)?.length"
      @open="open(document)"
    >
      <template v-if="canDelete || branchesOf.has(document.id)" #actions>
        <DropdownMenuRoot>
          <DropdownMenuTrigger as-child>
            <IconButton
              :label="files.fileActions({ name: document.name })"
              class="bg-white/90 shadow-sm"
            >
              <icon-hugeicons-more-horizontal class="size-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" :side-offset="6" :class="menu.content">
              <DropdownMenuItem
                v-for="branch in branchesOf.get(document.id) ?? []"
                :key="branch.id"
                :class="item"
                data-test-id="home-server-branch"
                @select="open(branch)"
              >
                <icon-hugeicons-git-branch class="size-3.5 text-muted" aria-hidden="true" />
                {{ collaboration.serverOpenBranch({ name: branch.name }) }}
              </DropdownMenuItem>
              <DropdownMenuItem v-if="canDelete" :class="item" @select="moveToTrash(document)">
                {{ files.moveToTrash }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </template>
    </DocumentEntry>
  </div>

  <p
    v-else-if="signedIn && query && serverDocuments.length"
    class="rounded-[14px] bg-card px-4 py-8 text-center text-xs text-muted"
  >
    {{ files.noMatchingFiles({ query }) }}
  </p>

  <div
    v-else-if="signedIn && !serverDocumentsLoading && !error"
    class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
  >
    {{ collaboration.serverNoDocuments({ server: serverAccount?.serverName ?? '' }) }}
  </div>
</template>
