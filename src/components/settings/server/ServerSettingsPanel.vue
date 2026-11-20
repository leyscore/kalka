<script setup lang="ts">
import { computed, ref } from 'vue'

import { useCollaborationMessages } from '@kalka/vue'

import {
  describeServer,
  serverAccount,
  serverSessionExpired,
  signInWithPassword,
  signInWithSSO,
  signOutOfServer
} from '@/app/collab/server/account'
import { ServerRequestError, type ServerInfo } from '@/app/collab/server/api'
import { refreshServerDocuments } from '@/app/collab/server/documents'
import { openExternalLink } from '@/app/shell/ui'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

/**
 * Connects Kalka to a Kalka server: its address, then signing in with a password or the
 * server's single sign-on. Inviting people and roles live on the server's own page.
 */
const messages = useCollaborationMessages()
const address = ref(serverAccount.value?.url ?? '')
const server = ref<{ url: string; info: ServerInfo } | null>(null)
const email = ref(serverAccount.value?.user.email ?? '')
const password = ref('')
const busy = ref(false)
const waitingForBrowser = ref(false)
const error = ref<string | null>(null)

const signedIn = computed(() => serverAccount.value !== null && !serverSessionExpired.value)
const roleLabel = computed(() => {
  const role = serverAccount.value?.user.role
  if (role === 'admin') return messages.value.serverRoleAdmin
  if (role === 'viewer') return messages.value.serverRoleViewer
  return messages.value.serverRoleEditor
})

function explain(reason: unknown): string {
  if (!(reason instanceof ServerRequestError)) return messages.value.serverUnreachable
  if (
    reason.message === 'not-a-kalka-server' ||
    reason.message === 'invalid-url' ||
    reason.status === 404
  ) {
    return messages.value.serverNotKalka
  }
  if (reason.message === 'unreachable') return messages.value.serverUnreachable
  if (reason.message === 'popup-blocked') return messages.value.serverPopupBlocked
  return reason.message
}

async function run(task: () => Promise<unknown>) {
  busy.value = true
  error.value = null
  try {
    await task()
  } catch (reason) {
    error.value = explain(reason)
  } finally {
    busy.value = false
    waitingForBrowser.value = false
  }
}

function lookUp() {
  void run(async () => {
    server.value = await describeServer(address.value)
  })
}

function signIn() {
  const target = server.value
  if (!target) return
  void run(async () => {
    await signInWithPassword(target.url, target.info, email.value.trim(), password.value)
    password.value = ''
    await refreshServerDocuments()
  })
}

function signInSSO() {
  const target = server.value
  if (!target) return
  waitingForBrowser.value = true
  // Started from the click itself, so the browser lets the sign-in window open.
  void run(async () => {
    await signInWithSSO(target.url, target.info)
    await refreshServerDocuments()
  })
}

function signOut() {
  void run(async () => {
    await signOutOfServer()
    server.value = null
    await refreshServerDocuments()
  })
}

function reconnect() {
  address.value = serverAccount.value?.url ?? address.value
  lookUp()
}

function openServerPage(url: string) {
  void openExternalLink(url)
}
</script>

<template>
  <SettingsSection data-test-id="settings-server">
    <template #title>{{ messages.serverSettingsTitle }}</template>
    <template #description>{{ messages.serverSettingsDescription }}</template>

    <SettingsGroup v-if="signedIn && serverAccount">
      <div class="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
        <div class="min-w-0">
          <p class="truncate text-[13px] text-surface" data-test-id="server-signed-in">
            {{
              messages.serverSignedInAs({
                server: serverAccount.serverName,
                name: serverAccount.user.name
              })
            }}
          </p>
          <p class="truncate text-[11px] text-muted">
            {{ serverAccount.url }} &mdash; {{ roleLabel }}
          </p>
        </div>
        <div class="flex gap-1.5">
          <AppButton variant="outline" @click="openServerPage(serverAccount.url)">
            {{ messages.serverOpenPage }}
          </AppButton>
          <AppButton
            variant="outline"
            :disabled="busy"
            data-test-id="server-sign-out"
            @click="signOut"
          >
            {{ messages.serverSignOut }}
          </AppButton>
        </div>
      </div>
      <p class="px-3.5 pb-3 text-[11px] text-muted">{{ messages.serverOpenPageDescription }}</p>
    </SettingsGroup>

    <SettingsGroup v-else>
      <div class="flex flex-col gap-3 px-3.5 py-3">
        <p v-if="serverSessionExpired" class="text-xs text-warning" role="status">
          {{ messages.serverSessionExpired }}
        </p>
        <div v-if="!server" class="flex flex-wrap items-center gap-1.5">
          <AppInput
            v-model="address"
            data-test-id="server-address"
            class="min-w-0 flex-1 sm:max-w-80"
            :aria-label="messages.serverAddress"
            :placeholder="messages.serverAddressPlaceholder"
            @enter="lookUp"
          />
          <AppButton
            color="primary"
            variant="solid"
            :disabled="busy || !address.trim()"
            data-test-id="server-continue"
            @click="serverSessionExpired ? reconnect() : lookUp()"
          >
            {{ messages.serverContinue }}
          </AppButton>
        </div>

        <template v-else>
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-[13px] text-surface">
              {{ server.info.name }}
              <span class="text-[11px] text-muted">{{ server.url }}</span>
            </p>
            <AppButton variant="ghost" size="sm" @click="server = null">
              {{ messages.serverChangeServer }}
            </AppButton>
          </div>

          <div v-if="server.info.setupRequired" class="flex flex-wrap items-center gap-2">
            <p class="text-xs text-muted">{{ messages.serverSetupRequired }}</p>
            <AppButton variant="outline" @click="openServerPage(server.url)">
              {{ messages.serverOpenPage }}
            </AppButton>
          </div>

          <template v-else>
            <AppButton
              v-if="server.info.auth.sso"
              color="primary"
              variant="solid"
              class="self-start"
              :disabled="busy"
              data-test-id="server-sso"
              @click="signInSSO"
            >
              {{ messages.serverSignInWith({ provider: server.info.auth.sso.label }) }}
            </AppButton>
            <form
              v-if="server.info.auth.password"
              class="flex flex-col gap-2 sm:max-w-80"
              @submit.prevent="signIn"
            >
              <AppInput
                v-model="email"
                autocomplete="username"
                data-test-id="server-email"
                :aria-label="messages.serverEmail"
                :placeholder="messages.serverEmail"
              />
              <AppInput
                v-model="password"
                type="password"
                autocomplete="current-password"
                data-test-id="server-password"
                :aria-label="messages.serverPassword"
                :placeholder="messages.serverPassword"
                @enter="signIn"
              />
              <AppButton
                type="submit"
                :color="server.info.auth.sso ? undefined : 'primary'"
                :variant="server.info.auth.sso ? 'outline' : 'solid'"
                class="self-start"
                :disabled="busy || !email.trim() || !password"
                data-test-id="server-sign-in"
              >
                {{ messages.serverSignIn }}
              </AppButton>
            </form>
          </template>
        </template>

        <p v-if="waitingForBrowser" class="text-xs text-muted" role="status">
          {{ messages.serverWaitingForBrowser }}
        </p>
        <p v-if="error" class="text-xs text-danger" role="alert" data-test-id="server-error">
          {{ error }}
        </p>
      </div>
    </SettingsGroup>
  </SettingsSection>
</template>
