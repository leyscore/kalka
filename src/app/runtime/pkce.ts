import { fromUint8Array } from 'js-base64'

/** A random base64url string of `bytes` random bytes, for PKCE verifiers and OAuth states. */
export function randomURLToken(bytes: number): string {
  return fromUint8Array(crypto.getRandomValues(new Uint8Array(bytes)), true)
}

/** The S256 challenge for a PKCE verifier (RFC 7636): its base64url SHA-256, without padding. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return fromUint8Array(new Uint8Array(digest), true)
}

/** One OAuth-style sign-in: the PKCE verifier kept here, its challenge sent out, and a state. */
export interface PKCEFlow {
  verifier: string
  challenge: string
  state: string
}

/** A fresh flow, with a verifier of `verifierBytes` random bytes. */
export async function createPKCEFlow(verifierBytes = 32): Promise<PKCEFlow> {
  const verifier = randomURLToken(verifierBytes)
  return { verifier, challenge: await pkceChallenge(verifier), state: randomURLToken(16) }
}
