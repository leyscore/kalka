import * as v from 'valibot'

import { sameSecret, isRoomId } from './crypto'
import { failed } from './directory'
import {
  clientIp,
  CORS_HEADERS,
  directoryOf,
  HttpError,
  json,
  MAX_FILE_BYTES,
  publicUrl,
  roomOf,
  tenantOf,
  unwrap
} from './http'
import enterprise from './ee/module'
import { ENTERPRISE_PREFIXES } from './ee/types'
import {
  consoleSettingKeys,
  emit,
  enterpriseHost,
  enterpriseStatus,
  isSecretSetting,
  licensedFeatures,
  type Actor
} from './enterprise'
import {
  isRole,
  listSetting,
  ROLES,
  SERVER_VERSION,
  setting,
  withStoredSettings,
  type Env,
  type User
} from './env'
import { dav, DAV_PREFIX, type DavHooks } from './dav'
import { canSendMail, sendMail, tryMail } from './mail'
import { FONTS } from './assets/fonts'
import { consolePage } from './page'
import { directoryName } from './names'
import { PROTOCOL_VERSION } from './protocol'

export { Directory } from './directory'
export { DocumentRoom } from './room'

async function body<const S extends v.GenericSchema>(request: Request, schema: S) {
  const text = await request.text()
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), schema), text)
  if (!parsed.success) throw new HttpError(400, parsed.issues[0]?.message ?? 'Invalid request.')
  return parsed.output
}

const Credentials = v.object({ email: v.pipe(v.string(), v.trim()), password: v.string() })
const Account = v.object({
  email: v.pipe(v.string(), v.trim()),
  name: v.string(),
  password: v.string()
})
const Setup = v.object({
  ...Account.entries,
  code: v.string(),
  serverName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(80)))
})
const SettingsChange = v.object({
  values: v.record(v.string(), v.nullable(v.pipe(v.string(), v.maxLength(4000))))
})
const Register = v.object({ ...Account.entries, invite: v.string() })
const Code = v.object({ code: v.string() })
const InviteCheck = v.object({ invite: v.string() })
const InviteRequest = v.object({
  role: v.picklist(ROLES),
  email: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(254)))
})
const Forgot = v.object({ email: v.pipe(v.string(), v.trim()) })
const Reset = v.object({ code: v.string(), password: v.string() })
const PasswordChange = v.object({ current: v.string(), password: v.string() })
const Profile = v.object({ name: v.string() })
const UserChange = v.object({
  role: v.optional(v.picklist(ROLES)),
  disabled: v.optional(v.boolean())
})
const DocumentRequest = v.object({ name: v.pipe(v.string(), v.maxLength(200)) })
const AppPasswordRequest = v.object({ name: v.pipe(v.string(), v.maxLength(80)) })

function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null
}

async function requireUser(env: Env, request: Request, roles?: User['role'][]): Promise<User> {
  const token = bearer(request)
  const user = token ? await directoryOf(env).authenticate(token) : null
  if (!user) throw new HttpError(401, 'Sign in again.')
  if (roles && !roles.includes(user.role)) {
    throw new HttpError(403, 'Your role does not allow this.')
  }
  return user
}

const MINUTE = 60 * 1000

/** Refuses with 429 once any key has been tried too often. */
async function limit(env: Env, checks: [key: string, max: number, windowMs: number][]) {
  const directory = directoryOf(env)
  for (const [key, max, windowMs] of checks) {
    if (!(await directory.hit(key, max, windowMs))) {
      throw new HttpError(429, 'Too many attempts. Wait a few minutes and try again.')
    }
  }
}

/**
 * Per address. When the address is unknown (Docker with no KALKA_TRUSTED_PROXIES) every request
 * looks alike, so only the per-account limits apply there.
 */
function ipLimit(env: Env, request: Request): [string, number, number] {
  const ip = clientIp(request, env)
  return ip === 'unknown' ? ['ip:unknown', Number.MAX_SAFE_INTEGER, MINUTE] : [`ip:${ip}`, 60, 15 * MINUTE]
}

