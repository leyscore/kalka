// The enterprise module as the core sees it. The core lends it generic hooks (see ee/types.ts):
// what it does with them, single sign-on and the Business features, lives in the module.
import enterprise, { buildLicenseKey } from './ee/module'
import type { EnterpriseHost, EnterpriseStatus, EventActor } from './ee/types'
import { CONSOLE_SETTINGS, listSetting, SECRET_SETTINGS, setting, type Env } from './env'
import { clientIp, directoryOf, publicUrl, roomOf, tenantOf } from './http'
import { tryMail } from './mail'
import { directoryName } from './names'

export type Actor = EventActor

/** The address a license is checked against: the request's, or the one the server last saw. */
export function serverUrl(env: Env, request: Request | null, knownOrigin?: string | null): string {
  if (request) return publicUrl(env, request)
  return (setting(env, 'KALKA_PUBLIC_URL') ?? knownOrigin ?? 'http://localhost').replace(/\/+$/, '')
}

/**
 * The host lent to the module. `directory` defaults to the directory's stub; the directory
 * itself passes its own instance when it calls the module from its alarm.
 */
export function enterpriseHost(
  env: Env,
  request: Request | null,
  url = serverUrl(env, request),
  directory: EnterpriseHost['directory'] = directoryOf(env)
): EnterpriseHost {
  const origins = new Set([new URL(url).origin, ...listSetting(env, 'KALKA_APP_ORIGINS')])
  const host: EnterpriseHost = {
    env,
    directory,
    publicUrl: url,
    licenseKey: setting(env, 'KALKA_LICENSE_KEY') ?? buildLicenseKey,
    directoryName: directoryName(tenantOf(env)),
    room: (documentId) => roomOf(env, documentId),
    async user(incoming) {
      const header = incoming.headers.get('Authorization') ?? ''
      return header.startsWith('Bearer ') ? directory.authenticate(header.slice(7).trim()) : null
    },
    async notifyAdmins(subject, text) {
      const emails = await directory.adminEmails()
      await Promise.all(emails.map((to) => tryMail(env, to, subject, text)))
    },
    isAllowedReturn(returnUrl) {
      if (returnUrl.startsWith('kalka://oauth/server')) return true
      try {
        return origins.has(new URL(returnUrl).origin)
      } catch {
        return false
      }
    },
    emit: (action, actor, target, detail) => emitWith(host, request, action, actor, target, detail)
  }
  return host
}

export async function enterpriseStatus(env: Env, request: Request): Promise<EnterpriseStatus | null> {
  if (!enterprise) return null
  try {
    return await enterprise.status(enterpriseHost(env, request))
  } catch (error) {
    console.error('[kalka] Enterprise module status failed', error)
    return null
  }
}

/** Checked offline from the key alone; kept a few minutes so busy servers verify it rarely. */
const FEATURE_TTL_MS = 5 * 60 * 1000
const featureCache = new Map<string, { at: number; features: string[] }>()

/** What the license grants, as the module reports it; nothing without the module. */
export async function licensedFeatures(env: Env, url: string): Promise<string[]> {
  const host = enterpriseHost(env, null, url)
  if (!enterprise?.features || !host.licenseKey) return []
  const key = `${host.licenseKey}|${url}`
  const cached = featureCache.get(key)
  if (cached && Date.now() - cached.at < FEATURE_TTL_MS) return cached.features
  let features: string[] = []
  try {
    features = await enterprise.features(host)
  } catch (error) {
    console.error('[kalka] License check failed', error)
  }
  if (featureCache.size > 100) featureCache.clear()
  featureCache.set(key, { at: Date.now(), features })
  return features
}

/** Settings the console may change: the core's, and those the module declares. */
export function consoleSettingKeys(): string[] {
  return [...CONSOLE_SETTINGS, ...(enterprise?.settings?.keys ?? [])]
}

export function isSecretSetting(key: string): boolean {
  return SECRET_SETTINGS.has(key) || Boolean(enterprise?.settings?.secrets.includes(key))
}

async function emitWith(
  host: EnterpriseHost,
  request: Request | null,
  action: string,
  actor: Actor,
  target: string | null,
  detail?: Record<string, unknown>
): Promise<void> {
  if (!enterprise?.event) return
  try {
    const ip = request ? clientIp(request, host.env) : null
    await enterprise.event(host, {
      at: Date.now(),
      action,
      actor: actor ? { id: actor.id, email: actor.email, name: actor.name } : null,
      target,
      detail: detail && Object.keys(detail).length ? detail : null,
      ip: ip === 'unknown' ? null : ip,
      country: request?.headers.get('CF-IPCountry') ?? null,
      userAgent: request?.headers.get('User-Agent')?.slice(0, 300) ?? null
    })
  } catch (error) {
    console.error('[kalka] Enterprise event failed', error)
  }
}

/**
 * Tells the module what happened, with who and from where. Never fails the request it
 * describes. Setting values and secrets are never part of an event.
 */
export function emit(
  env: Env,
  request: Request | null,
  actor: Actor,
  action: string,
  target: string | null,
  detail?: Record<string, unknown>
): Promise<void> {
  if (!enterprise?.event) return Promise.resolve()
  return emitWith(enterpriseHost(env, request), request, action, actor, target, detail)
}
