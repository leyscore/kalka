<script setup lang="ts">
import {
  aiSetupDialogOpen,
  aiSetupEntry,
  closeAISetup
} from '@/app/ai/models/settings/onboarding/dialog'
import { openSettingsDialog } from '@/app/settings/dialog'
import ConnectAgent from '@/components/chat/connect/ConnectAgent.vue'
import { AppDialogRoot } from '@/components/ui/dialog'

import AISetupFlow from './AISetupFlow.vue'

function onOpenChange(open: boolean): void {
  if (!open) closeAISetup()
}

function openAdvancedSettings(): void {
  closeAISetup()
  openSettingsDialog('ai')
}
</script>

<template>
  <AppDialogRoot
    :open="aiSetupDialogOpen"
    size="md"
    data-test-id="ai-setup-dialog"
    @update:open="onOpenChange"
  >
    <ConnectAgent
      v-if="aiSetupEntry === 'connect'"
      placement="dialog"
      @connected="closeAISetup"
      @advanced="openAdvancedSettings"
    />
    <AISetupFlow
      v-else
      :entry="aiSetupEntry"
      @close="closeAISetup"
      @advanced="openAdvancedSettings"
    />
  </AppDialogRoot>
</template>
