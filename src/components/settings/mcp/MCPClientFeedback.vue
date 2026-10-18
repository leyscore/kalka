<script setup lang="ts">
import { computed } from 'vue'

import { useAutomationMessages, vTestId } from '@kalka/vue'

import type { MCPClientError, MCPClientState, MCPClientStatus } from '@/app/automation/mcp/clients'
import AppCollapsible from '@/components/ui/collapsible/AppCollapsible.vue'
import type { AlertProps } from '@/components/ui/feedback/alert'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'

const { client, state } = defineProps<{ client: MCPClientStatus; state: MCPClientState }>()

const automation = useAutomationMessages()

interface Feedback {
  tone: NonNullable<AlertProps['tone']>
  heading: string
  description?: string
  /** Technical output behind the message, shown folded and never translated. */
  details?: string
}

/** A failure in the user's language, with the output that explains it. */
function failureFeedback(error: MCPClientError): Feedback {
  const messages = automation.value
  const { failure } = error
  const tone = 'error'
  if (!failure) {
    return {
      tone,
      heading: messages.clientFailureUnknown({ client: client.name }),
      details: error.message
    }
  }
  switch (failure.code) {
    case 'bridge-missing':
      return { tone, heading: messages.clientFailureBridgeMissing(failure) }
    case 'config-invalid':
      return {
        tone,
        heading: messages.clientFailureConfigInvalid(failure),
        details: failure.details
      }
    case 'config-unusable':
      return {
        tone,
        heading: messages.clientFailureConfigUnusable(failure),
        details: failure.details
      }
    case 'config-unwritable':
      return {
        tone,
        heading: messages.clientFailureConfigUnwritable(failure),
        details: failure.details
      }
    case 'extension-missing':
      return { tone, heading: messages.clientFailureExtensionMissing }
    case 'extension-failed':
      return {
        tone,
        heading: messages.clientFailureExtensionFailed(failure),
        details: failure.details
      }
  }
}

const feedback = computed((): Feedback | null => {
  const messages = automation.value
  switch (state.state) {
    case 'done': {
      const heading = messages.clientRestartHint({ client: client.name })
      if (state.cliOutput === undefined) return { tone: 'success', heading }
      // The client's CLI failed and its file was edited instead: say so, and keep the output.
      return {
        tone: 'success',
        heading,
        description: messages.clientFileFallback({ client: client.name, file: client.file }),
        details: state.cliOutput
      }
    }
    case 'extension-opened':
      return { tone: 'info', heading: messages.clientExtensionHint({ client: client.name }) }
    case 'error':
      return failureFeedback(state.error)
    default:
      return null
  }
})
</script>

<template>
  <AppAlert
    v-if="feedback"
    :tone="feedback.tone"
    :heading="feedback.heading"
    :description="feedback.description"
    v-test-id="`mcp-client-feedback-${client.id}`"
  >
    <template v-if="feedback.details" #details>
      <AppCollapsible
        :label="automation.mcpFailureDetails"
        :ui="{ trigger: 'text-muted hover:text-surface', content: 'mt-1' }"
      >
        <pre
          class="max-h-40 overflow-auto rounded-[7px] border border-hairline bg-panel-field p-2 font-mono text-[11px] whitespace-pre-wrap text-muted"
          v-test-id="`mcp-client-details-${client.id}`"
          >{{ feedback.details }}</pre>
      </AppCollapsible>
    </template>
  </AppAlert>
</template>