/**
 * Guesses at the setup code, from every address together: setup needs no per-address precision,
 * and no address can be trusted before an operator has configured the proxy in front.
 */
const SETUP_LIMIT: [string, number, number] = ['setup', 20, MINUTE]

/** The environment as deployed, before console settings; kept on the merged one. */
const RAW_ENV = Symbol('raw environment')

function rawEnvOf(env: Env): Env {
  return (env as Env & { [RAW_ENV]?: Env })[RAW_ENV] ?? env
}

async function consoleSettings(env: Env, request: Request) {
  const raw = rawEnvOf(env)
  const directory = directoryOf(env)
  const values: Record<string, string> = {}
  const secretsSet: string[] = []
  const keys = consoleSettingKeys()
  for (const key of keys) {
    const value = setting(env, key)
    if (isSecretSetting(key)) {
      if (value) secretsSet.push(key)
    } else if (value !== undefined) values[key] = value
  }
  const status = await enterpriseStatus(env, request)
  return {
    values,
    secretsSet,
    locked: keys.filter((key) => setting(raw, key) !== undefined),
    emailReady: canSendMail(env),
    enterprise: Boolean(enterprise),
    license: status?.license ?? null,
    ssoReady: Boolean(status?.sso),
    lastSsoSignIn: await directory.lastSsoSignIn(),
    redirectUri: `${publicUrl(env, request)}/auth/oidc/callback`,
    publicUrl: publicUrl(env, request)
  }
}

function serverName(env: Env): string {
  return setting(env, 'KALKA_SERVER_NAME') ?? 'Kalka'
}

function localLoginEnabled(env: Env): boolean {
  return setting(env, 'KALKA_LOCAL_LOGIN') !== 'false'
}

/**
 * Without KALKA_PUBLIC_URL, links in emails and tickets would take whatever host a request came
 * with, which anyone can set. The address the server was set up at, or the one its first
 * administrator signs in at, becomes its public address instead, until KALKA_PUBLIC_URL is set.
 */
async function rememberPublicUrl(env: Env, request: Request): Promise<void> {
  if (setting(env, 'KALKA_PUBLIC_URL')) return
  await directoryOf(env).setSettings({ KALKA_PUBLIC_URL: new URL(request.url).origin })
}

async function serverInfo(env: Env, request: Request) {
  const status = await enterpriseStatus(env, request)
  return {
    kalkaServer: true,
    name: setting(env, 'KALKA_SERVER_NAME') ?? 'Kalka',
    version: SERVER_VERSION,
    protocol: PROTOCOL_VERSION,
    setupRequired: (await directoryOf(env).userCount()) === 0,
    // A web editor that opens this server's files, the first of KALKA_APP_ORIGINS, or null.
    editor: listSetting(env, 'KALKA_APP_ORIGINS')[0] ?? null,
    enterprise: Boolean(enterprise),
    email: canSendMail(env),
    auth: {
      password: localLoginEnabled(env),
      sso: status?.sso ?? null
    },
    license: status?.license ?? null,
    features: await licensedFeatures(env, publicUrl(env, request))
  }
}

