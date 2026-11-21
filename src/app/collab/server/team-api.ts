import * as v from 'valibot'

import { serverRequest, serverRoleSchema } from './api'

/**
 * The team's side of a Kalka server's API: its people, its invitations and the settings an
 * administrator changes from the app. Only administrators may call it.
 */

export const teamMemberSchema = v.object({
  id: v.string(),
  email: v.string(),
  name: v.string(),
  role: serverRoleSchema,
  source: v.picklist(['local', 'sso']),
  disabled: v.boolean(),
  createdAt: v.number(),
  lastSeenAt: v.nullable(v.number()),
  provisioned: v.optional(v.boolean(), false)
})
export type TeamMember = v.InferOutput<typeof teamMemberSchema>

export const teamInviteSchema = v.object({
  id: v.string(),
  role: serverRoleSchema,
  email: v.nullable(v.string()),
  expiresAt: v.number()
})
export type TeamInvite = v.InferOutput<typeof teamInviteSchema>

const createdInviteSchema = v.object({
  code: v.string(),
  expiresAt: v.number(),
  url: v.string(),
  emailed: v.boolean()
})

export const teamSettingsSchema = v.object({
  values: v.record(v.string(), v.string()),
  locked: v.array(v.string()),
  emailReady: v.boolean()
})
export type TeamSettings = v.InferOutput<typeof teamSettingsSchema>

export type TeamRole = TeamMember['role']

export const teamAPI = {
  members: (base: string, token: string) =>
    serverRequest(base, '/api/users', { token, schema: v.array(teamMemberSchema) }),
  updateMember: (
    base: string,
    token: string,
    id: string,
    change: { role?: TeamRole; disabled?: boolean }
  ) =>
    serverRequest(base, `/api/users/${id}`, {
      method: 'PATCH',
      token,
      body: change,
      schema: teamMemberSchema
    }),
  removeMember: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/users/${id}`, { method: 'DELETE', token, schema: v.unknown() }),
  resetLink: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/users/${id}/reset`, {
      method: 'POST',
      token,
      body: {},
      schema: v.object({ url: v.string(), emailed: v.boolean() })
    }),
  invites: (base: string, token: string) =>
    serverRequest(base, '/api/invites', { token, schema: v.array(teamInviteSchema) }),
  invite: (base: string, token: string, role: TeamRole, email?: string) =>
    serverRequest(base, '/api/invites', {
      method: 'POST',
      token,
      body: email ? { role, email } : { role },
      schema: createdInviteSchema
    }),
  revokeInvite: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/invites/${id}`, { method: 'DELETE', token, schema: v.unknown() }),
  settings: (base: string, token: string) =>
    serverRequest(base, '/api/settings', { token, schema: teamSettingsSchema }),
  updateSettings: (base: string, token: string, values: Record<string, string>) =>
    serverRequest(base, '/api/settings', {
      method: 'PUT',
      token,
      body: { values },
      schema: v.unknown()
    })
}
