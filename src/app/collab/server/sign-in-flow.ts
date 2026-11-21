import type { PKCEFlow } from '@/app/runtime/pkce'

/**
 * One single sign-on started by this app (`createPKCEFlow`). The server binds the code it hands back to the
 * challenge, so only this app, holding the verifier, can trade it for a session; the state comes
 * back in the address, so a code from a sign-in someone else started is never taken.
 */
export type SignInFlow = PKCEFlow

/** Where the browser starts: back to `returnURL` with this flow's state, and its challenge. */
export function signInStartURL(startURL: string, returnURL: string, flow: SignInFlow): string {
  const back = `${returnURL}${returnURL.includes('?') ? '&' : '?'}state=${flow.state}`
  const params = new URLSearchParams({
    return: back,
    code_challenge: flow.challenge,
    code_challenge_method: 'S256'
  })
  return `${startURL}?${params}`
}

/** Whether the query a sign-in came back with answers this flow, and not another one. */
export function answersFlow(query: string, flow: SignInFlow): boolean {
  return new URLSearchParams(query).get('state') === flow.state
}
