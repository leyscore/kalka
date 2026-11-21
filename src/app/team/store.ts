import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

import { serverAccount, withServerSession } from '@/app/collab/server/account'
import {
  teamAPI,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
  type TeamSettings
} from '@/app/collab/server/team-api'

const SERVER_NAME_SETTING = 'KALKA_SERVER_NAME'
const LOCAL_LOGIN_SETTING = 'KALKA_LOCAL_LOGIN'

/** What a created invitation gives back: the link to share, and whether it went by email. */
export interface CreatedInvite {
  email: string | null
  url: string
  emailed: boolean
}

/**
 * The team of the signed-in server, as its administrator manages it from the app: people,
 * waiting invitations and the few settings that belong in the app; the rest stays in the
 * server's console.
 */
export const useTeam = createGlobalState(() => {
  const members = ref<TeamMember[]>([])
  const invites = ref<TeamInvite[]>([])
  const settings = ref<TeamSettings | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  const isAdmin = computed(() => serverAccount.value?.user.role === 'admin')

  async function refresh(): Promise<void> {
    if (!isAdmin.value) return
    loading.value = true
    error.value = null
    try {
      const [people, waiting, values] = await withServerSession((url, token) =>
        Promise.all([
          teamAPI.members(url, token),
          teamAPI.invites(url, token),
          teamAPI.settings(url, token)
        ])
      )
      members.value = people
      invites.value = waiting
      settings.value = values
    } catch (failure) {
      error.value = failure
    } finally {
      loading.value = false
    }
  }

  async function changeRole(member: TeamMember, role: TeamRole): Promise<void> {
    const updated = await withServerSession((url, token) =>
      teamAPI.updateMember(url, token, member.id, { role })
    )
    replace(updated)
  }

  async function setDisabled(member: TeamMember, disabled: boolean): Promise<void> {
    const updated = await withServerSession((url, token) =>
      teamAPI.updateMember(url, token, member.id, { disabled })
    )
    replace(updated)
  }

  async function remove(member: TeamMember): Promise<void> {
    await withServerSession((url, token) => teamAPI.removeMember(url, token, member.id))
    members.value = members.value.filter((other) => other.id !== member.id)
  }

  function resetLink(member: TeamMember): Promise<{ url: string; emailed: boolean }> {
    return withServerSession((url, token) => teamAPI.resetLink(url, token, member.id))
  }

  /** One invitation per address, or one link for anyone when there is none. */
  async function invite(emails: string[], role: TeamRole): Promise<CreatedInvite[]> {
    const targets = emails.length > 0 ? emails : [null]
    const created = await withServerSession((url, token) =>
      Promise.all(
        targets.map(async (email) => {
          const result = await teamAPI.invite(url, token, role, email ?? undefined)
          return { email, url: result.url, emailed: result.emailed }
        })
      )
    )
    invites.value = await withServerSession((url, token) => teamAPI.invites(url, token))
    return created
  }

  async function revoke(invite: TeamInvite): Promise<void> {
    await withServerSession((url, token) => teamAPI.revokeInvite(url, token, invite.id))
    invites.value = invites.value.filter((other) => other.id !== invite.id)
  }

  async function saveSettings(values: Record<string, string>): Promise<void> {
    await withServerSession((url, token) => teamAPI.updateSettings(url, token, values))
    settings.value = await withServerSession((url, token) => teamAPI.settings(url, token))
  }

  function replace(member: TeamMember): void {
    members.value = members.value.map((other) => (other.id === member.id ? member : other))
  }

  return {
    members,
    invites,
    settings,
    loading,
    error,
    isAdmin,
    refresh,
    changeRole,
    setDisabled,
    remove,
    resetLink,
    invite,
    revoke,
    saveSettings,
    SERVER_NAME_SETTING,
    LOCAL_LOGIN_SETTING
  }
})
