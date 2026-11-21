// Shared by the end-to-end suites: the server's address and JSON calls with a session.
export const BASE = process.env.KALKA_URL ?? 'http://localhost:8787'
export const SETUP_CODE = process.env.KALKA_SETUP_CODE ?? 'dev-setup-code'
export const PASSWORD = process.env.KALKA_E2E_PASSWORD ?? 'correct horse battery'

export async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${data.error}`)
  return data
}

/** The administrator's session, setting the server up when it is new. */
export async function admin() {
  const info = await call('GET', '/api/server')
  if (info.setupRequired) {
    return call('POST', '/api/setup', { code: SETUP_CODE, email: 'admin@example.com', name: 'Admin', password: PASSWORD })
  }
  return call('POST', '/api/auth/login', { email: 'admin@example.com', password: PASSWORD })
}

/** A new account with this role, through an invitation. */
export async function member(adminToken, role, label = role) {
  const invite = await call('POST', '/api/invites', { role }, adminToken)
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`
  const account = await call('POST', '/api/auth/register', { invite: invite.code, email, name: label[0].toUpperCase() + label.slice(1), password: 'a long enough password' })
  return { ...account, email }
}