async function documentRoute(
  env: Env,
  request: Request,
  documentId: string,
  rest: string
): Promise<Response> {
  const method = request.method
  const directory = directoryOf(env)
  const log = (actor: Actor, action: string, detail?: Record<string, unknown>) =>
    emit(env, request, actor, action, documentId, detail)
  if (!isRoomId(documentId)) throw new HttpError(404, 'No such document.')

  if (rest === '' && method === 'PATCH') {
    const user = await requireUser(env, request, ['admin', 'editor'])
    const { name } = await body(request, DocumentRequest)
    const before = await directory.getDocument(documentId)
    const document = await directory.renameDocument(documentId, name)
    if (!document) throw new HttpError(404, 'No such document.')
    await log(user, 'document.renamed', { from: before?.name, to: document.name })
    return json(document)
  }
  if (rest === '' && method === 'DELETE') {
    const user = await requireUser(env, request, ['admin', 'editor'])
    const before = await directory.getDocument(documentId)
    if (!(await directory.deleteDocument(documentId))) throw new HttpError(404, 'No such document.')
    await roomOf(env, documentId).destroy()
    await log(user, 'document.deleted', { name: before?.name })
    return json({ deleted: true })
  }
  if (rest === '' && method === 'GET') {
    await requireUser(env, request)
    const document = await directory.getDocument(documentId)
    if (!document) throw new HttpError(404, 'No such document.')
    return json(document)
  }
  if (rest === '/ticket' && method === 'POST') {
    const user = await requireUser(env, request)
    if (!(await directory.getDocument(documentId))) throw new HttpError(404, 'No such document.')
    const ticket = await directory.createTicket(user.id, documentId)
    const url = new URL(`${publicUrl(env, request)}/rooms/${documentId}`)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.searchParams.set('ticket', ticket)
    return json({ url: url.toString(), role: user.role })
  }
  if (rest === '/file' && method === 'GET') {
    const user = await requireUser(env, request)
    const data = await roomOf(env, documentId).getFile()
    if (!data) throw new HttpError(404, 'No Kalka file has been saved for this document yet.')
    await log(user, 'document.exported', { name: (await directory.getDocument(documentId))?.name, bytes: data.byteLength })
    return new Response(data, {
      headers: { 'Content-Type': 'application/vnd.kalka+zip', ...CORS_HEADERS }
    })
  }
  if (rest === '/file' && method === 'PUT') {
    await requireUser(env, request, ['admin', 'editor'])
    if (!(await directory.getDocument(documentId))) throw new HttpError(404, 'No such document.')
    const data = await request.arrayBuffer()
    if (data.byteLength > MAX_FILE_BYTES) throw new HttpError(413, 'This file is too large.')
    await roomOf(env, documentId).putFile(data, documentId, directoryName(tenantOf(env)))
    return json({ saved: true })
  }
  // A version uploaded outside Kalka (WebDAV, a restore): Kalka reads it, applies it to the
  // live document, then dismisses it.
  if (rest === '/pending' && method === 'GET') {
    await requireUser(env, request)
    const pending = await roomOf(env, documentId).getPending()
    if (!pending) throw new HttpError(404, 'No version is waiting for this document.')
    return new Response(pending.data, {
      headers: {
        'Content-Type': 'application/vnd.kalka+zip',
        'X-Kalka-Version': pending.version,
        'Access-Control-Expose-Headers': 'X-Kalka-Version',
        ...CORS_HEADERS
      }
    })
  }
  // With `?version=`, only that version is dismissed: the Kalka window whose dismissal goes
  // through is the one that applies it.
  if (rest === '/pending' && method === 'DELETE') {
    await requireUser(env, request, ['admin', 'editor'])
    if (!(await directory.getDocument(documentId))) throw new HttpError(404, 'No such document.')
    const version = new URL(request.url).searchParams.get('version') ?? undefined
    const dismissed = await roomOf(env, documentId).clearPending(version)
    if (dismissed) await directory.setPending(documentId, null)
    return json({ dismissed })
  }
  throw new HttpError(404, 'Not found.')
}

