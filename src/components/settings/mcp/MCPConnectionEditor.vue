<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

import {
  useAutomationMessages,
  useCommonMessages,
  useCredentialMessages,
  useSettingsMessages
} from '@kalka/vue'

import { mcpAuthenticationTypes, type MCPConnectionDraft } from '@/app/integrations/mcp'
import type {
  MCPConnectionField,
  MCPConnectionFieldErrors
} from '@/app/integrations/mcp/settings/form'
import type { MCPOAuthStatus } from '@/app/integrations/mcp/settings/oauth'
import type { MCPAuthenticationType, MCPTransportType } from '@/app/integrations/mcp/types'
import type { CredentialStatus } from '@/app/settings/credentials/types'
import type { SettingsSaveResult } from '@/app/settings/save-result'
import { focusInvalidField } from '@/components/settings/layout/focus'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import SettingsSaveFeedback from '@/components/settings/layout/SettingsSaveFeedback.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import ProviderSettingsField from '@/components/settings/provider/ProviderSettingsField.vue'
import ProviderSettingsKeyField from '@/components/settings/provider/ProviderSettingsKeyField.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppTextarea from '@/components/ui/input/AppTextarea.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const draft = defineModel<MCPConnectionDraft>('draft', { required: true })
const token = defineModel<string>('token', { required: true })
const {
  tokenStatus,
  busy,
  error,
  saveResult,
  fieldErrors = {},
  oauthStatus = 'signed-out',
  oauthError = '',
  canRunLocal = false,
  saved = false
} = defineProps<{
  tokenStatus: CredentialStatus
  busy: boolean
  error: string
  saveResult?: SettingsSaveResult | null
  fieldErrors?: MCPConnectionFieldErrors
  oauthStatus?: MCPOAuthStatus
  oauthError?: string
  /** Whether this build can start local servers: the desktop app. */
  canRunLocal?: boolean
  /** Whether the draft matches a saved connection, so it can sign in. */
  saved?: boolean
}>()
defineEmits<{
  cancel: []
  save: []
  remove: []
  clear: []
  signIn: []
  signOut: []
  blurField: [field: MCPConnectionField]
}>()
const automation = useAutomationMessages()
const common = useCommonMessages()
const credentials = useCredentialMessages()
const settings = useSettingsMessages()
const formElement = useTemplateRef<HTMLFormElement>('formElement')

const transportOptions = computed(() => [
  { value: 'streamable-http', label: automation.value.transportHTTP },
  { value: 'stdio', label: automation.value.transportStdio, disabled: !canRunLocal }
])
const authenticationLabels = computed<Record<MCPAuthenticationType, string>>(() => ({
  none: automation.value.authenticationNone,
  bearer: automation.value.authenticationBearer,
  oauth: automation.value.authenticationOAuth,
  env: automation.value.authenticationEnv
}))
const authenticationOptions = computed(() =>
  mcpAuthenticationTypes(draft.value.transportType).map((value) => ({
    value,
    label: authenticationLabels.value[value]
  }))
)

function isTransportType(value: string): value is MCPTransportType {
  return value === 'streamable-http' || value === 'stdio'
}

function isAuthenticationType(value: string): value is MCPAuthenticationType {
  return mcpAuthenticationTypes(draft.value.transportType).some((type) => type === value)
}

/** A transport keeps the authentication it allows; the others fall back to none. */
function setTransport(value: string): void {
  if (!isTransportType(value)) return
  draft.value.transportType = value
  if (!mcpAuthenticationTypes(value).includes(draft.value.authenticationType)) {
    draft.value.authenticationType = 'none'
  }
}

function setAuthentication(value: string): void {
  if (isAuthenticationType(value)) draft.value.authenticationType = value
}
defineExpose({ focusInvalid: () => focusInvalidField(formElement.value) })
</script>

