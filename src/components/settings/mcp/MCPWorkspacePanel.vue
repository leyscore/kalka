<script setup lang="ts">
import { useAutomationMessages, useI18n } from '@kalka/vue'

import { webmcpMode } from '@/app/automation/webmcp/preferences'
import { webmcpRuntime } from '@/app/automation/webmcp/runtime'
import { openSettings } from '@/app/settings/open'
import SettingsDisclosure from '@/components/settings/layout/SettingsDisclosure.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppActionRow from '@/components/ui/list/AppActionRow.vue'

import MCPClientList from './MCPClientList.vue'
import MCPConnectionsSection from './MCPConnectionsSection.vue'
import MCPSettingsPanel from './MCPSettingsPanel.vue'
import WebMCPSettingsPanel from './WebMCPSettingsPanel.vue'

const automation = useAutomationMessages()
const { settings } = useI18n()
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col" data-test-id="settings-mcp-panel">
    <MCPConnectionsSection>
      <SettingsSection data-test-id="settings-mcp-clients">
        <template #title>{{ automation.clientsTitle }}</template>
        <template #description>{{ automation.clientsDescription }}</template>
        <MCPClientList />
      </SettingsSection>
      <AppActionRow data-test-id="settings-choose-tools" @click="openSettings('tools')">
        <template #leading>
          <span class="flex size-8 items-center justify-center rounded-[8px] bg-panel-field">
            <icon-hugeicons-sliders-horizontal class="size-4" />
          </span>
        </template>
        {{ settings.chooseTools }}
        <template #description>{{ settings.chooseToolsDescription }}</template>
        <template #trailing>
          <icon-hugeicons-arrow-right-01 class="size-3.5 shrink-0 text-muted" />
        </template>
      </AppActionRow>
      <WebMCPSettingsPanel v-model="webmcpMode" :state="webmcpRuntime" />
      <SettingsDisclosure data-test-id="settings-mcp-advanced">
        <template #label>{{ settings.advancedSettings }}</template>
        <MCPSettingsPanel />
      </SettingsDisclosure>
    </MCPConnectionsSection>
  </div>
</template>
