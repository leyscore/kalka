<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import ProviderSettingsKeyField from '@/components/settings/provider/ProviderSettingsKeyField.vue'
import { useProviderSettingsContext } from '@/components/settings/provider/context'

const ctx = useProviderSettingsContext()
const { dialogs } = useI18n()
</script>

<template>
  <ProviderSettingsKeyField
    v-if="!ctx.isACP"
    v-model="ctx.keyInput"
    :label="dialogs.apiKey"
    :saved="ctx.apiKeyStatus === 'configured'"
    kind="api"
    :placeholder="ctx.hasExistingKey ? dialogs.keySavedReplace : ctx.providerDef.keyPlaceholder"
    :key-url="ctx.providerDef.keyURL"
    :key-url-label="dialogs.getAPIKeyGeneric"
    @clear="ctx.clearKey"
    @change="ctx.save"
  />
</template>
