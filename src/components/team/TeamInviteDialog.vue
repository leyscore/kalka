<script setup lang="ts">
import { compact } from 'es-toolkit'
import { computed, ref, watch } from 'vue'

import { useCollaborationMessages, useI18n } from '@kalka/vue'

import type { TeamRole } from '@/app/collab/server/team-api'
import { toast } from '@/app/shell/ui'
import { useTeam, type CreatedInvite } from '@/app/team/store'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppCopyField from '@/components/ui/input/AppCopyField.vue'
import AppTextarea from '@/components/ui/input/AppTextarea.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/**
 * Inviting people to the team: addresses and a role send invitations by email, or, with no
 * address, make a link to share. Links that did not go by email are shown to copy.
 */
const { server } = defineProps<{ server: string }>()
const open = defineModel<boolean>('open', { default: false })
const messages = useCollaborationMessages()
const { common } = useI18n()
const team = useTeam()
const emails = ref('')
const role = ref<TeamRole>('editor')
const busy = ref(false)
const error = ref('')
const created = ref<CreatedInvite[]>([])

const roleOptions = computed(() => [
  { value: 'editor', label: messages.value.serverRoleEditor },
  { value: 'viewer', label: messages.value.serverRoleViewer },
  { value: 'admin', label: messages.value.serverRoleAdmin }
])
const addresses = computed(() => compact(emails.value.split(/[\s,;]+/)))
const links = computed(() => created.value.filter((invite) => !invite.emailed))

watch(open, (isOpen) => {
  if (!isOpen) return
  emails.value = ''
  error.value = ''
  created.value = []
})

function setRole(value: unknown): void {
  if (value === 'admin' || value === 'editor' || value === 'viewer') role.value = value
}

async function send(): Promise<void> {
  busy.value = true
  error.value = ''
  try {
    created.value = await team.invite(addresses.value, role.value)
    if (links.value.length === 0) {
      toast.info(messages.value.invitesSent({ count: String(created.value.length) }))
      open.value = false
    }
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AppDialogRoot v-model:open="open" size="md" data-test-id="team-invite-dialog">
    <AppDialogHeader :heading="messages.inviteTitle({ server })" />
    <AppDialogBody>
      <div v-if="links.length" class="flex flex-col gap-3">
        <p class="m-0 text-[13px] text-surface">{{ messages.inviteLinkReady }}</p>
        <div v-for="invite in links" :key="invite.url" class="flex flex-col gap-1">
          <span v-if="invite.email" class="text-xs text-muted">{{ invite.email }}</span>
          <AppCopyField
            :value="invite.url"
            :copy-label="common.copy"
            :copied-label="common.copied"
          />
        </div>
      </div>
      <form v-else class="flex flex-col gap-4" @submit.prevent="send">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-medium text-surface">{{ messages.inviteEmails }}</span>
          <AppTextarea
            v-model="emails"
            :rows="3"
            placeholder="ada@example.com, grace@example.com"
            data-test-id="team-invite-emails"
          />
          <span class="text-xs text-muted">{{ messages.inviteEmailsHint }}</span>
        </label>
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-medium text-surface">{{ messages.inviteRole }}</span>
          <AppSelect
            :model-value="role"
            :options="roleOptions"
            :label="messages.inviteRole"
            :ui="{ trigger: 'w-44' }"
            @update:model-value="setRole"
          />
        </div>
        <AppAlert v-if="error" tone="error" :heading="error" />
      </form>
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton v-if="links.length" color="primary" variant="solid" @click="open = false">
        {{ common.done }}
      </AppButton>
      <template v-else>
        <AppButton variant="ghost" @click="open = false">{{ common.cancel }}</AppButton>
        <AppButton
          color="primary"
          variant="solid"
          :loading="busy"
          data-test-id="team-invite-send"
          @click="send"
        >
          {{ addresses.length ? messages.sendInvites : messages.createInviteLink }}
        </AppButton>
      </template>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
