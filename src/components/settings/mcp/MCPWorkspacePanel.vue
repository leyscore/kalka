<script setup lang="ts">
import { useSettingsMessages } from '@open-pencil/vue'

import { webmcpMode } from '@/app/automation/webmcp/preferences'
import { webmcpRuntime } from '@/app/automation/webmcp/runtime'
import SettingsSectionHeader from '@/components/settings/layout/SettingsSectionHeader.vue'

import MCPConnectionsSection from './MCPConnectionsSection.vue'
import MCPSettingsPanel from './MCPSettingsPanel.vue'
import WebMCPSettingsPanel from './WebMCPSettingsPanel.vue'

const settings = useSettingsMessages()
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col" data-test-id="settings-mcp-panel">
    <MCPConnectionsSection>
      <SettingsSectionHeader>{{ settings.automation }}</SettingsSectionHeader>
      <MCPSettingsPanel />
      <WebMCPSettingsPanel v-model="webmcpMode" :state="webmcpRuntime" />
    </MCPConnectionsSection>
  </div>
</template>