async function api(env: Env, request: Request, path: string): Promise<Response> {
  const method = request.method
  const directory = directoryOf(env)
  const log = (actor: Actor, action: string, target: string | null = null, detail?: Record<string, unknown>) =>
    emit(env, request, actor, action, target, detail)

  if (path === '/api/server' && method === 'GET') return json(await serverInfo(env, request))

  // Lets the first setup screen say at once whether the code is right, before the account.
  if (path === '/api/setup/check' && method === 'POST') {
    await limit(env, [ipLimit(env, request), SETUP_LIMIT])
    const { code } = await body(request, Code)
    const expected = setting(env, 'KALKA_SETUP_CODE')
    if (!expected) throw new HttpError(503, 'Set KALKA_SETUP_CODE on the server first.')
    if ((await directory.userCount()) > 0) throw new HttpError(409, 'This server is already set up.')
    if (!(await sameSecret(code.trim(), expected))) throw new HttpError(403, 'Wrong setup code.')
    return json({ ok: true })
  }

  if (path === '/api/setup' && method === 'POST') {
    await limit(env, [ipLimit(env, request), SETUP_LIMIT])
    const input = await body(request, Setup)
    const expected = setting(env, 'KALKA_SETUP_CODE')
    if (!expected) throw new HttpError(503, 'Set KALKA_SETUP_CODE on the server first.')
    if (!(await sameSecret(input.code.trim(), expected))) {
      throw new HttpError(403, 'Wrong setup code.')
    }
    const result = unwrap(await directory.setup(input)) as { token: string; user: User }
    if (input.serverName) await directory.setSettings({ KALKA_SERVER_NAME: input.serverName })
    await rememberPublicUrl(env, request)
    await log(result.user, 'user.created', result.user.id, { email: result.user.email, role: 'admin', via: 'setup' })
    return json(result)
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = await body(request, Credentials)
    const accountKey = `login:${email.toLowerCase()}`
    const failedLogin = (reason: string) =>
      log(null, 'auth.login_failed', null, { method: 'password', email: email.slice(0, 254), reason })
    try {
      await limit(env, [ipLimit(env, request), [accountKey, 10, 15 * MINUTE]])
    } catch (error) {
      await failedLogin('too many attempts')
      throw error
    }
    const attempt = await directory.login(email, password)
    if (failed(attempt)) {
      await failedLogin(attempt.error)
      throw new HttpError(attempt.status, attempt.error)
    }
    const result = attempt as { token: string; user: User }
    await directory.clearAttempts(accountKey)
    // With passwords turned off, administrators keep theirs as a way back in.
    if (!localLoginEnabled(env) && result.user.role !== 'admin') {
      await directory.logout(result.token)
      await failedLogin('passwords are turned off')
      throw new HttpError(403, 'Sign in with single sign-on.')
    }
    if (result.user.role === 'admin') await rememberPublicUrl(env, request)
    await log(result.user, 'auth.login', result.user.id, { method: 'password' })
    return json(result)
  }
  if (path === '/api/auth/register' && method === 'POST') {
    if (!localLoginEnabled(env)) throw new HttpError(403, 'Sign in with single sign-on.')
    await limit(env, [ipLimit(env, request)])
    const result = unwrap(await directory.register(await body(request, Register))) as { token: string; user: User }
    await log(result.user, 'user.created', result.user.id, { email: result.user.email, role: result.user.role, via: 'invitation' })
    return json(result)
  }
  // What an invitation offers before anyone fills in the form: its role and its address.
  if (path === '/api/auth/invite' && method === 'POST') {
    await limit(env, [ipLimit(env, request)])
    const { invite } = await body(request, InviteCheck)
    const offer = await directory.checkInvite(invite)
    if (!offer) throw new HttpError(400, 'This invitation is invalid or has expired.')
    return json(offer)
  }
  if (path === '/api/auth/exchange' && method === 'POST') {
    await limit(env, [ipLimit(env, request)])
    const { code } = await body(request, Code)
    const result = unwrap(await directory.exchangeLoginCode(code)) as { token: string; user: User }
    await log(result.user, 'auth.login', result.user.id, { method: 'sso' })
    return json(result)
  }
  if (path === '/api/auth/forgot' && method === 'POST') {
    const { email } = await body(request, Forgot)
    await limit(env, [ipLimit(env, request), [`forgot:${email.toLowerCase()}`, 3, 60 * MINUTE]])
    if (!canSendMail(env)) {
      throw new HttpError(503, 'Email is not set up on this server. Ask an administrator for a reset link.')
    }
    const user = await directory.findUserByEmail(email)
    const code = user ? await directory.createResetCode(user.id) : null
    if (user && code) {
      await tryMail(
        env,
        user.email,
        `Reset your ${serverName(env)} password`,
        `Someone asked to reset the password of your account on ${serverName(env)}.\n\nChoose a new password here, within an hour:\n${publicUrl(env, request)}/#reset=${code}\n\nIf it was not you, ignore this email.`
      )
    }
    // The same answer whether or not the account exists, so the form reveals no addresses.
    return json({ sent: true })
  }
  if (path === '/api/auth/reset' && method === 'POST') {
    await limit(env, [ipLimit(env, request)])
    const { code, password } = await body(request, Reset)
    const result = unwrap(await directory.resetPassword(code, password)) as { token: string; user: User }
    await log(result.user, 'user.password_reset', result.user.id)
    return json(result)
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    const token = bearer(request)
    if (token) await directory.logout(token)
    return json({ signedOut: true })
  }
  if (path === '/api/me' && method === 'GET') return json(await requireUser(env, request))
  if (path === '/api/me' && method === 'PATCH') {
    const user = await requireUser(env, request)
    const { name } = await body(request, Profile)
    return json(unwrap(await directory.updateProfile(user.id, name)))
  }
  if (path === '/api/me/password' && method === 'POST') {
    const user = await requireUser(env, request)
    const { current, password } = await body(request, PasswordChange)
    await limit(env, [[`password:${user.id}`, 10, 15 * MINUTE]])
    const result = unwrap(await directory.changePassword(user.id, current, password))
    await log(user, 'user.password_changed', user.id)
    return json(result)
  }

  if (path === '/api/me/app-passwords' && method === 'GET') {
    const user = await requireUser(env, request)
    return json(await directory.listAppPasswords(user.id))
  }
  if (path === '/api/me/app-passwords' && method === 'POST') {
    const user = await requireUser(env, request)
    const { name } = await body(request, AppPasswordRequest)
    const made = unwrap(await directory.createAppPassword(user.id, name))
    await log(user, 'app_password.created', user.id, { name: made.name })
    return json(made, 201)
  }
  const appPasswordMatch = /^\/api\/me\/app-passwords\/([a-z0-9]+)$/.exec(path)
  if (appPasswordMatch?.[1] && method === 'DELETE') {
    const user = await requireUser(env, request)
    if (!(await directory.revokeAppPassword(user.id, appPasswordMatch[1]))) throw new HttpError(404, 'No such app password.')
    await log(user, 'app_password.revoked', user.id)
    return json({ revoked: true })
  }

  if (path === '/api/users' && method === 'GET') {
    await requireUser(env, request, ['admin'])
    return json(await directory.listUsers())
  }
  const userMatch = /^\/api\/users\/([a-z0-9]+)(\/reset)?$/.exec(path)
  if (userMatch?.[1] && !userMatch[2] && method === 'PATCH') {
    const admin = await requireUser(env, request, ['admin'])
    const change = await body(request, UserChange)
    const before = (await directory.listUsers()).find((user) => user.id === userMatch[1])
    const updated = unwrap(await directory.updateUser(userMatch[1], change))
    if (before && before.role !== updated.role) {
      await log(admin, 'user.role_changed', updated.id, { email: updated.email, from: before.role, to: updated.role })
    }
    if (before && before.disabled !== updated.disabled) {
      await log(admin, updated.disabled ? 'user.disabled' : 'user.enabled', updated.id, { email: updated.email })
    }
    return json(updated)
  }
  if (userMatch?.[1] && !userMatch[2] && method === 'DELETE') {
    const admin = await requireUser(env, request, ['admin'])
    if (admin.id === userMatch[1]) throw new HttpError(409, 'You cannot delete your own account.')
    const before = (await directory.listUsers()).find((user) => user.id === userMatch[1])
    const result = unwrap(await directory.deleteUser(userMatch[1]))
    await log(admin, 'user.deleted', userMatch[1], { email: before?.email, role: before?.role })
    return json(result)
  }
  if (userMatch?.[1] && userMatch[2] && method === 'POST') {
    const admin = await requireUser(env, request, ['admin'])
    const target = (await directory.listUsers()).find((user) => user.id === userMatch[1])
    const code = target ? await directory.createResetCode(target.id) : null
    if (!target || !code) throw new HttpError(409, 'This account signs in with single sign-on.')
    const url = `${publicUrl(env, request)}/#reset=${code}`
    await log(admin, 'user.reset_link', target.id, { email: target.email })
    const emailed = await tryMail(
      env,
      target.email,
      `Choose a new ${serverName(env)} password`,
      `An administrator of ${serverName(env)} sent you a link to choose a new password. It works once, within an hour:\n${url}`
    )
    return json({ url, emailed })
  }
  if (path === '/api/invites' && method === 'POST') {
    const admin = await requireUser(env, request, ['admin'])
    const { role, email } = await body(request, InviteRequest)
    const { code, expiresAt } = await directory.createInvite(role, admin.id, email || undefined)
    const url = `${publicUrl(env, request)}/#invite=${code}`
    const emailed = email
      ? await tryMail(
          env,
          email,
          `${admin.name} invited you to ${serverName(env)} on Kalka`,
          `${admin.name} invited you to join ${serverName(env)}, a Kalka server for designing together.\n\nCreate your account here (the link works once, for 7 days):\n${url}\n\nThen open this server in Kalka (it fills in the address; you sign in there):\nkalka://server?url=${encodeURIComponent(publicUrl(env, request))}\n\nIf the link does not open Kalka, go to Settings > Server and enter ${publicUrl(env, request)}.\nKalka is free to download at https://kalka.design.`
        )
      : false
    await log(admin, 'invite.created', null, { role, email: email || null, emailed })
    return json({ code, expiresAt, url, emailed })
  }

  if (path === '/api/invites' && method === 'GET') {
    await requireUser(env, request, ['admin'])
    return json(await directory.listInvites())
  }
  const inviteMatch = /^\/api\/invites\/([a-f0-9]{64})$/.exec(path)
  if (inviteMatch?.[1] && method === 'DELETE') {
    const admin = await requireUser(env, request, ['admin'])
    const invite = (await directory.listInvites()).find((item) => item.id === inviteMatch[1])
    if (!(await directory.revokeInvite(inviteMatch[1]))) throw new HttpError(404, 'No such invitation.')
    await log(admin, 'invite.revoked', null, { role: invite?.role, email: invite?.email ?? null })
    return json({ revoked: true })
  }

  if (path === '/api/settings' && method === 'GET') {
    await requireUser(env, request, ['admin'])
    return json(await consoleSettings(env, request))
  }
  if (path === '/api/settings' && method === 'PUT') {
    const admin = await requireUser(env, request, ['admin'])
    const { values } = await body(request, SettingsChange)
    const allowed = new Set(consoleSettingKeys())
    const unknown = Object.keys(values).filter((key) => !allowed.has(key))
    if (unknown.length) throw new HttpError(400, `Unknown settings: ${unknown.join(', ')}.`)
    const locked = Object.keys(values).filter((key) => setting(rawEnvOf(env), key) !== undefined)
    if (locked.length) {
      throw new HttpError(409, `Set by the server's environment: ${locked.join(', ')}.`)
    }
    await directory.setSettings(values)
    // Which settings changed, never their values: some are secrets.
    await log(admin, 'settings.changed', null, { keys: Object.keys(values), cleared: Object.entries(values).filter(([, value]) => !value?.trim()).map(([key]) => key) })
    const saved = withStoredSettings(rawEnvOf(env), await directory.getSettings())
    Object.defineProperty(saved, RAW_ENV, { value: rawEnvOf(env) })
    return json(await consoleSettings(saved, request))
  }
  if (path === '/api/settings/email/test' && method === 'POST') {
    const admin = await requireUser(env, request, ['admin'])
    if (!canSendMail(env)) throw new HttpError(409, 'Set up the mail server first.')
    try {
      await sendMail(env, {
        to: admin.email,
        subject: `Test email from ${serverName(env)}`,
        text: `This is a test email from your Kalka server, ${serverName(env)}. Email works.`
      })
    } catch (error) {
      throw new HttpError(502, error instanceof Error ? error.message : 'The mail server refused the email.')
    }
    return json({ sent: true, to: admin.email })
  }

  if (path === '/api/documents' && method === 'GET') {
    await requireUser(env, request)
    return json(await directory.listDocuments())
  }
  if (path === '/api/documents' && method === 'POST') {
    const user = await requireUser(env, request, ['admin', 'editor'])
    const { name } = await body(request, DocumentRequest)
    const document = await directory.createDocument(name, user.id)
    await log(user, 'document.created', document.id, { name: document.name })
    return json(document, 201)
  }
  const documentMatch = /^\/api\/documents\/([^/]+)(\/[a-z]+)?$/.exec(path)
  if (documentMatch?.[1]) {
    return documentRoute(env, request, documentMatch[1], documentMatch[2] ?? '')
  }
  throw new HttpError(404, 'Not found.')
}

