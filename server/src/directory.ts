import { DurableObject } from 'cloudflare:workers'

import enterprise from './ee/module'
import type { EnterpriseHost } from './ee/types'
import { enterpriseHost, serverUrl } from './enterprise'
import { hashPassword, hashToken, randomId, randomToken, verifyPassword } from './crypto'
import { withStoredSettings, type DocumentInfo, type Env, type Role, type User } from './env'

const DAY = 24 * 60 * 60 * 1000
const SESSION_MS = 30 * DAY
const INVITE_MS = 7 * DAY
const TICKET_MS = 60 * 1000
const LOGIN_CODE_MS = 2 * 60 * 1000
const RESET_MS = 60 * 60 * 1000
/** How often a user's last activity is written, so every request does not write. */
const SEEN_EVERY_MS = 60 * 1000

export type Failure = { error: string; status: number }
export type Result<T> = T | Failure

export function failed<T>(result: Result<T>): result is Failure {
  if (typeof result !== 'object' || result === null) return false
  const candidate = result as { error?: unknown; status?: unknown }
  return typeof candidate.error === 'string' && typeof candidate.status === 'number'
}

function failure(status: number, error: string): Failure {
  return { error, status }
}

type UserRow = {
  id: string
  email: string
  name: string
  password: string | null
  role: Role
  source: 'local' | 'sso'
  subject: string | null
  disabled: number
  created_at: number
  last_seen: number | null
  provisioned: number | null
}

type DocumentRow = {
  id: string
  name: string
  created_by: string
  created_at: number
  updated_at: number
  has_file: number
  live: number
  file_size: number | null
  file_at: number | null
  pending_at: number | null
  pending_by: string | null
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    source: row.source,
    disabled: row.disabled === 1,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen,
    provisioned: row.provisioned === 1
  }
}

