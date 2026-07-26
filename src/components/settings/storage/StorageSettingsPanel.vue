<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from '@open-pencil/vue'

import {
  activeStorageProviderID,
  createActiveStorageAdapter,
  readStoragePreferences,
  storageCredentialStatuses,
  storageProviderRegistry,
  writeStoragePreference
} from '@/app/integrations/storage'
import { appCredentialServices } from '@/app/settings/credentials/app'
import { credentialRef } from '@/app/settings/credentials/reference'
import type { CredentialStatus } from '@/app/settings/credentials/types'
import AppInput from '@/components/ui/AppInput.vue'

const { dialogs } = useI18n()
const provider = storageProviderRegistry.get(activeStorageProviderID.value)
const preferenceDrafts = ref<Record<string, string>>({ ...readStoragePreferences(provider.id) })
const credentialDrafts = ref<Record<string, string>>({})
const credentialStatuses = ref<Record<string, CredentialStatus>>({})
const busy = ref(false)
const result = ref<{ ok: boolean; message: string } | null>(null)

function preferenceLabel(field: string): string {
  if (field === 'endpoint') return dialogs.value.storageEndpoint
  if (field === 'bucket') return dialogs.value.storageBucket
  if (field === 'region') return dialogs.value.storageRegion
  return field
}

function credentialLabel(field: string): string {
  if (field === 'access-key-id') return dialogs.value.storageAccessKeyID
  if (field === 'secret-access-key') return dialogs.value.storageSecretAccessKey
  return field
}

async function refreshStatuses(): Promise<void> {
  credentialStatuses.value = await storageCredentialStatuses(provider.id)
}

function savePreferences(): void {
  for (const field of provider.preferenceFields) {
    writeStoragePreference(provider.id, field.id, preferenceDrafts.value[field.id] ?? '')
  }
}

async function saveCredential(field: string): Promise<void> {
  const value = credentialDrafts.value[field]?.trim()
  if (!value) return
  await appCredentialServices.manager.set(credentialRef(provider.id, field), value)
  credentialDrafts.value[field] = ''
  await refreshStatuses()
}

async function clearCredential(field: string): Promise<void> {
  await appCredentialServices.manager.clear(credentialRef(provider.id, field))
  credentialDrafts.value[field] = ''
  await refreshStatuses()
}

async function testConnection(): Promise<void> {
  busy.value = true
  result.value = null
  try {
    savePreferences()
    for (const field of provider.credentialFields) {
      await saveCredential(field.id)
    }
    result.value = await createActiveStorageAdapter(provider.id).testConnection()
  } catch (error) {
    result.value = {
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    }
  } finally {
    busy.value = false
  }
}

onMounted(() => void refreshStatuses())
</script>

<template>
  <section class="flex flex-col gap-3" data-test-id="settings-storage-panel">
    <div>
      <h3 class="text-xs font-semibold text-surface">{{ dialogs.settingsStorage }}</h3>
      <p class="mt-0.5 text-[10px] text-muted">{{ provider.description }}</p>
    </div>

    <label
      v-for="field in provider.preferenceFields"
      :key="field.id"
      class="flex flex-col gap-1 text-[10px] text-muted"
    >
      {{ preferenceLabel(field.id) }}
      <AppInput
        v-model="preferenceDrafts[field.id]"
        :placeholder="field.placeholder"
        size="sm"
        tone="panel"
        @change="savePreferences"
      />
    </label>

    <div
      v-for="field in provider.credentialFields"
      :key="field.id"
      class="flex flex-col gap-1"
      :data-credential="field.id"
    >
      <label class="text-[10px] text-muted">
        {{ credentialLabel(field.id) }}
      </label>
      <div class="flex gap-2">
        <AppInput
          v-model="credentialDrafts[field.id]"
          type="password"
          :placeholder="
            credentialStatuses[field.id] === 'configured'
              ? dialogs.keySavedReplace
              : field.placeholder
          "
          size="sm"
          tone="panel"
          class="min-w-0 flex-1"
          @enter="saveCredential(field.id)"
        />
        <button
          v-if="credentialDrafts[field.id]?.trim()"
          type="button"
          class="rounded bg-hover px-2 text-[10px] text-surface hover:bg-active"
          @click="saveCredential(field.id)"
        >
          {{ dialogs.save }}
        </button>
        <button
          v-else-if="credentialStatuses[field.id] === 'configured'"
          type="button"
          class="rounded px-2 text-[10px] text-muted hover:bg-hover hover:text-surface"
          @click="clearCredential(field.id)"
        >
          {{ dialogs.clear }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="mt-1 rounded bg-accent px-3 py-1.5 text-[11px] font-medium text-white hover:bg-accent/90 disabled:opacity-50"
      :disabled="busy"
      data-test-id="settings-storage-test"
      @click="testConnection"
    >
      {{ dialogs.testConnection }}
    </button>

    <p
      v-if="result"
      class="rounded border border-border bg-panel px-2 py-1.5 text-[10px] text-muted data-[state=success]:text-success data-[state=error]:text-danger"
      :data-state="result.ok ? 'success' : 'error'"
      role="status"
    >
      {{ result.message }}
    </p>
  </section>
</template>
