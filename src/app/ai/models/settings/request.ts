import { shallowRef } from 'vue'

import { openSettingsDialog } from '@/app/settings/dialog'

/** Why Settings opened on a model: its provider rejected the saved key. */
export type ModelSettingsReason = 'reconnect'

export interface ModelSettingsRequest {
  profileId: string
  reason: ModelSettingsReason
}

/** A model Settings › AI & agents should open on, taken by the models panel once it shows. */
export const modelSettingsRequest = shallowRef<ModelSettingsRequest | null>(null)

/** Opens Settings › AI & agents on one model's editor, explaining why. */
export function openModelProfileSettings(profileId: string, reason: ModelSettingsReason): void {
  modelSettingsRequest.value = { profileId, reason }
  openSettingsDialog('ai')
}

export function takeModelSettingsRequest(): ModelSettingsRequest | null {
  const request = modelSettingsRequest.value
  modelSettingsRequest.value = null
  return request
}