<template>
  <form
    ref="formElement"
    class="flex min-h-0 min-w-0 flex-1 flex-col"
    :aria-busy="busy"
    novalidate
    @submit.prevent="$emit('save')"
  >
    <SettingsPage>
      <SettingsSection>
        <template #title>{{
          draft.id ? automation.editConnection : automation.addServerConnection
        }}</template>
        <template #description>{{ automation.connectionEditorDescription }}</template>
        <fieldset :disabled="busy" class="flex min-w-0 flex-col gap-3">
          <ProviderSettingsField
            v-slot="{ control }"
            :label="automation.connectionName"
            :hint="automation.connectionNameHint"
            :error="fieldErrors.name"
            @blur="$emit('blurField', 'name')"
          >
            <AppInput
              v-bind="control"
              v-model="draft.name"
              tone="panel"
              :aria-label="automation.connectionName"
              autocomplete="off"
            />
          </ProviderSettingsField>
          <ProviderSettingsField :label="automation.serverType">
            <SegmentedControl
              :model-value="draft.transportType"
              :options="transportOptions"
              :label="automation.serverType"
              @update:model-value="setTransport"
            />
          </ProviderSettingsField>
          <ProviderSettingsField
            v-if="draft.transportType === 'streamable-http'"
            v-slot="{ control }"
            :label="automation.serverURL"
            :hint="automation.serverURLHint"
            :error="fieldErrors.url"
            @blur="$emit('blurField', 'url')"
          >
            <AppInput
              v-bind="control"
              v-model="draft.url"
              type="url"
              tone="panel"
              :aria-label="automation.serverURL"
              placeholder="https://example.com/mcp"
              autocomplete="off"
              autocapitalize="off"
              :spellcheck="false"
            />
          </ProviderSettingsField>
          <ProviderSettingsField
            v-else
            v-slot="{ control }"
            :label="automation.serverCommand"
            :hint="canRunLocal ? automation.serverCommandHint : automation.localServersDesktopOnly"
            :error="fieldErrors.command"
            @blur="$emit('blurField', 'command')"
          >
            <AppInput
              v-bind="control"
              v-model="draft.command"
              tone="panel"
              class="font-mono"
              :aria-label="automation.serverCommand"
              placeholder="npx -y @notionhq/notion-mcp-server"
              autocomplete="off"
              autocapitalize="off"
              :spellcheck="false"
            />
          </ProviderSettingsField>
          <SettingsGroup>
            <SettingsRow :label="automation.enableConnection">
              <AppSwitch
                v-model="draft.enabled"
                :label="automation.enableConnection"
                :disabled="busy"
              />
            </SettingsRow>
          </SettingsGroup>
          <ProviderSettingsField :label="automation.connectionAuthentication">
            <SegmentedControl
              :model-value="draft.authenticationType"
              :options="authenticationOptions"
              :label="automation.connectionAuthentication"
              @update:model-value="setAuthentication"
            />
          </ProviderSettingsField>
          <ProviderSettingsKeyField
            v-if="draft.authenticationType === 'bearer'"
            v-model="token"
            :label="automation.bearerToken"
            input-id="mcp-bearer-token"
            :saved="tokenStatus === 'configured'"
            kind="api"
            :placeholder="
              tokenStatus === 'configured'
                ? credentials.savedReplace
                : automation.bearerTokenPlaceholder
            "
            :hint="
              tokenStatus === 'configured'
                ? settings.savedCredentialHint
                : automation.bearerTokenRequired
            "
            :error="fieldErrors.credential"
            @clear="$emit('clear')"
            @blur="$emit('blurField', 'credential')"
          />
          <ProviderSettingsField
            v-else-if="draft.authenticationType === 'env'"
            v-slot="{ control }"
            :label="automation.environment"
            :hint="
              tokenStatus === 'configured'
                ? settings.savedCredentialHint
                : automation.environmentHint
            "
            :error="fieldErrors.credential"
            @blur="$emit('blurField', 'credential')"
          >
            <AppTextarea
              v-bind="control"
              v-model="token"
              :rows="3"
              class="font-mono"
              :aria-label="automation.environment"
              :placeholder="tokenStatus === 'configured' ? credentials.savedReplace : 'API_KEY=…'"
              autocomplete="off"
              autocapitalize="off"
              :spellcheck="false"
            />
          </ProviderSettingsField>
          <SettingsGroup v-else-if="draft.authenticationType === 'oauth'">
            <SettingsRow
              :label="
                oauthStatus === 'signed-in' ? automation.oauthSignedIn : automation.oauthSignedOut
              "
              :description="saved ? automation.oauthHint : automation.oauthSaveFirst"
            >
              <AppButton
                v-if="oauthStatus === 'signed-in'"
                size="xs"
                variant="outline"
                :disabled="busy"
                @click="$emit('signOut')"
                >{{ automation.oauthSignOut }}</AppButton
              >
              <AppButton
                v-else
                size="xs"
                color="primary"
                variant="solid"
                :disabled="busy || !saved || !canRunLocal"
                :loading="oauthStatus === 'signing-in'"
                data-test-id="mcp-oauth-sign-in"
                @click="$emit('signIn')"
                >{{
                  oauthStatus === 'signing-in' ? automation.oauthSigningIn : automation.oauthSignIn
                }}</AppButton
              >
            </SettingsRow>
          </SettingsGroup>
          <AppAlert v-if="oauthError" tone="error" :heading="oauthError" />
        </fieldset>
        <SettingsSaveFeedback :error="error" :result="saveResult" />
      </SettingsSection>
      <template #footer>
        <AppButton
          v-if="draft.id"
          class="mr-auto"
          color="error"
          variant="link"
          :disabled="busy"
          @click="$emit('remove')"
          >{{ automation.deleteConnection }}</AppButton
        >
        <AppButton :disabled="busy" @click="$emit('cancel')">{{ common.cancel }}</AppButton>
        <AppButton type="submit" color="primary" variant="solid" :loading="busy">{{
          common.save
        }}</AppButton>
      </template>
    </SettingsPage>
  </form>
</template>
