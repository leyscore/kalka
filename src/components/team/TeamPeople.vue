<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed, onMounted, ref } from 'vue'

import { useCollaborationMessages, useI18n } from '@kalka/vue'

import { personPicture, useAvatar } from '@/app/collab/avatar'
import { serverAccount } from '@/app/collab/server/account'
import type { TeamInvite, TeamMember, TeamRole } from '@/app/collab/server/team-api'
import { toast } from '@/app/shell/ui'
import { useTeam } from '@/app/team/store'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import TeamInviteDialog from '@/components/team/TeamInviteDialog.vue'
import TeamPage from '@/components/team/TeamPage.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { AppConfirmationDialog } from '@/components/ui/dialog'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import { teamPage } from '@/theme/team'

/**
 * The team's people, for an administrator: each with their picture, role and what can be done to
 * their account, then the invitations no one has used yet, and a way to invite more.
 */
const messages = useCollaborationMessages()
const { common, locale } = useI18n()
const team = useTeam()
const avatar = useAvatar()
const ui = teamPage()
const menu = useMenuUI()
const item = menuItem()
const dangerItem = menuItem({ class: 'text-error' })
const { copy } = useClipboard()
const inviting = ref(false)
const removing = ref<TeamMember | null>(null)
const confirmRemove = computed({
  get: () => removing.value !== null,
  set: (open) => {
    if (!open) removing.value = null
  }
})

const serverName = computed(() => serverAccount.value?.serverName ?? '')
const selfId = computed(() => serverAccount.value?.user.id)
const roleOptions = computed(() => [
  { value: 'admin', label: messages.value.serverRoleAdmin },
  { value: 'editor', label: messages.value.serverRoleEditor },
  { value: 'viewer', label: messages.value.serverRoleViewer }
])
const errorText = computed(() => {
  const failure = team.error.value
  if (!failure) return ''
  return failure instanceof Error ? failure.message : String(failure)
})

onMounted(() => void team.refresh())

function roleLabel(role: TeamRole): string {
  return roleOptions.value.find((option) => option.value === role)?.label ?? role
}

function date(time: number): string {
  return new Date(time).toLocaleDateString(locale.value, { day: 'numeric', month: 'long' })
}

function picture(member: TeamMember): string {
  return member.id === selfId.value ? avatar.url.value : personPicture(member.id)
}

function status(member: TeamMember): string {
  if (member.lastSeenAt) return messages.value.lastSeen({ date: date(member.lastSeenAt) })
  return messages.value.neverSignedIn
}

async function run(action: () => Promise<unknown>): Promise<void> {
  try {
    await action()
  } catch (failure) {
    toast.error(failure instanceof Error ? failure.message : String(failure))
  }
}

function changeRole(member: TeamMember, role: unknown): void {
  if (role !== 'admin' && role !== 'editor' && role !== 'viewer') return
  void run(() => team.changeRole(member, role))
}

function sendResetLink(member: TeamMember): void {
  void run(async () => {
    const result = await team.resetLink(member)
    if (result.emailed) {
      toast.info(messages.value.resetLinkEmailed)
      return
    }
    await copy(result.url)
    toast.info(messages.value.resetLinkCopied)
  })
}

function confirmRemoval(): void {
  const member = removing.value
  removing.value = null
  if (member) void run(() => team.remove(member))
}

function inviteLabel(invite: TeamInvite): string {
  return invite.email ?? messages.value.inviteAnyone
}
</script>

<template>
  <TeamPage
    :heading="messages.teamPeople"
    :description="messages.peopleDescription({ server: serverName })"
    data-test-id="team-people"
  >
    <template #actions>
      <AppButton
        color="primary"
        variant="solid"
        data-test-id="team-invite"
        @click="inviting = true"
      >
        <template #leading><icon-hugeicons-user-add-01 class="size-3.5" /></template>
        {{ messages.invitePeople }}
      </AppButton>
    </template>

    <AppAlert v-if="errorText" tone="error" :heading="errorText" />

    <SettingsGroup data-test-id="team-members">
      <div
        v-for="member in team.members.value"
        :key="member.id"
        :class="ui.row()"
        :data-member="member.email"
      >
        <img :src="picture(member)" alt="" :class="ui.picture()" />
        <div :class="ui.person()">
          <span :class="ui.name()">
            <span class="truncate">{{ member.name }}</span>
            <span v-if="member.id === selfId" :class="ui.badge()">{{ messages.you }}</span>
            <span v-if="member.disabled" :class="ui.badge()">{{ messages.memberDisabled }}</span>
          </span>
          <span :class="ui.detail()">{{ member.email }} &ndash; {{ status(member) }}</span>
        </div>
        <span v-if="member.id === selfId" class="text-xs text-muted">{{
          roleLabel(member.role)
        }}</span>
        <AppSelect
          v-else
          :model-value="member.role"
          :options="roleOptions"
          :label="messages.inviteRole"
          :ui="{ trigger: 'w-36' }"
          @update:model-value="changeRole(member, $event)"
        />
        <DropdownMenuRoot v-if="member.id !== selfId">
          <DropdownMenuTrigger as-child>
            <IconButton :label="messages.memberActions({ name: member.name })">
              <icon-hugeicons-more-horizontal class="size-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" :side-offset="6" :class="menu.content">
              <DropdownMenuItem
                v-if="member.source === 'local'"
                :class="item"
                @select="sendResetLink(member)"
              >
                {{ messages.sendResetLink }}
              </DropdownMenuItem>
              <DropdownMenuItem
                :class="item"
                @select="run(() => team.setDisabled(member, !member.disabled))"
              >
                {{ member.disabled ? messages.enableAccount : messages.disableAccount }}
              </DropdownMenuItem>
              <DropdownMenuItem :class="dangerItem" @select="removing = member">
                {{ messages.removeMember }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </SettingsGroup>

    <SettingsSection v-if="team.invites.value.length" data-test-id="team-invites">
      <template #title>{{ messages.pendingInvites }}</template>
      <SettingsGroup>
        <div v-for="invite in team.invites.value" :key="invite.id" :class="ui.row()">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-panel-field text-muted"
          >
            <icon-hugeicons-mail-01 class="size-4" />
          </span>
          <div :class="ui.person()">
            <span :class="ui.name()">{{ inviteLabel(invite) }}</span>
            <span :class="ui.detail()">
              {{ roleLabel(invite.role) }} &ndash;
              {{ messages.inviteExpires({ date: date(invite.expiresAt) }) }}
            </span>
          </div>
          <AppButton variant="outline" @click="run(() => team.revoke(invite))">
            {{ messages.revokeInvite }}
          </AppButton>
        </div>
      </SettingsGroup>
    </SettingsSection>

    <TeamInviteDialog v-model:open="inviting" :server="serverName" />
    <AppConfirmationDialog
      v-model:open="confirmRemove"
      :heading="messages.removeMember"
      :description="messages.removeMemberConfirm({ name: removing?.name ?? '' })"
      :cancel-label="common.cancel"
      :confirm-label="messages.removeMember"
      tone="danger"
      @confirm="confirmRemoval"
    />
  </TeamPage>
</template>
