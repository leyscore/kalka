<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCollaborationMessages } from '@kalka/vue'

import {
  describeServer,
  serverAccount,
  serverSessionExpired,
  signInWithPassword,
  signInWithSSO,
  signOutOfServer
} from '@/app/collab/server/account'
import type { ServerInfo } from '@/app/collab/server/api'
import { refreshServerDocuments } from '@/app/collab/server/documents'
import { linkedServerURL } from '@/app/collab/server/links'
import { serverProblem, type ServerProblem } from '@/app/collab/server/problem'
import { showHomeFiles } from '@/app/home/show'
import { closeSettings } from '@/app/settings/open'
import { openExternalLink } from '@/app/shell/ui'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsLink from '@/components/settings/layout/SettingsLink.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { SERVER_GUIDE_URL } from '@/constants'

import { serverProblemText } from './problemText'

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
const problem = ref<ServerProblem | null>(null)
const error = computed(() =>
  problem.value ? serverProblemText(messages.value, problem.value) : null
)

const signedIn = computed(() => serverAccount.value !== null && !serverSessionExpired.value)
const roleLabel = computed(() => {
  const role = serverAccount.value?.user.role
  if (role === 'admin') return messages.value.serverRoleAdmin
  if (role === 'viewer') return messages.value.serverRoleViewer
  return messages.value.serverRoleEditor
})

async function run(task: () => Promise<unknown>) {
  busy.value = true
  problem.value = null
  try {
    await task()
  } catch (reason) {
    problem.value = serverProblem(reason)
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

/** Home on the server's list of files, where the team's files are. */
function seeFiles() {
  closeSettings()
  showHomeFiles('server')
}

// A `kalka://server` link fills in the address and looks the server up; signing in stays manual.
watch(
  linkedServerURL,
  (url) => {
    if (!url) return
    linkedServerURL.value = null
    if (serverAccount.value?.url === url && signedIn.value) return
    server.value = null
    address.value = url
    lookUp()
  },
  { immediate: true }
)

function openServerPage(url: string) {
  void openExternalLink(url)
}
</script>

<template>
  <SettingsSection data-test-id="settings-server">
    <template #title>{{ messages.serverSettingsTitle }}</template>
    <template #description>
      {{ messages.serverSettingsDescription }}
      <SettingsLink :href="SERVER_GUIDE_URL">{{ messages.serverWhatIs }}</SettingsLink>
    </template>

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
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-3.5 py-3"
      >
        <p class="min-w-0 flex-1 text-xs text-surface">
          {{ messages.serverFilesWhere({ server: serverAccount.serverName }) }}
        </p>
        <AppButton
          color="primary"
          variant="solid"
          data-test-id="server-see-files"
          @click="seeFiles"
        >
          {{ messages.serverSeeFiles }}
        </AppButton>
      </div>
      <p class="px-3.5 pb-3 text-[11px] text-muted">{{ messages.serverOpenPageDescription }}</p>
    </SettingsGroup>

    <SettingsGroup v-else>
      <div class="flex flex-col gap-3 px-3.5 py-3">
        <AppAlert
          v-if="serverSessionExpired && serverAccount"
          tone="warning"
          :heading="messages.serverSessionExpired"
          :description="serverAccount.url"
        >
          <template #actions>
            <AppButton
              variant="outline"
              :disabled="busy"
              data-test-id="server-sign-out"
              @click="signOut"
            >
              {{ messages.serverSignOut }}
            </AppButton>
          </template>
        </AppAlert>
        <div v-if="!server" class="flex flex-col gap-1">
          <label for="server-address-input" class="text-xs text-muted">
            {{ messages.serverAddress }}
          </label>
          <div class="flex flex-wrap items-center gap-1.5">
            <AppInput
              id="server-address-input"
              v-model="address"
              data-test-id="server-address"
              class="min-w-0 flex-1 sm:max-w-80"
              :placeholder="messages.serverAddressPlaceholder"
              @enter="lookUp"
            />
            <AppButton
              color="primary"
              variant="solid"
              :disabled="busy || !address.trim()"
              data-test-id="server-continue"
              @click="lookUp"
            >
              {{ messages.serverContinue }}
            </AppButton>
          </div>
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

          <AppAlert v-if="server.info.setupRequired" :heading="messages.serverSetupRequired">
            <template #actions>
              <AppButton variant="outline" @click="openServerPage(server.url)">
                {{ messages.serverOpenPage }}
              </AppButton>
            </template>
          </AppAlert>

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
              <label for="server-email-input" class="text-xs text-muted">
                {{ messages.serverEmail }}
              </label>
              <AppInput
                id="server-email-input"
                v-model="email"
                autocomplete="username"
                data-test-id="server-email"
              />
              <label for="server-password-input" class="text-xs text-muted">
                {{ messages.serverPassword }}
              </label>
              <AppInput
                id="server-password-input"
                v-model="password"
                type="password"
                autocomplete="current-password"
                data-test-id="server-password"
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

        <AppAlert v-if="waitingForBrowser" :heading="messages.serverWaitingForBrowser" />
        <AppAlert v-if="error" tone="error" :heading="error" data-test-id="server-error" />
      </div>
    </SettingsGroup>
  </SettingsSection>
</template>
