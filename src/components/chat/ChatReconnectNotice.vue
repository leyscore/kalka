<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import type { ChatReconnectNotice } from '@/app/ai/chat/reconnect'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'

const { notice, busy = false } = defineProps<{
  notice: ChatReconnectNotice
  /** Reconnecting is under way, so neither action may start another. */
  busy?: boolean
}>()
const emit = defineEmits<{ resend: []; reconnect: []; dismiss: [] }>()
const { ai, common } = useI18n()

const content = computed(() => {
  if (notice.kind === 'resend') {
    return {
      tone: 'success' as const,
      heading: ai.value.chatReconnectedHeading,
      description: ai.value.chatReconnectedDescription
    }
  }
  if (notice.kind === 'failed') {
    return { tone: 'error' as const, heading: ai.value.chatReconnectFailed, description: '' }
  }
  const { agent, signIn } = notice
  let description = ai.value.chatReconnectTerminalUnknown({ agent })
  if (signIn?.prompt) {
    description = ai.value.chatReconnectTerminalPrompt({ prompt: signIn.prompt })
  } else if (signIn) {
    description = ai.value.chatReconnectTerminalCommand
  }
  return {
    tone: 'warning' as const,
    heading: ai.value.chatReconnectTerminalHeading({ agent }),
    description
  }
})
const command = computed(() => (notice.kind === 'terminal' ? notice.signIn?.command : undefined))
</script>

<template>
  <div class="px-3 pb-2" data-test-id="chat-reconnect-notice">
    <AppAlert
      :tone="content.tone"
      :heading="content.heading"
      :description="content.description || undefined"
    >
      <template v-if="command" #details>
        <AppCopyField :value="command" :copy-label="common.copy" :copied-label="common.copied" />
      </template>
      <template #actions>
        <AppButton
          v-if="notice.kind === 'failed'"
          size="xs"
          variant="outline"
          :loading="busy"
          @click="emit('reconnect')"
        >
          {{ busy ? ai.reconnecting : ai.reconnect }}
        </AppButton>
        <AppButton
          v-else
          size="xs"
          color="primary"
          variant="solid"
          :disabled="busy"
          data-test-id="chat-resend"
          @click="emit('resend')"
        >
          <template #leading><icon-lucide-send aria-hidden="true" /></template>
          {{ ai.chatResend }}
        </AppButton>
        <AppButton size="xs" variant="ghost" @click="emit('dismiss')">
          {{ common.dismiss }}
        </AppButton>
      </template>
    </AppAlert>
  </div>
</template>
