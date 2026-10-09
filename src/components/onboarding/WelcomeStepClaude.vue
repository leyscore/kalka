<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import {
  claudeCodeCommand,
  claudeDesktopConfigPath,
  mcpClientConfig,
  mcpInstallCommand
} from '@/app/onboarding/claude'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'

import ClaudeStatus from './ClaudeStatus.vue'

const { welcome } = useI18n()
const desktopConfigFile = claudeDesktopConfigPath()

const TOOLS = [
  ['get_page_tree', 'toolPageTree'],
  ['render', 'toolRender'],
  ['get_jsx', 'toolJSX'],
  ['export_image', 'toolExportImage'],
  ['find_nodes', 'toolFind']
] as const
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
    <div class="flex flex-col gap-3">
      <section class="rounded-xl border border-border bg-panel p-4">
        <h3 class="text-[13px] font-semibold text-surface">{{ welcome.installTitle }}</h3>
        <p class="mt-0.5 mb-3 text-xs text-muted">{{ welcome.installHint }}</p>
        <AppCopyField
          :value="mcpInstallCommand"
          :copy-label="welcome.copy"
          :copied-label="welcome.copied"
        />
      </section>
      <section class="rounded-xl border border-border bg-panel p-4">
        <h3 class="text-[13px] font-semibold text-surface">{{ welcome.claudeCodeTitle }}</h3>
        <p class="mt-0.5 mb-3 text-xs text-muted">{{ welcome.claudeCodeHint }}</p>
        <AppCopyField
          :value="claudeCodeCommand"
          :copy-label="welcome.copy"
          :copied-label="welcome.copied"
        />
      </section>
      <section class="rounded-xl border border-border bg-panel p-4">
        <h3 class="text-[13px] font-semibold text-surface">{{ welcome.claudeDesktopTitle }}</h3>
        <p class="mt-0.5 mb-3 text-xs break-words text-muted">
          {{ welcome.claudeDesktopHint({ file: desktopConfigFile }) }}
        </p>
        <AppCopyField
          :value="mcpClientConfig"
          :copy-label="welcome.copyConfig"
          :copied-label="welcome.copied"
          :ui="{ value: 'whitespace-pre' }"
        />
        <p class="mt-3 text-xs text-muted">
          <span class="font-medium text-surface">{{ welcome.otherClientTitle }}.</span>
          {{ welcome.otherClientHint }}
        </p>
      </section>
    </div>

    <aside class="self-start rounded-2xl border border-border bg-panel p-5">
      <p class="text-[13px] font-semibold text-surface"><ClaudeStatus /></p>
      <p class="mt-4 mb-3 text-xs text-muted">{{ welcome.toolsIntro }}</p>
      <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-xs">
        <template v-for="[tool, key] in TOOLS" :key="tool">
          <dt class="font-mono text-primary">{{ tool }}</dt>
          <dd class="text-surface">{{ welcome[key] }}</dd>
        </template>
      </dl>
      <p
        class="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted"
      >
        <icon-lucide-lock class="mt-0.5 size-3.5 shrink-0" />
        {{ welcome.privacy }}
      </p>
    </aside>
  </div>
</template>
