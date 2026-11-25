<script setup lang="ts">
import { ref, onUnmounted, useTemplateRef, watch } from 'vue'

import { HARNESS_PROVIDER_ID } from '@kalka/core/constants'
import { useI18n } from '@kalka/vue'

import { modelConnection, needsServerAddress } from '@/app/ai/models'
import { openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import {
  modelSettingsRequest,
  takeModelSettingsRequest,
  type ModelSettingsReason
} from '@/app/ai/models/settings/request'
import { useModelSettings } from '@/app/ai/models/settings/use'
import ConnectAgent from '@/components/chat/connect/ConnectAgent.vue'
import SettingsDisclosure from '@/components/settings/layout/SettingsDisclosure.vue'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import ProfileEditor from '@/components/settings/models/ProfileEditor.vue'
import RoleAssignments from '@/components/settings/models/RoleAssignments.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppActionRow from '@/components/ui/list/AppActionRow.vue'
import PanelDrillIn from '@/components/ui/panel/PanelDrillIn.vue'

/**
 * Settings sits on the frosted shell, so the editor keeps that surface instead of the opaque
 * panel fill, and the list fades out under it rather than showing through.
 */
const DRILL_IN_UI = {
  detail: 'bg-transparent',
  base: 'transition-opacity duration-150 inert:opacity-0 motion-reduce:transition-none'
} as const

const { ai, collaboration, common, settings } = useI18n()
const editing = defineModel<boolean>('editing', { default: false })
const editingProfileId = ref<string>()
const editingReason = ref<ModelSettingsReason>()
const editor = useTemplateRef('editor')

/** The editor opens on its name field rather than the back control. */
function focusEditor(event: Event): void {
  if (!editor.value) return
  event.preventDefault()
  editor.value.focus()
}
onUnmounted(() => {
  editing.value = false
})

function addModel(): void {
  editingProfileId.value = undefined
  editingReason.value = undefined
  editing.value = true
}

function editModel(profileId: string, reason?: ModelSettingsReason): void {
  editingProfileId.value = profileId
  editingReason.value = reason
  editing.value = true
}

// The chat's Reconnect opens Settings on the model whose key the provider rejected.
watch(
  modelSettingsRequest,
  (request) => {
    if (!request) return
    takeModelSettingsRequest()
    editModel(request.profileId, request.reason)
  },
  { immediate: true }
)

function statusLabel(connectionId: string, providerID: string): string {
  const status = statusByConnection.value[connectionId]
  if (providerID.startsWith('acp:')) return ai.value.modelAgentConnection
  // A compatible server without its address is not set up, whatever its key; the agent's panel
  // asks to connect a provider for it too.
  const connection = modelConnection(connectionId)
  if (connection && needsServerAddress(connection)) return settings.value.notConfigured
  // Pi uses its own sign-ins unless an AI Gateway key is saved.
  if (providerID === HARNESS_PROVIDER_ID && status !== 'configured') {
    return ai.value.modelAgentConnection
  }
  if (status === 'configured') return collaboration.value.connected
  if (status === 'locked' || status === 'unavailable') return common.value.unavailable
  return ai.value.modelNeedsCredential
}

function closeEditor(): void {
  editing.value = false
  void refreshStatuses()
}

const { profiles, statusByConnection, refreshStatuses } = useModelSettings()
</script>

<template>
  <PanelDrillIn
    :open="editing"
    :back="common.back"
    :parent="ai.modelsTitle"
    :ui="DRILL_IN_UI"
    @back="closeEditor"
    @open-auto-focus="focusEditor"
  >
    <template #detail>
      <ProfileEditor
        ref="editor"
        :key="editingProfileId ?? 'new'"
        :profile-id="editingProfileId"
        :reason="editingReason"
        @done="closeEditor"
        @deleted="closeEditor"
      />
    </template>

    <SettingsPage>
      <div class="flex flex-col gap-8">
        <SettingsSection>
          <template #title>{{ ai.connectAITitle }}</template>
          <template #description>{{ ai.connectAIDescription }}</template>
          <ConnectAgent placement="settings" data-test-id="settings-connect" />
          <AppButton
            color="primary"
            variant="link"
            size="xs"
            class="self-start"
            data-test-id="settings-run-ai-setup"
            @click="openAISetup()"
          >
            <template #leading><icon-hugeicons-sparkles class="size-3" /></template>
            {{ ai.aiSetupRun }}
          </AppButton>
        </SettingsSection>

        <SettingsSection>
          <template #title>{{ ai.yourModels }}</template>
          <template #description>{{ ai.yourModelsDescription }}</template>
          <template #actions>
            <AppButton variant="outline" data-test-id="settings-add-model" @click="addModel">
              <template #leading><icon-hugeicons-plus class="size-3" /></template>
              {{ ai.addModel }}
            </AppButton>
          </template>
          <div class="flex flex-col gap-1.5" data-test-id="settings-model-list">
            <AppActionRow
              v-for="profile in profiles"
              :key="profile.id"
              :data-model-id="profile.id"
              :ui="{
                root: 'py-3 max-sm:flex-wrap',
                label: 'text-xs',
                description: 'text-[11px] leading-relaxed',
                trailing: 'max-sm:w-full max-sm:justify-end'
              }"
              @click="editModel(profile.id)"
            >
              <template #leading>
                <span class="flex size-8 items-center justify-center rounded-[7px] bg-panel-field"
                  ><icon-hugeicons-sparkle class="size-4"
                /></span>
              </template>
              {{ profile.name }}
              <template #description>
                {{ profile.providerName
                }}<span v-if="profile.modelName"> · {{ profile.modelName }}</span>
              </template>
              <template #trailing>
                <span
                  class="mr-1 flex items-center gap-1 text-[11px] text-muted"
                  :data-state="
                    statusByConnection[profile.connectionId] === 'configured'
                      ? 'configured'
                      : 'missing'
                  "
                >
                  <span
                    class="size-1.5 rounded-full bg-muted data-[state=configured]:bg-[var(--color-success)]"
                    :data-state="
                      statusByConnection[profile.connectionId] === 'configured'
                        ? 'configured'
                        : 'missing'
                    "
                  />
                  {{ statusLabel(profile.connectionId, profile.providerID) }}
                </span>
                <span
                  v-for="capability in profile.capabilities"
                  :key="capability"
                  class="rounded-[5px] bg-panel-field px-1.5 py-0.5 text-[11px] text-muted"
                >
                  {{
                    capability === 'tools'
                      ? ai.modelCapabilityToolsShort
                      : ai.modelCapabilityVisionShort
                  }}
                </span>
                <icon-hugeicons-chevron-right class="size-3.5 shrink-0 text-muted" />
              </template>
            </AppActionRow>
          </div>
        </SettingsSection>

        <SettingsSection>
          <template #title>{{ ai.mainModelTitle }}</template>
          <template #description>{{ ai.mainModelDescription }}</template>
          <RoleAssignments :roles="['design']" />
          <SettingsDisclosure data-test-id="settings-model-per-task">
            <template #label>{{ ai.perTaskModels }}</template>
            <RoleAssignments :roles="['review', 'fast', 'vision']" />
          </SettingsDisclosure>
        </SettingsSection>
        <slot />
      </div>
    </SettingsPage>
  </PanelDrillIn>
</template>
