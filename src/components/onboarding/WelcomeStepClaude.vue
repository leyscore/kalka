<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { canConnectMCPClients } from '@/app/automation/mcp/clients'
import { mcpInstallCommand } from '@/app/onboarding/claude'
import MCPClientList from '@/components/settings/mcp/MCPClientList.vue'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'

import ClaudeStatus from './ClaudeStatus.vue'

const { welcome } = useI18n()

const TOOLS = [
  ['get_page_tree', 'toolPageTree'],
  ['write_html', 'toolWriteHTML'],
  ['update_styles', 'toolUpdateStyles'],
  ['get_screenshot', 'toolExportImage'],
  ['get_html', 'toolGetHTML']
] as const
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
    <div class="flex flex-col gap-3">
      <section v-if="!canConnectMCPClients" class="rounded-[14px] bg-card p-4">
        <h3 class="text-[13px] font-semibold text-surface">{{ welcome.installTitle }}</h3>
        <p class="mt-0.5 mb-3 text-xs text-muted">{{ welcome.installHint }}</p>
        <AppCopyField
          :value="mcpInstallCommand"
          :copy-label="welcome.copy"
          :copied-label="welcome.copied"
        />
      </section>
      <MCPClientList />
    </div>

    <aside class="self-start rounded-[14px] bg-card p-5">
      <p class="text-[13px] font-semibold text-surface"><ClaudeStatus /></p>
      <p class="mt-4 mb-3 text-xs text-muted">{{ welcome.toolsIntro }}</p>
      <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-xs">
        <template v-for="[tool, key] in TOOLS" :key="tool">
          <dt class="font-mono text-primary">{{ tool }}</dt>
          <dd class="text-surface">{{ welcome[key] }}</dd>
        </template>
      </dl>
      <p
        class="mt-5 flex items-start gap-2 border-t border-hairline pt-4 text-xs leading-relaxed text-muted"
      >
        <icon-lucide-lock class="mt-0.5 size-3.5 shrink-0" />
        {{ welcome.privacy }}
      </p>
    </aside>
  </div>
</template>
