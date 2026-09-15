import { tryOnMounted, tryOnScopeDispose } from '@vueuse/core'
import { isEqual } from 'es-toolkit'
import { computed, ref, watch, type Ref } from 'vue'

import {
  activeStorageProviderID,
  readStoragePreferences,
  storageCredentialStatuses,
  storageProviderRegistry,
  writeStoragePreference
} from '@/app/integrations/storage'
import { appCredentialServices } from '@/app/settings/credentials/app'
import { credentialRef } from '@/app/settings/credentials/reference'
import type { CredentialStatus } from '@/app/settings/credentials/types'
import { resumeStorageSync } from '@/app/storage/sync'

import { testStorageDraft } from './draft'

const storageSettingsServices = {
  readPreferences: readStoragePreferences,
  writePreference: writeStoragePreference,
  statuses: storageCredentialStatuses,
  manager: appCredentialServices.manager,
  test: testStorageDraft,
  resume: resumeStorageSync
}

export function useStorageSettings(
  credentialDrafts: Ref<Record<string, string>>,
  services = storageSettingsServices
) {
  const provider = computed(() => storageProviderRegistry.get(activeStorageProviderID.value))
  const preferenceDrafts = ref<Record<string, string>>({
    ...services.readPreferences(provider.value.id)
  })
  const initialPreferences = ref({ ...preferenceDrafts.value })
  const savedStatuses = ref<Record<string, CredentialStatus>>({})
  const cleared = ref<string[]>([])
  const operation = ref<'save' | 'test' | null>(null)
  const busy = computed(() => operation.value !== null)
  const error = ref('')
  const dirty = computed(
    () =>
      !isEqual(preferenceDrafts.value, initialPreferences.value) ||
      cleared.value.length > 0 ||
      Object.values(credentialDrafts.value).some((value) => value.length > 0)
  )
  const credentialStatuses = computed(() => ({
    ...savedStatuses.value,
    ...Object.fromEntries(cleared.value.map((field) => [field, 'missing' as const]))
  }))
  const configured = computed(
    () =>
      provider.value.preferenceFields.every(
        (field) =>
          !field.required || Boolean(services.readPreferences(provider.value.id)[field.id]?.trim())
      ) &&
      provider.value.credentialFields.every(
        (field) => !field.required || savedStatuses.value[field.id] === 'configured'
      )
  )
  let statusRequest = 0
  let version = 0
  let disposed = false

  tryOnScopeDispose(() => {
    disposed = true
    version++
    statusRequest++
    credentialDrafts.value = {}
  })

  function current(request: number) {
    return !disposed && request === version
  }

  async function refreshStatuses() {
    const request = ++statusRequest
    const target = provider.value
    try {
      const statuses = await services.statuses(target.id)
      if (!disposed && request === statusRequest && provider.value.id === target.id)
        savedStatuses.value = statuses
    } catch {
      if (!disposed && request === statusRequest && provider.value.id === target.id) {
        savedStatuses.value = Object.fromEntries(
          target.credentialFields.map((field) => [field.id, 'unavailable' as const])
        )
      }
    }
  }

  function reset() {
    version++
    preferenceDrafts.value = { ...services.readPreferences(provider.value.id) }
    initialPreferences.value = { ...preferenceDrafts.value }
    credentialDrafts.value = {}
    cleared.value = []
    error.value = ''
    void refreshStatuses()
  }

  function clearCredential(field: string) {
    if (busy.value || !provider.value.credentialFields.some((item) => item.id === field)) return
    credentialDrafts.value = { ...credentialDrafts.value, [field]: '' }
    cleared.value = [...new Set([...cleared.value, field])]
  }

  async function save(): Promise<boolean> {
    if (busy.value || disposed) return false
    operation.value = 'save'
    error.value = ''
    const request = ++version
    const target = provider.value
    const preferences = { ...preferenceDrafts.value }
    const credentials = { ...credentialDrafts.value }
    const removals = new Set(cleared.value)
    try {
      // Persistence spans preferences and the native credential store; it is not atomic.
      for (const field of target.preferenceFields)
        services.writePreference(target.id, field.id, preferences[field.id] ?? '')
      for (const field of target.credentialFields) {
        if (!current(request)) return false
        const reference = credentialRef(target.id, field.id)
        const replacement = credentials[field.id]?.trim()
        if (replacement) await services.manager.set(reference, replacement)
        else if (removals.has(field.id)) await services.manager.clear(reference)
      }
      if (!current(request)) return false
      reset()
      void services
        .resume()
        .catch(() =>
          console.warn('[Storage] Could not resume synchronization after saving settings')
        )
      return true
    } catch (cause) {
      if (current(request)) {
        error.value = cause instanceof Error ? cause.message : String(cause)
        await refreshStatuses()
      }
      return false
    } finally {
      operation.value = null
    }
  }

  async function testConnection() {
    if (busy.value || disposed) return null
    operation.value = 'test'
    const request = version
    const target = provider.value.id
    const credentials = { ...credentialDrafts.value }
    const removals = cleared.value.filter((field) => !credentials[field]?.trim())
    try {
      const result = await services.test(
        target,
        { ...preferenceDrafts.value },
        credentials,
        removals
      )
      return current(request) ? result : null
    } catch (cause) {
      return current(request)
        ? { ok: false as const, message: cause instanceof Error ? cause.message : String(cause) }
        : null
    } finally {
      operation.value = null
    }
  }

  watch(activeStorageProviderID, () => {
    savedStatuses.value = {}
    reset()
  })
  tryOnMounted(() => void refreshStatuses())

  return {
    provider,
    preferenceDrafts,
    credentialStatuses,
    operation,
    busy,
    configured,
    dirty,
    error,
    begin: reset,
    cancel: reset,
    save,
    clearCredential,
    testConnection
  }
}
