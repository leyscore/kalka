import type { Directory } from '../directory'
import type { Env, User } from '../env'
import type { DocumentRoom } from '../room'

/**
 * What the core server lends the enterprise module. The module itself is not in this
 * repository: `scripts/fetch-ee.mjs` adds it at build time when a license key is set.
 *
 * The core knows no enterprise feature. It lends generic hooks: events it emits, a scheduled
 * call (Cron Trigger and the directory's alarm), routes under prefixes the module owns, storage
 * the module shapes itself (its own `ee_*` tables in the directory), and the account and file
 * primitives every feature of the server uses.
 */
export interface EnterpriseHost {
  env: Env
  /** The directory: accounts, files, settings, and the module's own tables (`eeSql`, `eeBatch`). */
  directory: DurableObjectStub<Directory>
  /** The server's public address, without a trailing slash. */
  publicUrl: string
  /** The license key: KALKA_LICENSE_KEY at run time, or, on Cloudflare's own builds only, the one the build was made with. */
  licenseKey: string | null
  /** The directory's name, which rooms keep with a file (`putFile`). */
  directoryName: string
  /** The room that holds a document. */
  room(documentId: string): DurableObjectStub<DocumentRoom>
  /** The signed-in account a request carries, if any. */
  user(request: Request): Promise<User | null>
  /** Emails every administrator, when email is set up. */
  notifyAdmins(subject: string, text: string): Promise<void>
  /** Whether a sign-in may hand its one-time code to this address. */
  isAllowedReturn(url: string): boolean
  /** Emits an event as the core does (it reaches `EnterpriseModule.event`). */
  emit(action: string, actor: EventActor, target: string | null, detail?: Record<string, unknown>): Promise<void>
}

export type EventActor = Pick<User, 'id' | 'email' | 'name'> | null

/** Something that happened on the server: sign-ins, accounts, roles, invitations, files, settings. */
export interface ServerEvent {
  at: number
  action: string
  actor: EventActor
  target: string | null
  detail: Record<string, unknown> | null
  ip: string | null
  country: string | null
  userAgent: string | null
}

export interface LicenseStatus {
  valid: boolean
  customer: string | null
  seats: number
  usedSeats: number
  expiresAt: string | null
  /** Why the license does not apply, in plain words for an administrator. */
  problem: string | null
  /** What the license grants. */
  features?: string[]
}

export interface EnterpriseStatus {
  /** Present when single sign-on is configured and licensed. */
  sso: { label: string; startPath: string } | null
  license: LicenseStatus
}

/** URL prefixes the module answers; the core sends their requests to `handle`. */
export const ENTERPRISE_PREFIXES = ['/auth/', '/scim/', '/api/ee/'] as const

export interface EnterpriseModule {
  version: string
  status(host: EnterpriseHost): Promise<EnterpriseStatus>
  /** Handles requests under ENTERPRISE_PREFIXES; null lets the core answer 404. */
  handle(request: Request, host: EnterpriseHost): Promise<Response | null>
  /** The features a valid license grants, checked offline. Older modules lack it: none. */
  features?(host: EnterpriseHost): Promise<string[]>
  /** Settings the module reads, which the console may save; `secrets` are never sent back. */
  settings?: { keys: readonly string[]; secrets: readonly string[] }
  /** Every event the core emits, for the module to keep or ignore. */
  event?(host: EnterpriseHost, event: ServerEvent): Promise<void>
  /**
   * Called by the hourly Cron Trigger ("cron"), the directory's alarm ("alarm", set with
   * `directory.wakeAt`), and after settings change ("settings").
   */
  scheduled?(host: EnterpriseHost, reason: 'cron' | 'alarm' | 'settings'): Promise<void>
}