async function room(env: Env, request: Request, documentId: string): Promise<Response> {
  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected a WebSocket', { status: 426 })
  }
  const ticket = new URL(request.url).searchParams.get('ticket') ?? ''
  const pass = isRoomId(documentId) ? await directoryOf(env).consumeTicket(ticket) : null
  if (!pass || pass.documentId !== documentId) {
    return new Response('Invalid or expired ticket', { status: 403 })
  }
  // A fresh request, so nothing the client sent can pose as these headers.
  const headers = new Headers({
    Upgrade: 'websocket',
    'X-Kalka-Document': documentId,
    'X-Kalka-Directory': directoryName(tenantOf(env)),
    'X-Kalka-User': pass.user.id,
    'X-Kalka-Name': encodeURIComponent(pass.user.name),
    'X-Kalka-Role': isRole(pass.user.role) ? pass.user.role : 'viewer'
  })
  for (const name of ['Sec-WebSocket-Key', 'Sec-WebSocket-Version', 'Sec-WebSocket-Protocol']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  return roomOf(env, documentId).fetch(new Request(request.url, { headers }))
}

function davHooks(env: Env, request: Request): DavHooks {
  return { emit: (user, action, target, detail) => emit(env, request, user, action, target, detail) }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    try {
      if (path === DAV_PREFIX || path.startsWith(`${DAV_PREFIX}/`)) {
        const stored = await directoryOf(env).getSettings({ origin: publicUrl(env, request), tenant: tenantOf(env) ?? null })
        return await dav(withStoredSettings(env, stored), request, path, davHooks(withStoredSettings(env, stored), request))
      }
      if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
      if (path === '/healthz') {
        await directoryOf(env).userCount()
        return json({ ok: true, version: SERVER_VERSION })
      }
      const stored = await directoryOf(env).getSettings({ origin: publicUrl(env, request), tenant: tenantOf(env) ?? null })
      const raw = env
      env = withStoredSettings(env, stored)
      Object.defineProperty(env, RAW_ENV, { value: raw })
      // Single sign-on and what the license adds are the enterprise module's.
      if (ENTERPRISE_PREFIXES.some((prefix) => path.startsWith(prefix) || path === prefix.slice(0, -1))) {
        const response = enterprise ? await enterprise.handle(request, enterpriseHost(env, request)) : null
        if (response) return response
        if (path.startsWith('/api/')) throw new HttpError(404, 'This server does not include that feature.')
        return new Response(path.startsWith('/auth/') ? 'Single sign-on is not available on this server.' : 'Not found', { status: 404 })
      }
      if (path.startsWith('/api/')) return await api(env, request, path)
      const roomMatch = /^\/rooms\/([^/]+)$/.exec(path)
      if (roomMatch?.[1]) return await room(env, request, roomMatch[1])
      const asset = /^\/assets\/([a-z]+\.woff2)$/.exec(path)?.[1]
      const font = asset ? FONTS[asset] : undefined
      if (font) {
        return new Response(Uint8Array.from(atob(font), (char) => char.charCodeAt(0)), {
          headers: { 'Content-Type': 'font/woff2', 'Cache-Control': 'public, max-age=31536000, immutable' }
        })
      }
      if (path === '/' && request.method === 'GET') {
        return new Response(consolePage(setting(env, 'KALKA_SERVER_NAME') ?? 'Kalka'), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Security-Policy':
              "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'",
            'Referrer-Policy': 'no-referrer'
          }
        })
      }
      return new Response('Not found', { status: 404 })
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status)
      console.error('[kalka]', error)
      return json({ error: 'Something went wrong on the server.' }, 500)
    }
  },

  /** The hourly Cron Trigger: the enterprise module's scheduled work, run in the directory. */
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(directoryOf(env).scheduled())
  }
} satisfies ExportedHandler<Env>
