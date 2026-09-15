<script setup lang="ts">
import { computed } from 'vue'

import {
  useCommonMessages,
  useCredentialMessages,
  useMediaMessages,
  useSettingsMessages
} from '@open-pencil/vue'

import { useMediaSettingsEditor, type MediaSettingsService } from '@/app/settings/media/use'
import { useSettingsFormGuard } from '@/app/settings/navigation/use'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsSaveFeedback from '@/components/settings/layout/SettingsSaveFeedback.vue'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'
import ProviderSettingsKeyField from '@/components/settings/provider/ProviderSettingsKeyField.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const { service } = defineProps<{ service: MediaSettingsService }>()
const emit = defineEmits<{ done: [] }>()
const editor = useMediaSettingsEditor(service)
const { key, providerID, keyStatus, error, dirty, busy, clearCredential } = editor
useSettingsFormGuard({ dirty, busy, cancel: () => emit('done') })
const common = useCommonMessages()
const credentials = useCredentialMessages()
const media = useMediaMessages()
const settings = useSettingsMessages()
const provider = computed(() => editor.vector?.provider.value)
const providerOptions = editor.vector?.providerOptions ?? []
const title = computed(() => {
  if (service === 'vectorize') return media.value.vectorization
  return service === 'pexels' ? 'Pexels' : 'Unsplash'
})
const keyLabel = computed(() => {
  if (service === 'pexels') return media.value.pexelsAPIKey
  if (service === 'unsplash') return media.value.unsplashAccessKey
  return title.value
})
const keyURL = computed(() => {
  if (service === 'pexels') return 'https://www.pexels.com/api/'
  if (service === 'unsplash') return 'https://unsplash.com/oauth/applications'
  return provider.value?.keyURL
})
const placeholder = computed(() => {
  if (keyStatus.value === 'configured') return credentials.value.savedReplace
  if (service === 'pexels') return media.value.stockPhotoToolOptional
  if (service === 'unsplash') return media.value.pexelsAlternativeOptional
  return provider.value?.keyPlaceholder ?? ''
})
async function save() {
  if (await editor.save()) emit('done')
}
</script>

<template>
  <form class="flex min-h-0 min-w-0 flex-1 flex-col" :aria-busy="busy" @submit.prevent="save">
    <SettingsPage>
      <div class="flex flex-col gap-4">
        <SettingsSectionHeader>
          {{ title }}
          <template #description>{{ settings.saveChangesDescription }}</template>
        </SettingsSectionHeader>
        <fieldset :disabled="busy" class="flex min-w-0 flex-col gap-4">
          <label v-if="service === 'vectorize'" class="flex flex-col gap-1.5 text-xs text-surface">
            {{ media.vectorizeProvider }}
            <AppSelect
              v-model="providerID"
              :options="providerOptions"
              :label="media.vectorizeProvider"
              :disabled="busy"
            />
          </label>
          <ProviderSettingsKeyField
            v-model="key"
            :label="keyLabel"
            :saved="keyStatus === 'configured'"
            :hint="
              keyStatus === 'configured'
                ? settings.savedCredentialHint
                : settings.optionalCredentialHint
            "
            kind="api"
            :placeholder="placeholder"
            :key-u-r-l="keyURL"
            :key-u-r-l-label="credentials.getAPIKey"
            @clear="clearCredential"
          />
        </fieldset>
        <SettingsSaveFeedback :error="error" />
      </div>
      <template #footer>
        <AppButton :disabled="busy" @click="emit('done')">{{ common.cancel }}</AppButton>
        <AppButton type="submit" color="primary" variant="solid" :loading="busy">{{
          common.save
        }}</AppButton>
      </template>
    </SettingsPage>
  </form>
</template>