function toDocument(row: DocumentRow): DocumentInfo {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasFile: row.has_file === 1,
    live: row.live ?? 0,
    fileSize: row.file_size ?? null,
    fileSavedAt: row.file_at ?? null,
    pending: row.pending_at ? { at: row.pending_at, by: row.pending_by ?? '' } : null
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password TEXT,
  role TEXT NOT NULL,
  source TEXT NOT NULL,
  subject TEXT UNIQUE,
  disabled INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_seen INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS invites (
  hash TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  created_by TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  has_file INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE IF NOT EXISTS attempts (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS flags (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_passwords (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  last_used INTEGER
);
CREATE TABLE IF NOT EXISTS secrets (
  hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
`

const EMAIL = /^[^\s@]+@[^\s@]+$/

function checkAccount(email: string, name: string, password: string): Failure | null {
  if (!EMAIL.test(email) || email.length > 254) return failure(400, 'Enter a valid email address.')
  if (name.trim() === '' || name.length > 100) return failure(400, 'Enter a name.')
  if (password.length < 10) return failure(400, 'Use a password of at least 10 characters.')
  if (password.length > 1024) return failure(400, 'That password is too long.')
  return null
}

/** Accounts, sessions, invitations and the list of documents: one per server. */
export class Directory extends DurableObject<Env> {
  private sql: SqlStorage
  /** The address and tenant requests last came with, written when they change. */
  private seen: string | null = null

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(SCHEMA)
    // Columns added after the first release; existing servers gain them here.
    for (const column of [
      'ALTER TABLE documents ADD COLUMN live INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE invites ADD COLUMN email TEXT',
      'ALTER TABLE documents ADD COLUMN file_size INTEGER',
      'ALTER TABLE documents ADD COLUMN file_at INTEGER',
      'ALTER TABLE documents ADD COLUMN pending_at INTEGER',
      'ALTER TABLE documents ADD COLUMN pending_by TEXT',
      'ALTER TABLE users ADD COLUMN provisioned INTEGER NOT NULL DEFAULT 0'
    ]) {
      try {
        this.sql.exec(column)
      } catch {
        // Already there.
      }
    }
  }

  // ---------- For the enterprise module: its own tables, a wake-up time, its scheduled work ----------

  /** Schemas the module asked for, applied once per instance. */
  private eeSchemas = new Set<string>()

  private eeSchema(schema?: string): void {
    if (!schema || this.eeSchemas.has(schema)) return
    this.sql.exec(schema)
    this.eeSchemas.add(schema)
  }

  /**
   * Runs one statement for the enterprise module, which keeps its data in `ee_*` tables it
   * creates with `schema` (applied once per instance). Returns the rows.
   */
  eeSql(query: string, params: unknown[] = [], schema?: string): Record<string, SqlStorageValue>[] {
    this.eeSchema(schema)
    return this.sql.exec(query, ...params).toArray()
  }

  /** Several statements in one transaction; the rows of each. */
  eeBatch(statements: [query: string, params: unknown[]][], schema?: string): Record<string, SqlStorageValue>[][] {
    this.eeSchema(schema)
    return this.ctx.storage.transactionSync(() => statements.map(([query, params]) => this.sql.exec(query, ...params).toArray()))
  }

  /** When the module wants its scheduled call (`EnterpriseModule.scheduled`, "alarm"); null for never. */
  async wakeAt(at: number | null): Promise<void> {
    if (at === null) await this.ctx.storage.deleteAlarm()
    else await this.ctx.storage.setAlarm(at)
  }

  /** The host the module gets when the directory calls it, without a request. */
  private selfHost(): EnterpriseHost {
    const env = withStoredSettings(this.env, this.getSettings())
    const tenant = this.getFlag('tenant')
    if (tenant) env.KALKA_TENANT = tenant
    return enterpriseHost(env, null, serverUrl(env, null, this.getFlag('origin')), this as unknown as EnterpriseHost['directory'])
  }

  private async runScheduled(reason: 'cron' | 'alarm' | 'settings'): Promise<void> {
    if (!enterprise?.scheduled) return
    try {
      await enterprise.scheduled(this.selfHost(), reason)
    } catch (error) {
      console.error('[kalka] Enterprise scheduled work failed', error)
    }
  }

  async alarm(): Promise<void> {
    await this.runScheduled('alarm')
  }

  /** The hourly Cron Trigger's call, run here so the module works beside this directory. */
  scheduled(): Promise<void> {
    return this.runScheduled('cron')
  }

  private one<T>(query: string, ...params: unknown[]): T | undefined {
    return this.sql.exec(query, ...params).toArray()[0] as T | undefined
  }

  private all<T>(query: string, ...params: unknown[]): T[] {
    return this.sql.exec(query, ...params).toArray() as T[]
  }

  private userById(id: string): UserRow | undefined {
    return this.one<UserRow>('SELECT * FROM users WHERE id = ?', id)
  }

  userCount(): number {
    return this.one<{ count: number }>('SELECT COUNT(*) AS count FROM users')?.count ?? 0
  }

  private async newSession(userId: string): Promise<string> {
    const token = randomToken()
    this.sql.exec(
      'INSERT INTO sessions (hash, user_id, expires_at) VALUES (?, ?, ?)',
      await hashToken(token),
      userId,
      Date.now() + SESSION_MS
    )
    this.sql.exec('DELETE FROM sessions WHERE expires_at < ?', Date.now())
    return token
  }

  private insertUser(user: {
    email: string
    name: string
    password: string | null
    role: Role
    source: 'local' | 'sso'
    subject?: string
    /** Provisioned accounts have not signed in yet, so they take no seat. */
    provisioned?: boolean
  }): UserRow {
    const now = Date.now()
    const id = randomId(16)
    this.sql.exec(
      'INSERT INTO users (id, email, name, password, role, source, subject, created_at, last_seen, provisioned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      user.email,
      user.name.trim(),
      user.password,
      user.role,
      user.source,
      user.subject ?? null,
      now,
      user.provisioned ? null : now,
      user.provisioned ? 1 : 0
    )
    const row = this.userById(id)
    if (!row) throw new Error('User was not saved')
    return row
  }

  /** Creates the first administrator. The setup code is checked by the caller. */
  async setup(input: {
    email: string
    name: string
    password: string
  }): Promise<Result<{ token: string; user: User }>> {
    if (this.userCount() > 0) return failure(409, 'This server is already set up.')
    const invalid = checkAccount(input.email, input.name, input.password)
    if (invalid) return invalid
    const row = this.insertUser({
      email: input.email,
      name: input.name,
      password: await hashPassword(input.password),
      role: 'admin',
      source: 'local'
    })
    return { token: await this.newSession(row.id), user: toUser(row) }
  }

  async login(email: string, password: string): Promise<Result<{ token: string; user: User }>> {
    const row = this.one<UserRow>('SELECT * FROM users WHERE email = ?', email)
    const valid = row?.password ? await verifyPassword(password, row.password) : false
    if (!row || !valid) return failure(401, 'Wrong email or password.')
    if (row.disabled) return failure(403, 'This account is disabled.')
    return { token: await this.newSession(row.id), user: toUser(row) }
  }

  async authenticate(token: string): Promise<User | null> {
    const hash = await hashToken(token)
    const session = this.one<{ user_id: string; expires_at: number }>(
      'SELECT user_id, expires_at FROM sessions WHERE hash = ?',
      hash
    )
    const now = Date.now()
    if (!session || session.expires_at < now) return null
    const row = this.userById(session.user_id)
    if (!row || row.disabled) return null
    if (!row.last_seen || now - row.last_seen > SEEN_EVERY_MS) {
      this.sql.exec('UPDATE users SET last_seen = ? WHERE id = ?', now, row.id)
      this.sql.exec('UPDATE sessions SET expires_at = ? WHERE hash = ?', now + SESSION_MS, hash)
    }
    return toUser(row)
  }

  async logout(token: string): Promise<void> {
    this.sql.exec('DELETE FROM sessions WHERE hash = ?', await hashToken(token))
  }

  async createInvite(
    role: Role,
    createdBy: string,
    email?: string
  ): Promise<{ code: string; expiresAt: number }> {
    const code = randomToken()
    const expiresAt = Date.now() + INVITE_MS
    this.sql.exec(
      'INSERT INTO invites (hash, role, created_by, expires_at, email) VALUES (?, ?, ?, ?, ?)',
      await hashToken(code),
      role,
      createdBy,
      expiresAt,
      email ?? null
    )
    return { code, expiresAt }
  }

  /** Invitations not used yet; `id` is the stored hash, which grants nothing. */
  listInvites(): { id: string; role: Role; email: string | null; expiresAt: number }[] {
    this.sql.exec('DELETE FROM invites WHERE expires_at < ?', Date.now())
    return this.all<{ hash: string; role: Role; email: string | null; expires_at: number }>(
      'SELECT hash, role, email, expires_at FROM invites ORDER BY expires_at DESC'
    ).map((row) => ({ id: row.hash, role: row.role, email: row.email, expiresAt: row.expires_at }))
  }

  revokeInvite(id: string): boolean {
    return this.sql.exec('DELETE FROM invites WHERE hash = ?', id).rowsWritten > 0
  }

  /**
   * Settings saved from the console, as KALKA_* names; the environment wins over them. Requests
   * pass their address and tenant, kept for the enterprise module's scheduled work, which has no request.
   */
  getSettings(context?: { origin: string; tenant: string | null }): Record<string, string> {
    if (context) {
      const key = `${context.origin}|${context.tenant ?? ''}`
      if (key !== this.seen) {
        this.seen = key
        if (this.getFlag('origin') !== context.origin) this.setFlag('origin', context.origin)
        if ((this.getFlag('tenant') ?? '') !== (context.tenant ?? '')) this.setFlag('tenant', context.tenant ?? '')
      }
    }
    return Object.fromEntries(
      this.all<{ key: string; value: string }>('SELECT key, value FROM settings').map((row) => [
        row.key,
        row.value
      ])
    )
  }

  async setSettings(change: Record<string, string | null>): Promise<void> {
    for (const [key, value] of Object.entries(change)) {
      if (value === null || value.trim() === '') this.sql.exec('DELETE FROM settings WHERE key = ?', key)
      else this.sql.exec('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value.trim())
    }
    await this.runScheduled('settings')
  }

  /** When someone last signed in through single sign-on. */
  lastSsoSignIn(): number | null {
    return (
      this.one<{ at: number | null }>("SELECT MAX(last_seen) AS at FROM users WHERE source = 'sso'")
        ?.at ?? null
    )
  }

  /** How many Kalka windows have a document open, from its room. */
  setLive(id: string, count: number): void {
    this.sql.exec('UPDATE documents SET live = ? WHERE id = ?', count, id)
  }

  async register(input: {
    invite: string
    email: string
    name: string
    password: string
  }): Promise<Result<{ token: string; user: User }>> {
    const hash = await hashToken(input.invite)
    const invite = this.one<{ role: Role; expires_at: number }>(
      'SELECT role, expires_at FROM invites WHERE hash = ?',
      hash
    )
    if (!invite || invite.expires_at < Date.now()) {
      return failure(400, 'This invitation is invalid or has expired.')
    }
    const invalid = checkAccount(input.email, input.name, input.password)
    if (invalid) return invalid
    if (this.one('SELECT id FROM users WHERE email = ?', input.email)) {
      return failure(409, 'An account with this email already exists.')
    }
    const row = this.insertUser({
      email: input.email,
      name: input.name,
      password: await hashPassword(input.password),
      role: invite.role,
      source: 'local'
    })
    this.sql.exec('DELETE FROM invites WHERE hash = ?', hash)
    return { token: await this.newSession(row.id), user: toUser(row) }
  }

  listUsers(): User[] {
    return this.all<UserRow>('SELECT * FROM users ORDER BY created_at').map(toUser)
  }

  updateUser(id: string, change: { role?: Role; disabled?: boolean }): Result<User> {
    const row = this.userById(id)
    if (!row) return failure(404, 'No such user.')
    const losesAdmin =
      row.role === 'admin' && ((change.role && change.role !== 'admin') || change.disabled)
    if (losesAdmin) {
      const admins = this.one<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND disabled = 0"
      )?.count
      if ((admins ?? 0) <= 1) return failure(409, 'The server needs at least one administrator.')
    }
    if (change.role) this.sql.exec('UPDATE users SET role = ? WHERE id = ?', change.role, id)
    if (change.disabled !== undefined) {
      this.sql.exec('UPDATE users SET disabled = ? WHERE id = ?', change.disabled ? 1 : 0, id)
      if (change.disabled) this.sql.exec('DELETE FROM sessions WHERE user_id = ?', id)
    }
    const updated = this.userById(id)
    if (!updated) return failure(404, 'No such user.')
    return toUser(updated)
  }

  listDocuments(): DocumentInfo[] {
    return this.all<DocumentRow>(
      'SELECT * FROM documents WHERE deleted_at IS NULL ORDER BY updated_at DESC'
    ).map(toDocument)
  }

  getDocument(id: string): DocumentInfo | null {
    const row = this.one<DocumentRow>(
      'SELECT * FROM documents WHERE id = ? AND deleted_at IS NULL',
      id
    )
    return row ? toDocument(row) : null
  }

  createDocument(name: string, createdBy: string): DocumentInfo {
    const now = Date.now()
    const id = randomId()
    this.sql.exec(
      'INSERT INTO documents (id, name, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      id,
      name.trim().slice(0, 200) || 'Untitled',
      createdBy,
      now,
      now
    )
    const document = this.getDocument(id)
    if (!document) throw new Error('Document was not saved')
    return document
  }

  renameDocument(id: string, name: string): DocumentInfo | null {
    this.sql.exec(
      'UPDATE documents SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      name.trim().slice(0, 200) || 'Untitled',
      Date.now(),
      id
    )
    return this.getDocument(id)
  }

  deleteDocument(id: string): boolean {
    const document = this.getDocument(id)
    if (!document) return false
    this.sql.exec('UPDATE documents SET deleted_at = ? WHERE id = ?', Date.now(), id)
    return true
  }

  /** Called by a room when its document changes, at most once a minute. */
  touchDocument(id: string, hasFile?: boolean, fileSize?: number): void {
    const now = Date.now()
    this.sql.exec('UPDATE documents SET updated_at = ? WHERE id = ?', now, id)
    if (hasFile !== undefined) {
      this.sql.exec('UPDATE documents SET has_file = ? WHERE id = ?', hasFile ? 1 : 0, id)
    }
    if (fileSize !== undefined) {
      this.sql.exec('UPDATE documents SET file_size = ?, file_at = ? WHERE id = ?', fileSize, now, id)
    }
  }

  /** Fills in the size of a file saved before sizes were kept. */
  setFileInfo(id: string, size: number, at: number): void {
    this.sql.exec('UPDATE documents SET file_size = ?, file_at = COALESCE(file_at, ?) WHERE id = ?', size, at, id)
  }

  /** A version uploaded outside Kalka (WebDAV, a restore) that Kalka clients may apply. */
  setPending(id: string, by: string | null): void {
    this.sql.exec(
      'UPDATE documents SET pending_at = ?, pending_by = ? WHERE id = ?',
      by === null ? null : Date.now(),
      by,
      id
    )
  }

  // ---------- Accounts managed by an identity provider ----------

  /**
   * An account an identity provider creates (for example through user provisioning): it signs in with
   * single sign-on, links to its first sign-in by email, and takes no seat until then.
   */
  createManagedAccount(input: { email: string; name: string; role: Role; disabled?: boolean }): Result<User> {
    if (!EMAIL.test(input.email) || input.email.length > 254) return failure(400, 'Enter a valid email address.')
    if (this.one('SELECT id FROM users WHERE email = ?', input.email)) return failure(409, 'An account with this email already exists.')
    const row = this.insertUser({
      email: input.email,
      name: input.name.slice(0, 100) || input.email,
      password: null,
      role: input.role,
      source: 'sso',
      provisioned: true
    })
    if (input.disabled) this.sql.exec('UPDATE users SET disabled = 1 WHERE id = ?', row.id)
    const saved = this.userById(row.id)
    return saved ? toUser(saved) : failure(500, 'The account was not saved.')
  }

  /** Changes an account's email or name, and marks it as managed by the identity provider. */
  updateManagedAccount(id: string, change: { email?: string; name?: string }): Result<User> {
    const row = this.userById(id)
    if (!row) return failure(404, 'No such user.')
    if (change.email !== undefined && change.email.toLowerCase() !== row.email.toLowerCase()) {
      if (!EMAIL.test(change.email) || change.email.length > 254) return failure(400, 'Enter a valid email address.')
      if (this.one('SELECT id FROM users WHERE email = ? AND id != ?', change.email, id)) {
        return failure(409, 'An account with this email already exists.')
      }
      this.sql.exec('UPDATE users SET email = ? WHERE id = ?', change.email, id)
    }
    if (change.name?.trim()) this.sql.exec('UPDATE users SET name = ? WHERE id = ?', change.name.trim().slice(0, 100), id)
    this.sql.exec('UPDATE users SET provisioned = 1 WHERE id = ?', id)
    const saved = this.userById(id)
    return saved ? toUser(saved) : failure(404, 'No such user.')
  }

  // ---------- App passwords (WebDAV and other clients that only know Basic auth) ----------

  listAppPasswords(userId: string): { id: string; name: string; createdAt: number; lastUsedAt: number | null }[] {
    return this.all<{ id: string; name: string; created_at: number; last_used: number | null }>(
      'SELECT id, name, created_at, last_used FROM app_passwords WHERE user_id = ? ORDER BY created_at DESC',
      userId
    ).map((row) => ({ id: row.id, name: row.name, createdAt: row.created_at, lastUsedAt: row.last_used }))
  }

  /**
   * A random password shown once. It has 120 bits of entropy, so a plain SHA-256 stores it
   * safely and checking it costs next to no CPU on every WebDAV request.
   */
  async createAppPassword(userId: string, name: string): Promise<Result<{ id: string; name: string; password: string }>> {
    const label = name.trim().slice(0, 80)
    if (!label) return failure(400, 'Name the app password, for example "Finder on my laptop".')
    if (this.all('SELECT id FROM app_passwords WHERE user_id = ?', userId).length >= 50) {
      return failure(409, 'You have 50 app passwords. Revoke one first.')
    }
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
    let raw = ''
    for (const byte of crypto.getRandomValues(new Uint8Array(24))) raw += alphabet[byte % alphabet.length]
    const password = raw.match(/.{6}/g)?.join('-') ?? raw
    const id = randomId(16)
    this.sql.exec(
      'INSERT INTO app_passwords (id, user_id, name, hash, created_at) VALUES (?, ?, ?, ?, ?)',
      id,
      userId,
      label,
      await hashToken(password),
      Date.now()
    )
    return { id, name: label, password }
  }

  revokeAppPassword(userId: string, id: string): boolean {
    return this.sql.exec('DELETE FROM app_passwords WHERE id = ? AND user_id = ?', id, userId).rowsWritten > 0
  }

  /**
   * Checks Basic credentials (an email and an app password) in one call. Failures count
   * against `limitKey`; past 30 in 15 minutes every attempt is refused.
   */
  async appPasswordSignIn(email: string, password: string, limitKey: string): Promise<User | 'limited' | null> {
    const attempts = this.one<{ count: number; window_start: number }>(
      'SELECT count, window_start FROM attempts WHERE key = ?',
      limitKey
    )
    if (attempts && attempts.count >= 30 && Date.now() - attempts.window_start < 15 * 60 * 1000) return 'limited'
    const hash = await hashToken(password.trim().toLowerCase())
    const row = this.one<UserRow & { app_id: string; app_used: number | null }>(
      'SELECT users.*, app_passwords.id AS app_id, app_passwords.last_used AS app_used FROM app_passwords JOIN users ON users.id = app_passwords.user_id WHERE app_passwords.hash = ?',
      hash
    )
    if (!row || row.disabled || row.email.toLowerCase() !== email.trim().toLowerCase()) {
      this.hit(limitKey, 30, 15 * 60 * 1000)
      return null
    }
    const now = Date.now()
    if (!row.app_used || now - row.app_used > SEEN_EVERY_MS) {
      this.sql.exec('UPDATE app_passwords SET last_used = ? WHERE id = ?', now, row.app_id)
      this.sql.exec('UPDATE users SET last_seen = ? WHERE id = ?', now, row.id)
    }
    return toUser(row)
  }

  private async putSecret(kind: string, value: string, ttlMs: number): Promise<string> {
    const secret = randomToken()
    this.sql.exec('DELETE FROM secrets WHERE expires_at < ?', Date.now())
    this.sql.exec(
      'INSERT INTO secrets (hash, kind, value, expires_at) VALUES (?, ?, ?, ?)',
      await hashToken(secret),
      kind,
      value,
      Date.now() + ttlMs
    )
    return secret
  }

  /** Reads a one-time secret and deletes it. */
  private async takeSecret(kind: string, secret: string): Promise<string | null> {
    const hash = await hashToken(secret)
    const row = this.one<{ value: string; expires_at: number }>(
      'SELECT value, expires_at FROM secrets WHERE hash = ? AND kind = ?',
      hash,
      kind
    )
    this.sql.exec('DELETE FROM secrets WHERE hash = ?', hash)
    return row && row.expires_at >= Date.now() ? row.value : null
  }

  /** A one-minute, one-use pass into a room, so session tokens never go in WebSocket URLs. */
  async createTicket(userId: string, documentId: string): Promise<string> {
    return this.putSecret('ticket', JSON.stringify({ userId, documentId }), TICKET_MS)
  }

  async consumeTicket(ticket: string): Promise<{ user: User; documentId: string } | null> {
    const value = await this.takeSecret('ticket', ticket)
    if (!value) return null
    const { userId, documentId } = JSON.parse(value) as { userId: string; documentId: string }
    const row = this.userById(userId)
    if (!row || row.disabled || !this.getDocument(documentId)) return null
    return { user: toUser(row), documentId }
  }

  /** A short code the app trades for a session after signing in through a browser. */
  async createLoginCode(userId: string): Promise<string> {
    return this.putSecret('login', userId, LOGIN_CODE_MS)
  }

  async exchangeLoginCode(code: string): Promise<Result<{ token: string; user: User }>> {
    const userId = await this.takeSecret('login', code)
    const row = userId ? this.userById(userId) : undefined
    if (!row || row.disabled) return failure(400, 'This sign-in link has expired. Try again.')
    return { token: await this.newSession(row.id), user: toUser(row) }
  }

  /** Short-lived values for sign-in flows (state, nonce, PKCE verifier). */
  async putFlowState(value: string, ttlMs: number): Promise<string> {
    return this.putSecret('flow', value, ttlMs)
  }

  async takeFlowState(key: string): Promise<string | null> {
    return this.takeSecret('flow', key)
  }

  /**
   * Editors and administrators who signed in through single sign-on since `since`: the seats
   * the license counts. Viewers are free on every plan.
   */
  countSsoUsers(since: number): number {
    return (
      this.one<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users WHERE source = 'sso' AND disabled = 0 AND role != 'viewer' AND last_seen >= ?",
        since
      )?.count ?? 0
    )
  }

  /**
   * Finds or creates the account for someone the identity provider vouched for. A new account
   * is refused when `seatsLeft` is 0; an existing one keeps working.
   */
  ssoSignIn(input: {
    subject: string
    email: string
    emailVerified: boolean
    name: string
    role: Role | null
    defaultRole: Role
    seatsLeft: number
  }): Result<User> {
    const now = Date.now()
    let row = this.one<UserRow>('SELECT * FROM users WHERE subject = ?', input.subject)
    // Accounts the identity provider provisioned are its own: they link by email.
    const provisioned = row ? undefined : this.one<UserRow>('SELECT * FROM users WHERE email = ? AND provisioned = 1 AND subject IS NULL', input.email)
    if (!row && (input.emailVerified || provisioned)) {
      row = this.one<UserRow>('SELECT * FROM users WHERE email = ?', input.email)
      if (row?.subject) row = undefined
      if (row) {
        this.sql.exec(
          "UPDATE users SET subject = ?, source = 'sso' WHERE id = ?",
          input.subject,
          row.id
        )
      }
    }
    if (!row) {
      if (this.one('SELECT id FROM users WHERE email = ?', input.email)) {
        return failure(
          409,
          'An account with this email already exists; ask an administrator to link it.'
        )
      }
      if (input.seatsLeft <= 0 && (input.role ?? input.defaultRole) !== 'viewer') {
        return failure(
          403,
          'This server has reached the number of single sign-on users its license allows. Ask an administrator.'
        )
      }
      row = this.insertUser({
        email: input.email,
        name: input.name || input.email,
        password: null,
        role: input.role ?? input.defaultRole,
        source: 'sso',
        subject: input.subject
      })
    } else if (input.role && input.role !== row.role) {
      // Group membership in the identity provider decides the role at every sign-in.
      this.sql.exec('UPDATE users SET role = ? WHERE id = ?', input.role, row.id)
    }
    if (row.disabled) return failure(403, 'This account is disabled.')
    this.sql.exec('UPDATE users SET last_seen = ? WHERE id = ?', now, row.id)
    const updated = this.userById(row.id)
    if (!updated) return failure(500, 'Account was not saved.')
    return toUser(updated)
  }

  /**
   * Counts an attempt under `key` and says whether it is allowed: at most `limit` in each
   * `windowMs`. Sign-in, registration and password reset go through it, per account and per IP.
   */
  hit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const row = this.one<{ count: number; window_start: number }>(
      'SELECT count, window_start FROM attempts WHERE key = ?',
      key
    )
    if (!row || now - row.window_start > windowMs) {
      this.sql.exec(
        'INSERT OR REPLACE INTO attempts (key, count, window_start) VALUES (?, 1, ?)',
        key,
        now
      )
      this.sql.exec('DELETE FROM attempts WHERE window_start < ?', now - 24 * 60 * 60 * 1000)
      return true
    }
    this.sql.exec('UPDATE attempts SET count = count + 1 WHERE key = ?', key)
    return row.count < limit
  }

  clearAttempts(key: string): void {
    this.sql.exec('DELETE FROM attempts WHERE key = ?', key)
  }

  getFlag(key: string): string | null {
    return this.one<{ value: string }>('SELECT value FROM flags WHERE key = ?', key)?.value ?? null
  }

  setFlag(key: string, value: string): void {
    this.sql.exec('INSERT OR REPLACE INTO flags (key, value) VALUES (?, ?)', key, value)
  }

  /** Every document ID, deleted ones included, so a host can erase their rooms. */
  allDocumentIds(): string[] {
    return this.all<{ id: string }>('SELECT id FROM documents').map((row) => row.id)
  }

  /** Erases this directory: accounts, sessions, documents list and settings. */
  async destroyAll(): Promise<void> {
    await this.ctx.storage.deleteAlarm()
    await this.ctx.storage.deleteAll()
    this.sql.exec(SCHEMA)
    this.eeSchemas.clear()
  }

  /** Active administrators' addresses, for notices. */
  adminEmails(): string[] {
    return this.all<{ email: string }>(
      "SELECT email FROM users WHERE role = 'admin' AND disabled = 0"
    ).map((row) => row.email)
  }

  findUserByEmail(email: string): User | null {
    const row = this.one<UserRow>('SELECT * FROM users WHERE email = ?', email)
    return row ? toUser(row) : null
  }

  /** A one-hour, one-use link to choose a new password; null for SSO-only accounts. */
  async createResetCode(userId: string): Promise<string | null> {
    const row = this.userById(userId)
    if (!row || row.disabled || row.source === 'sso') return null
    return this.putSecret('reset', userId, RESET_MS)
  }

  async resetPassword(code: string, password: string): Promise<Result<{ token: string; user: User }>> {
    if (password.length < 10) return failure(400, 'Use a password of at least 10 characters.')
    if (password.length > 1024) return failure(400, 'That password is too long.')
    const userId = await this.takeSecret('reset', code)
    const row = userId ? this.userById(userId) : undefined
    if (!row || row.disabled) return failure(400, 'This link is invalid or has expired.')
    this.sql.exec('UPDATE users SET password = ? WHERE id = ?', await hashPassword(password), row.id)
    // Everyone signed in with the old password is signed out.
    this.sql.exec('DELETE FROM sessions WHERE user_id = ?', row.id)
    return { token: await this.newSession(row.id), user: toUser(row) }
  }

  async changePassword(userId: string, current: string, password: string): Promise<Result<{ token: string }>> {
    const row = this.userById(userId)
    if (!row?.password || !(await verifyPassword(current, row.password))) {
      return failure(403, 'Your current password is wrong.')
    }
    if (password.length < 10) return failure(400, 'Use a password of at least 10 characters.')
    if (password.length > 1024) return failure(400, 'That password is too long.')
    this.sql.exec('UPDATE users SET password = ? WHERE id = ?', await hashPassword(password), userId)
    this.sql.exec('DELETE FROM sessions WHERE user_id = ?', userId)
    return { token: await this.newSession(userId) }
  }

  updateProfile(userId: string, name: string): Result<User> {
    if (name.trim() === '' || name.length > 100) return failure(400, 'Enter a name.')
    this.sql.exec('UPDATE users SET name = ? WHERE id = ?', name.trim(), userId)
    const row = this.userById(userId)
    return row ? toUser(row) : failure(404, 'No such user.')
  }

  /** Deletes an account and its sessions; the documents it made stay with the team. */
  deleteUser(id: string): Result<{ deleted: true }> {
    const row = this.userById(id)
    if (!row) return failure(404, 'No such user.')
    if (row.role === 'admin') {
      const admins = this.one<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND disabled = 0"
      )?.count
      if ((admins ?? 0) <= 1) return failure(409, 'The server needs at least one administrator.')
    }
    this.sql.exec('DELETE FROM sessions WHERE user_id = ?', id)
    this.sql.exec('DELETE FROM app_passwords WHERE user_id = ?', id)
    this.sql.exec('DELETE FROM users WHERE id = ?', id)
    return { deleted: true }
  }
}
