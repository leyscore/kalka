<script setup lang="ts">
import { useAutomationMessages } from '@kalka/vue'

import { webmcpMode } from '@/app/automation/webmcp/preferences'
import { webmcpRuntime } from '@/app/automation/webmcp/runtime'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'

import MCPClientList from './MCPClientList.vue'
import MCPConnectionsSection from './MCPConnectionsSection.vue'
import MCPSettingsPanel from './MCPSettingsPanel.vue'
import WebMCPSettingsPanel from './WebMCPSettingsPanel.vue'

const automation = useAutomationMessages()
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col" data-test-id="settings-mcp-panel">
    <MCPConnectionsSection>
      <SettingsSection data-test-id="settings-mcp-clients">
        <template #title>{{ automation.clientsTitle }}</template>
        <template #description>{{ automation.clientsDescription }}</template>
        <MCPClientList />
      </SettingsSection>
      <MCPSettingsPanel />
      <WebMCPSettingsPanel v-model="webmcpMode" :state="webmcpRuntime" />
    </MCPConnectionsSection>
  </div>
</template>
