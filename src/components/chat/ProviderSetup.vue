<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { openSettingsDialog } from '@/app/settings/dialog'

const { dialogs } = useI18n()
</script>

<template>
  <div data-test-id="provider-setup" class="flex flex-1 flex-col items-center justify-center px-6">
    <icon-lucide-sparkles class="mb-3 size-7 text-muted" />
    <p class="mb-5 text-center text-xs text-muted">{{ dialogs.connectAIProvider }}</p>
    <button
      type="button"
      data-test-id="provider-setup-open-settings"
      class="w-full rounded bg-accent py-1.5 text-xs font-medium text-white hover:bg-accent/90"
      @click="openSettingsDialog('ai')"
    >
      {{ dialogs.openProviderSettings }}
    </button>
  </div>
</template>
