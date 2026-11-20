<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { serverAccount, serverSessionExpired } from '@/app/collab/server/account'
import type { ServerDocument } from '@/app/collab/server/api'
import {
  openServerDocument,
  refreshServerDocuments,
  serverDocuments,
  serverDocumentsLoading
} from '@/app/collab/server/documents'
import { openSettings } from '@/app/settings/open'
import DocumentEntry from '@/components/home/document/DocumentEntry.vue'
import AppButton from '@/components/ui/button/AppButton.vue'

/** The files on the signed-in Kalka server; opening one joins its room in a tab of its own. */
const { query, view } = defineProps<{ query: string; view: 'grid' | 'list' }>()
const { collaboration, locale, settings } = useI18n()
const error = ref<string | null>(null)

const signedIn = computed(() => serverAccount.value !== null && !serverSessionExpired.value)
const filtered = computed(() =>
  query
    ? serverDocuments.value.filter((document) =>
        document.name.toLocaleLowerCase(locale.value).includes(query)
      )
    : serverDocuments.value
)

async function refresh() {
  if (!signedIn.value) return
  error.value = null
  try {
    await refreshServerDocuments()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}

onMounted(refresh)
useIntervalFn(refresh, 60_000)
defineExpose({ refresh })

function formattedDate(updatedAt: number): string {
  return new Date(updatedAt).toLocaleString(locale.value)
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

  <p v-else-if="error && !serverDocuments.length" class="text-xs text-danger" role="alert">
    {{ error }}
  </p>

  <div
    v-else-if="serverDocumentsLoading && !serverDocuments.length"
    class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted"
  >
    …
  </div>

  <div
    v-else-if="filtered.length"
    :class="view === 'grid' ? GRID : LIST"
    data-test-id="home-server-files"
  >
    <DocumentEntry
      v-for="document in filtered"
      :key="document.id"
      :view="view === 'list' ? 'list' : undefined"
      :name="document.name"
      :metadata="formattedDate(document.updatedAt)"
      @open="open(document)"
    />
  </div>

  <div v-else class="rounded-[14px] bg-card px-4 py-3 text-[13px] text-muted">
    {{ collaboration.serverNoDocuments({ server: serverAccount?.serverName ?? '' }) }}
  </div>
</template>
