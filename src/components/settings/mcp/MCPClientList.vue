<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useAutomationMessages, useCommonMessages } from '@open-pencil/vue'

import {
  canConnectMCPClients,
  useMCPClients,
  type MCPClientStatus
} from '@/app/automation/mcp/clients'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'

const automation = useAutomationMessages()
const common = useCommonMessages()
const { clients, config, refresh, connect, stateOf, errorOf } = useMCPClients()
const showOthers = ref(false)

// Clients found on this computer come first; the rest stay folded until asked for.
const detected = computed(() => clients.value.filter((client) => client.installed))
const others = computed(() => clients.value.filter((client) => !client.installed))
const shown = computed(() =>
  showOthers.value || detected.value.length === 0 ? clients.value : detected.value
)

function presence(client: MCPClientStatus): 'connected' | 'detected' | 'missing' {
  if (client.connected) return 'connected'
  return client.installed ? 'detected' : 'missing'
}

function statusOf(client: MCPClientStatus): string {
  const state = presence(client)
  if (state === 'connected') return automation.value.clientConnectedStatus
  return state === 'detected'
    ? automation.value.clientDetected
    : automation.value.clientNotInstalled
}

onMounted(refresh)
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="mcp-client-list">
    <div
      v-if="canConnectMCPClients && clients.length"
      class="overflow-hidden rounded-xl border border-border bg-panel"
    >
      <ul class="flex flex-col divide-y divide-border">
        <li
          v-for="client in shown"
          :key="client.id"
          class="flex flex-col gap-2 px-3 py-2"
          :data-test-id="`mcp-client-${client.id}`"
        >
          <div class="flex items-center gap-3">
            <span
              class="size-1.5 shrink-0 rounded-full data-[state=connected]:bg-success data-[state=detected]:bg-muted data-[state=missing]:bg-border"
              :data-state="presence(client)"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-surface">{{ client.name }}</p>
              <p class="text-[11px] text-muted">{{ statusOf(client) }}</p>
            </div>
            <AppButton
              size="xs"
              :variant="client.connected ? 'ghost' : 'outline'"
              :loading="stateOf(client.id).state === 'connecting'"
              :data-test-id="`mcp-client-connect-${client.id}`"
              @click="connect(client.id)"
            >
              {{ client.connected ? automation.clientReconnect : automation.clientConnect }}
            </AppButton>
          </div>
          <AppAlert
            v-if="stateOf(client.id).state === 'done'"
            tone="success"
            :heading="automation.clientRestartHint({ client: client.name })"
          />
          <AppAlert
            v-else-if="errorOf(client.id)"
            tone="error"
            :heading="errorOf(client.id) ?? ''"
          />
        </li>
      </ul>
      <button
        v-if="detected.length > 0 && others.length > 0"
        type="button"
        class="group flex w-full items-center gap-1.5 border-t border-border px-3 py-2 text-left text-[11px] text-muted transition-colors hover:text-surface"
        :aria-expanded="showOthers"
        @click="showOthers = !showOthers"
      >
        <icon-lucide-chevron-right
          class="size-3 transition-transform group-aria-expanded:rotate-90"
        />
        {{ automation.clientsMore({ count: others.length }) }}
      </button>
    </div>
    <section class="rounded-xl border border-border bg-panel p-3">
      <p class="text-xs font-medium text-surface">{{ automation.otherClientTitle }}</p>
      <p class="mt-0.5 mb-2.5 text-xs leading-relaxed text-muted">
        {{ automation.otherClientDescription }}
      </p>
      <AppCopyField
        :value="config"
        :copy-label="common.copy"
        :copied-label="common.copied"
        :ui="{ value: 'whitespace-pre' }"
      />
    </section>
  </div>
</template>
