import { AI_PROVIDERS } from '@open-pencil/core/constants'

import { storageCredentialRefs, storageProviderRegistry } from '@/app/integrations/storage'
import {
  PEXELS_CREDENTIAL,
  UNSPLASH_CREDENTIAL,
  providerCredentialRef
} from '@/app/settings/credentials/migration'

import { setBrowserCredentialPersistence } from './app'
import type { CredentialRef } from './types'

export function appCredentialRefs(): CredentialRef[] {
  const aiCredentials = AI_PROVIDERS.filter((provider) => !provider.id.startsWith('acp:')).map(
    (provider) => providerCredentialRef(provider.id)
  )
  const storageCredentials = storageProviderRegistry
    .list()
    .flatMap((provider) => storageCredentialRefs(provider.id))
  return [...aiCredentials, PEXELS_CREDENTIAL, UNSPLASH_CREDENTIAL, ...storageCredentials]
}

export function setAppCredentialPersistence(remembered: boolean): Promise<void> {
  return setBrowserCredentialPersistence(remembered, appCredentialRefs())
}
