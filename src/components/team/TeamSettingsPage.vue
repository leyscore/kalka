<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useCollaborationMessages, useI18n } from '@kalka/vue'

import { serverAccount } from '@/app/collab/server/account'
import { openExternalLink, toast } from '@/app/shell/ui'
import { useTeam } from '@/app/team/store'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import TeamPage from '@/components/team/TeamPage.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

/**
 * The team's settings that belong in the app: its name and whether people may sign in with a
 * password. Single sign-on, email, the license and backups stay in the server's console.
 */
const messages = useCollaborationMessages()
const { common } = useI18n()
const team = useTeam()
const name = ref('')
const saving = ref(false)

const values = computed(() => team.settings.value?.values ?? {})
const locked = computed(() => new Set(team.settings.value?.locked))
const nameLocked = computed(() => locked.value.has(team.SERVER_NAME_SETTING))
const passwordLocked = computed(() => locked.value.has(team.LOCAL_LOGIN_SETTING))
const passwordSignIn = computed(() => values.value[team.LOCAL_LOGIN_SETTING] !== 'false')
const nameChanged = computed(
  () => name.value.trim() !== (values.value[team.SERVER_NAME_SETTING] ?? '')
)

onMounted(() => void team.refresh())
watch(
  () => values.value[team.SERVER_NAME_SETTING],
  (saved) => {
    name.value = saved ?? serverAccount.value?.serverName ?? ''
  },
  { immediate: true }
)

async function save(change: Record<string, string>): Promise<void> {
  saving.value = true
  try {
    await team.saveSettings(change)
  } catch (failure) {
    toast.error(failure instanceof Error ? failure.message : String(failure))
  } finally {
    saving.value = false
  }
}

function openConsole(): void {
  const url = serverAccount.value?.url
  if (url) void openExternalLink(url)
}
</script>

<template>
  <TeamPage
    :heading="messages.teamSettings"
    :description="messages.teamSettingsDescription"
    data-test-id="team-settings"
  >
    <SettingsGroup>
      <SettingsRow
        :label="messages.teamName"
        :description="nameLocked ? messages.setByServer : messages.teamNameHint"
        class="max-sm:flex-col max-sm:items-stretch"
      >
        <form
          class="flex gap-1.5"
          @submit.prevent="save({ [team.SERVER_NAME_SETTING]: name.trim() })"
        >
          <AppInput
            v-model="name"
            :aria-label="messages.teamName"
            :disabled="nameLocked"
            class="w-full sm:w-56"
            data-test-id="team-name"
          />
          <AppButton
            type="submit"
            :disabled="nameLocked || !nameChanged || !name.trim()"
            :loading="saving"
          >
            {{ common.save }}
          </AppButton>
        </form>
      </SettingsRow>
      <SettingsRow
        :label="messages.passwordSignIn"
        :description="passwordLocked ? messages.setByServer : messages.passwordSignInHint"
      >
        <AppSwitch
          :model-value="passwordSignIn"
          :label="messages.passwordSignIn"
          :disabled="passwordLocked || saving"
          @update:model-value="save({ [team.LOCAL_LOGIN_SETTING]: $event ? 'true' : 'false' })"
        />
      </SettingsRow>
      <SettingsRow
        :label="messages.serverEmail"
        :description="
          team.settings.value?.emailReady ? messages.emailReady : messages.emailNotReady
        "
      />
    </SettingsGroup>

    <SettingsGroup>
      <SettingsRow :label="messages.openConsole" :description="messages.consoleHint">
        <AppButton variant="outline" @click="openConsole">
          <template #leading><icon-hugeicons-link-square-02 class="size-3.5" /></template>
          {{ messages.openConsole }}
        </AppButton>
      </SettingsRow>
    </SettingsGroup>
  </TeamPage>
</template>
