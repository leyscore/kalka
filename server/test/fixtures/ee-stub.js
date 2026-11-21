// A stand-in for the enterprise module, for tests only: it never ships. Build the server with
//   KALKA_EE_PATH=test/fixtures/ee-stub.js npm run dev
// and it answers the same sign-in routes as the real module, with a pretend identity provider
// that signs in whoever `?email=` names, and a license of SEATS seats.
const SEATS = 2
const DAY = 24 * 60 * 60 * 1000

async function status(host) {
  const used = await host.directory.countSsoUsers(Date.now() - 90 * DAY)
  return {
    sso: { label: 'Test SSO', startPath: '/auth/oidc/start' },
    license: { valid: true, customer: 'Test', seats: SEATS, usedSeats: used, expiresAt: null, problem: null, features: ['sso'] }
  }
}

function withParam(url, name, value) {
  return `${url}${url.includes('?') ? '&' : '?'}${name}=${encodeURIComponent(value)}`
}

/** What the pretend provider says about someone: `role` and `verified` come from the test. */
async function signIn(host, input) {
  const license = (await status(host)).license
  return host.directory.ssoSignIn({
    subject: `test#${input.subject ?? input.email}`,
    email: input.email,
    emailVerified: input.verified !== false,
    name: input.email,
    role: input.role ?? null,
    defaultRole: input.defaultRole ?? 'editor',
    seatsLeft: Math.max(0, license.seats - license.usedSeats)
  })
}

export default {
  version: 'test',
  status,
  async features() {
    return ['sso']
  },
  async handle(request, host) {
    const url = new URL(request.url)
    if (url.pathname === '/api/ee/test/sso' && request.method === 'POST') {
      const result = await signIn(host, await request.json())
      return Response.json(result, { status: typeof result.error === 'string' ? result.status : 200 })
    }
    if (url.pathname === '/auth/oidc/start') {
      const returnTo = url.searchParams.get('return') ?? ''
      if (!host.isAllowedReturn(returnTo)) return new Response('Return not allowed', { status: 400 })
      const state = await host.directory.putFlowState(JSON.stringify({ returnTo, email: url.searchParams.get('email') }), 10 * 60 * 1000)
      return new Response(null, { status: 302, headers: { Location: `https://idp.example/authorize?state=${state}` } })
    }
    if (url.pathname === '/auth/oidc/callback') {
      const stored = await host.directory.takeFlowState(url.searchParams.get('state') ?? '')
      if (!stored) return new Response('Expired', { status: 400 })
      const flow = JSON.parse(stored)
      const user = await signIn(host, { email: url.searchParams.get('email') ?? flow.email })
      if (typeof user.error === 'string') return new Response(null, { status: 302, headers: { Location: withParam(flow.returnTo, 'error', user.error) } })
      const code = await host.directory.createLoginCode(user.id)
      return new Response(null, { status: 302, headers: { Location: withParam(flow.returnTo, 'code', code) } })
    }
    return null
  }
}
