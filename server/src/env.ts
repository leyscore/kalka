import type { Directory } from './directory'
import type { DocumentRoom } from './room'

export interface Env {
  DIRECTORY: DurableObjectNamespace<Directory>
  ROOMS: DurableObjectNamespace<DocumentRoom>
  /** Typed once to create the first administrator. */
  KALKA_SETUP_CODE?: string
  KALKA_SERVER_NAME?: string
  /** The server's own address, when a proxy hides it from requests. */
  KALKA_PUBLIC_URL?: string
  /** Web origins of Kalka editors allowed to receive sign-in codes, comma-separated. */
  KALKA_APP_ORIGINS?: string
  /**
   * Set per request by a host that runs many tenants on one deployment, to give each its own
   * directory and rooms. Leave unset on a self-hosted server.
   */
  KALKA_TENANT?: string
  /** "false" turns off email and password sign-in, once single sign-on works. */
  KALKA_LOCAL_LOGIN?: string
  /** Docker: how many reverse proxies stand in front, whose X-Forwarded-For entries are trusted. */
  KALKA_TRUSTED_PROXIES?: string
  /** "true" lets single sign-on link to existing password accounts by verified email. */
  KALKA_OIDC_LINK_LOCAL_ACCOUNTS?: string
  /** Any other KALKA_* setting, read by the enterprise module. */
  [key: string]: unknown
}

export type Role = 'admin' | 'editor' | 'viewer'
export const ROLES: readonly Role[] = ['admin', 'editor', 'viewer']

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  source: 'local' | 'sso'
  disabled: boolean
  createdAt: number
  lastSeenAt: number | null
  /** Created or updated by an identity provider (user provisioning). */
  provisioned: boolean
}

export interface DocumentInfo {
  id: string
  name: string
  createdBy: string
  createdAt: number
  updatedAt: number
  /** Whether a Kalka file of the document has been saved on the server. */
  hasFile: boolean
  /** Kalka windows that have it open now. */
  live: number
  /** Size and save time of the Kalka file, when the server knows them. */
  fileSize: number | null
  fileSavedAt: number | null
  /** A file uploaded outside Kalka (WebDAV, a restore), waiting for a Kalka client to apply it. */
  pending: { at: number; by: string } | null
}

export const SERVER_VERSION = '0.1.0'

export function setting(env: Env, name: string): string | undefined {
  const value = env[name]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

export function listSetting(env: Env, name: string): string[] {
  return (setting(env, name) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

/** Settings an administrator may change from the console; the environment wins over them. */
export const CONSOLE_SETTINGS = [
  'KALKA_SERVER_NAME', 'KALKA_LOCAL_LOGIN', 'KALKA_APP_ORIGINS', 'KALKA_LICENSE_KEY',
  'KALKA_SMTP_HOST', 'KALKA_SMTP_PORT', 'KALKA_SMTP_SECURE', 'KALKA_SMTP_USER', 'KALKA_SMTP_PASSWORD', 'KALKA_SMTP_FROM',
  'KALKA_OIDC_ISSUER', 'KALKA_OIDC_CLIENT_ID', 'KALKA_OIDC_CLIENT_SECRET', 'KALKA_OIDC_LABEL', 'KALKA_OIDC_SCOPES',
  'KALKA_OIDC_GROUPS_CLAIM', 'KALKA_OIDC_ADMIN_GROUPS', 'KALKA_OIDC_EDITOR_GROUPS', 'KALKA_OIDC_VIEWER_GROUPS',
  'KALKA_OIDC_ALLOWED_GROUPS', 'KALKA_OIDC_DEFAULT_ROLE', 'KALKA_OIDC_TRUST_EMAIL', 'KALKA_OIDC_TOKEN_AUTH'
] as const

/** Never sent back to the console, only whether they are set. */
export const SECRET_SETTINGS = new Set(['KALKA_SMTP_PASSWORD', 'KALKA_OIDC_CLIENT_SECRET', 'KALKA_LICENSE_KEY'])

/** The settings in force: each from the environment when it sets one, else from the console. */
export function withStoredSettings(env: Env, stored: Record<string, string>): Env {
  const merged: Env = Object.assign(Object.create(null) as Env, env)
  // Only allowed settings are ever stored: the core's and those the enterprise module declares.
  for (const [key, value] of Object.entries(stored)) {
    if (key.startsWith('KALKA_') && key !== 'KALKA_TENANT' && setting(env, key) === undefined) merged[key] = value
  }
  merged.DIRECTORY = env.DIRECTORY
  merged.ROOMS = env.ROOMS
  return merged
}
