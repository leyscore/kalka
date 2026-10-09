import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { app, safeStorage } from 'electron'

import { NativeError } from '../ipc'

interface Reference {
  integrationId: string
  profileId: string
  field: string
}

const SEGMENT = /^[a-z0-9._-]{1,64}$/
const MAX_VALUE_BYTES = 16 * 1024

const file = () => join(app.getPath('userData'), 'credentials.json')

function fail(code: string, message: string): never {
  throw new NativeError({ code, message })
}

function account(reference: Reference): string {
  const parts = [reference?.integrationId, reference?.profileId, reference?.field]
  if (!parts.every((part) => typeof part === 'string' && SEGMENT.test(part)))
    fail('invalid-reference', 'The credential reference is invalid.')
  return `v1:${parts.join(':')}`
}

/**
 * Secrets encrypted with the OS keychain (`safeStorage`), stored as ciphertext only. When the
 * keychain is unavailable nothing is stored: there is never a plaintext fallback.
 */
function available(): boolean {
  return safeStorage.isEncryptionAvailable()
}

async function load(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(file(), 'utf8')) as Record<string, string>
  } catch {
    return {}
  }
}

async function save(entries: Record<string, string>): Promise<void> {
  await mkdir(app.getPath('userData'), { recursive: true })
  await writeFile(file(), JSON.stringify(entries), { mode: 0o600 })
}

export const credentialCommands = {
  credential_store_availability: () => (available() ? 'available' : 'unavailable'),
  credential_access_paused: () => false,
  credential_retry_access: () => undefined,
  async credential_status({ reference }: { reference: Reference }) {
    const key = account(reference)
    if (!available()) return 'unavailable'
    return (await load())[key] ? 'configured' : 'missing'
  },
  async credential_read({ reference }: { reference: Reference }) {
    const key = account(reference)
    if (!available()) fail('unavailable', 'The system credential store is unavailable.')
    const stored = (await load())[key]
    if (!stored) return null
    try {
      return safeStorage.decryptString(Buffer.from(stored, 'base64'))
    } catch {
      return fail('failed', 'The credential could not be decrypted.')
    }
  },
  async credential_write({ reference, value }: { reference: Reference; value: string }) {
    const key = account(reference)
    if (
      typeof value !== 'string' ||
      value.length === 0 ||
      Buffer.byteLength(value) > MAX_VALUE_BYTES
    )
      fail('invalid-value', 'The credential value is invalid.')
    if (!available()) fail('unavailable', 'The system credential store is unavailable.')
    const entries = await load()
    entries[key] = safeStorage.encryptString(value).toString('base64')
    await save(entries)
  },
  async credential_remove({ reference }: { reference: Reference }) {
    const key = account(reference)
    const entries = await load()
    delete entries[key]
    await save(entries)
  }
}
