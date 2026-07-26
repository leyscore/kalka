import { useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import {
  AI_PROVIDERS,
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  IS_TAURI
} from '@open-pencil/core/constants'
import type { AIProviderID } from '@open-pencil/core/constants'
import { setPexelsApiKey, setUnsplashAccessKey } from '@open-pencil/core/tools'

import {
  appCredentialServices,
  browserCredentialsRemembered,
  setBrowserCredentialPersistence
} from '@/app/settings/credentials/app'
import {
  initializeCredentialMigration,
  PEXELS_CREDENTIAL,
  providerCredentialRef,
  UNSPLASH_CREDENTIAL
} from '@/app/settings/credentials/migration'
import type { CredentialRef, CredentialStatus } from '@/app/settings/credentials/types'

const STORAGE_PREFIX = 'open-pencil:'

export const providerID = useLocalStorage<AIProviderID>(
  `${STORAGE_PREFIX}ai-provider`,
  DEFAULT_AI_PROVIDER
)
export const modelID = useLocalStorage(`${STORAGE_PREFIX}ai-model`, DEFAULT_AI_MODEL)
export const customBaseURL = useLocalStorage(`${STORAGE_PREFIX}ai-base-url`, '')
export const customModelID = useLocalStorage(`${STORAGE_PREFIX}ai-custom-model`, '')
export const customAPIType = useLocalStorage<'completions' | 'responses'>(
  `${STORAGE_PREFIX}ai-api-type`,
  'completions'
)
export const maxOutputTokens = useLocalStorage(`${STORAGE_PREFIX}ai-max-output-tokens`, 16384)

export const apiKeyStatus = ref<CredentialStatus>('missing')
export const pexelsKeyStatus = ref<CredentialStatus>('missing')
export const unsplashKeyStatus = ref<CredentialStatus>('missing')
const credentialRevision = ref(0)

export const providerDef = computed(
  () => AI_PROVIDERS.find((provider) => provider.id === providerID.value) ?? AI_PROVIDERS[0]
)

export const isACPProvider = computed(() => providerID.value.startsWith('acp:'))

export const isConfigured = computed(() => {
  if (isACPProvider.value) return IS_TAURI
  if (apiKeyStatus.value !== 'configured') return false
  const needsBaseURL =
    providerID.value === 'openai-compatible' || providerID.value === 'anthropic-compatible'
  return !needsBaseURL || Boolean(customBaseURL.value)
})

async function refreshStatus(reference: CredentialRef): Promise<CredentialStatus> {
  return appCredentialServices.manager.status(reference)
}

async function refreshProviderStatus(provider: AIProviderID): Promise<void> {
  if (provider.startsWith('acp:')) {
    apiKeyStatus.value = 'missing'
    return
  }
  const status = await refreshStatus(providerCredentialRef(provider))
  if (providerID.value === provider) apiKeyStatus.value = status
}

async function refreshMediaCredentials(): Promise<void> {
  const [pexelsStatus, unsplashStatus] = await Promise.all([
    refreshStatus(PEXELS_CREDENTIAL),
    refreshStatus(UNSPLASH_CREDENTIAL)
  ])
  pexelsKeyStatus.value = pexelsStatus
  unsplashKeyStatus.value = unsplashStatus
  setPexelsApiKey(
    pexelsStatus === 'configured'
      ? await appCredentialServices.resolver.resolve(PEXELS_CREDENTIAL)
      : null
  )
  setUnsplashAccessKey(
    unsplashStatus === 'configured'
      ? await appCredentialServices.resolver.resolve(UNSPLASH_CREDENTIAL)
      : null
  )
}

export const credentialsReady = initializeCredentialMigration().then(async () => {
  await Promise.all([refreshProviderStatus(providerID.value), refreshMediaCredentials()])
  return undefined
})

export async function resolveAPIKey(provider = providerID.value): Promise<string | null> {
  await credentialsReady
  if (provider.startsWith('acp:')) return null
  return appCredentialServices.resolver.resolve(providerCredentialRef(provider))
}

export async function setAPIKey(key: string): Promise<void> {
  if (providerID.value.startsWith('acp:')) return
  const reference = providerCredentialRef(providerID.value)
  const value = key.trim()
  if (value) await appCredentialServices.manager.set(reference, value)
  else await appCredentialServices.manager.clear(reference)
  apiKeyStatus.value = await refreshStatus(reference)
  credentialRevision.value++
}

export async function setPexelsKey(key: string): Promise<void> {
  const value = key.trim()
  if (value) await appCredentialServices.manager.set(PEXELS_CREDENTIAL, value)
  else await appCredentialServices.manager.clear(PEXELS_CREDENTIAL)
  pexelsKeyStatus.value = await refreshStatus(PEXELS_CREDENTIAL)
  setPexelsApiKey(value || null)
}

export async function setUnsplashKey(key: string): Promise<void> {
  const value = key.trim()
  if (value) await appCredentialServices.manager.set(UNSPLASH_CREDENTIAL, value)
  else await appCredentialServices.manager.clear(UNSPLASH_CREDENTIAL)
  unsplashKeyStatus.value = await refreshStatus(UNSPLASH_CREDENTIAL)
  setUnsplashAccessKey(value || null)
}

export async function setRememberCredentials(remembered: boolean): Promise<void> {
  await credentialsReady
  const providerCredentials = AI_PROVIDERS.filter(
    (provider) => !provider.id.startsWith('acp:')
  ).map((provider) => providerCredentialRef(provider.id))
  await setBrowserCredentialPersistence(remembered, [
    ...providerCredentials,
    PEXELS_CREDENTIAL,
    UNSPLASH_CREDENTIAL
  ])
  await Promise.all([refreshProviderStatus(providerID.value), refreshMediaCredentials()])
  credentialRevision.value++
}

export { browserCredentialsRemembered }

export function registerAIChatEffects(markTransportDirty: () => void) {
  watch(providerID, (id) => {
    const definition = AI_PROVIDERS.find((provider) => provider.id === id)
    if (definition?.defaultModel) modelID.value = definition.defaultModel
    void refreshProviderStatus(id)
    markTransportDirty()
  })

  watch(modelID, markTransportDirty)
  watch(customModelID, markTransportDirty)
  watch(customAPIType, markTransportDirty)
  watch(customBaseURL, markTransportDirty)
  watch(credentialRevision, markTransportDirty)
}
