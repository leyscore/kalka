<script setup lang="ts">
import { onMounted } from 'vue'

import { useAutomationMessages, useCommonMessages } from '@open-pencil/vue'

import { canConnectMCPClients, useMCPClients } from '@/app/automation/mcp/clients'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'

const automation = useAutomationMessages()
const common = useCommonMessages()
const { clients, config, refresh, connect, stateOf, errorOf } = useMCPClients()

onMounted(refresh)
</script>

<template>
  <div class="flex flex-col gap-3" data-test-id="mcp-client-list">
    <ul
      v-if="canConnectMCPClients && clients.length"
      class="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-panel"
    >
      <li
        v-for="client in clients"
        :key="client.id"
        class="flex flex-col gap-2 px-3 py-2.5"
        :data-test-id="`mcp-client-${client.id}`"
      >
        <div class="flex items-center gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-surface">{{ client.name }}</p>
            <p class="truncate text-[11px] text-muted">
              <template v-if="client.connected">{{ automation.clientConnectedStatus }}</template>
              <template v-else-if="!client.installed">{{ automation.clientNotInstalled }}</template>
              <template v-else>{{ client.file }}</template>
            </p>
          </div>
          <AppButton
            size="xs"
            :variant="client.connected ? 'outline' : 'solid'"
            :color="client.connected ? undefined : 'primary'"
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
        <AppAlert v-else-if="errorOf(client.id)" tone="error" :heading="errorOf(client.id) ?? ''" />
      </li>
    </ul>
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
