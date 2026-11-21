const encoder = new TextEncoder()

/** Room IDs use the same alphabet and length as Kalka's peer-to-peer rooms. */
const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
export const ROOM_ID_LENGTH = 32

export function randomId(length = ROOM_ID_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let id = ''
  // 256 is not a multiple of 36; rejecting the top values keeps every character equally likely.
  for (const byte of bytes) {
    if (byte >= 252) return randomId(length)
    id += ID_CHARS[byte % 36]
  }
  return id
}

export function isRoomId(value: string): boolean {
  return new RegExp(`^[${ID_CHARS}]{${ROOM_ID_LENGTH}}$`).test(value)
}

export function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** A secret for a session, invite, ticket or login code: 32 random bytes, hex. */
export function randomToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)))
}

/** Secrets are stored as their SHA-256, so a copy of the database grants nothing. */
export async function hashToken(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(token)))
}

export function base64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

/** The S256 challenge of a PKCE verifier (RFC 7636). */
export async function challengeOf(verifier: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(verifier))))
}

export function fromBase64url(text: string): Uint8Array {
  const padded = text.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

/** The Workers runtime caps PBKDF2 at 100,000 iterations. */
const PBKDF2_ITERATIONS = 100_000

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits'
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${base64url(salt)}$${base64url(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2-sha256' || !iterations || !salt || !hash) return false
  const actual = await pbkdf2(password, fromBase64url(salt), Number(iterations))
  return timingSafeEqual(actual, fromBase64url(hash))
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index++) diff |= (a[index] ?? 0) ^ (b[index] ?? 0)
  return diff === 0
}

export async function sameSecret(a: string, b: string): Promise<boolean> {
  return timingSafeEqual(
    new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(a))),
    new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(b)))
  )
}
