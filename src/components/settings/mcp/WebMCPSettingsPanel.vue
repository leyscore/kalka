<script setup lang="ts">
import { computed } from 'vue'

import { useAutomationMessages } from '@open-pencil/vue'

import type { WebMCPMode } from '@/app/automation/webmcp/policy'
import type { WebMCPRuntimeState } from '@/app/automation/webmcp/service'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const mode = defineModel<WebMCPMode>({ required: true })
const { state } = defineProps<{ state: WebMCPRuntimeState }>()
const automation = useAutomationMessages()
const options = computed(() => [
  { value: 'off' as const, label: automation.value.accessOff },
  { value: 'inspect' as const, label: automation.value.accessInspect },
  { value: 'edit' as const, label: automation.value.accessEdit }
])
const descriptions = computed(() => ({
  off: automation.value.accessOffDescription,
  inspect: automation.value.accessInspectDescription,
  edit: automation.value.accessEditDescription
}))
const status = computed(
  () =>
    ({
      off: automation.value.statusStopped,
      starting: automation.value.statusStarting,
      ready: automation.value.statusRunning,
      unsupported: automation.value.webmcpUnsupported,
      error: automation.value.statusError
    })[state.status]
)
</script>

<template>
  <section class="flex flex-col gap-4" data-slot="webmcp-settings">
    <SettingsSectionHeader>
      WebMCP
      <template #description>{{ automation.webmcpDescription }}</template>
    </SettingsSectionHeader>
    <SettingsGroup>
      <SettingsRow :label="automation.browserAccess">
        <AppSelect v-model="mode" :options="options" :label="automation.browserAccess" />
      </SettingsRow>
      <p class="px-3 py-2.5 text-xs leading-relaxed text-muted">{{ descriptions[mode] }}</p>
    </SettingsGroup>
    <div class="text-xs leading-relaxed text-surface" role="status">
      <p>{{ status }}</p>
      <p v-if="state.status === 'ready'" class="mt-1 text-muted">
        {{ automation.tools }}: {{ state.toolCount }}
      </p>
    </div>
    <p v-if="state.error" role="alert" class="text-xs text-error">{{ state.error }}</p>
    <a
      href="https://openpencil.dev/programmable/mcp-server#webmcp"
      target="_blank"
      rel="noopener noreferrer"
      class="self-start text-xs text-surface underline underline-offset-4"
      >{{ automation.webmcpSetup }}</a
    >
  </section>
</template>
