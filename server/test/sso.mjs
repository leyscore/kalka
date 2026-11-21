// Single sign-on as the core sees it: linking to existing accounts, seats, and a sign-in bound to
// the browser and the app that started it. Needs the stand-in module:
//   KALKA_EE_PATH=test/fixtures/ee-stub.js npm run dev
//   KALKA_URL=http://localhost:8787 node test/sso.mjs
import assert from 'node:assert/strict'

import { admin, BASE, call, member } from './lib.mjs'

const root = await admin()
const info = await call('GET', '/api/server')
assert.equal(info.enterprise, true, 'start the server with KALKA_EE_PATH=test/fixtures/ee-stub.js')
const run = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
const sso = (input) =>
  fetch(`${BASE}/api/ee/test/sso`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }).then(
    async (res) => ({ status: res.status, body: await res.json() })
  )
const seats = async () => (await call('GET', '/api/server')).license

// An existing password account, an administrator above all, is not taken over by email.
{
  const local = await member(root.token, 'editor', 'local')
  const linked = await sso({ email: local.email, role: 'admin' })
  assert.equal(linked.status, 409, 'a password account does not link to single sign-on')
  assert.equal((await sso({ email: root.user.email, role: 'admin' })).status, 409, 'nor does an administrator')
  assert.equal((await call('GET', '/api/me', null, root.token)).role, 'admin')
}

// Seats: a new editor, a raise from viewer and re-enabling an editor each need a free one.
const made = []
{
  const viewer = await sso({ email: `viewer-${run}@example.com`, role: 'viewer' })
  assert.equal(viewer.status, 200)
  made.push(viewer.body.id)
  const { seats: total, usedSeats } = await seats()
  for (let i = usedSeats; i < total; i++) {
    const editor = await sso({ email: `editor-${i}-${run}@example.com` })
    assert.equal(editor.status, 200, 'an editor takes a free seat')
    made.push(editor.body.id)
  }
  assert.equal((await sso({ email: `over-${run}@example.com` })).status, 403, 'no seat, no new editor')
  await assert.rejects(call('PATCH', `/api/users/${viewer.body.id}`, { role: 'editor' }, root.token), /403/, 'no seat, no raise from the console')
  const grouped = await sso({ email: `viewer-${run}@example.com`, role: 'editor' })
  assert.equal(grouped.body.role, 'viewer', 'no seat, no raise from groups: the viewer keeps working as one')

  const someone = made[made.length - 1]
  await call('PATCH', `/api/users/${someone}`, { disabled: true }, root.token)
  const raised = await call('PATCH', `/api/users/${viewer.body.id}`, { role: 'editor' }, root.token)
  assert.equal(raised.role, 'editor', 'a freed seat can be given')
  await assert.rejects(call('PATCH', `/api/users/${someone}`, { disabled: false }, root.token), /403/, 'no seat, no re-enabling an editor')
  // Leave the seats free for the next run.
  for (const id of made) await call('PATCH', `/api/users/${id}`, { disabled: true }, root.token).catch(() => undefined)
}

// The browser and the app that start a sign-in are the ones that finish it.
const verifier = 'v'.repeat(20) + run.replace(/[^a-z0-9]/g, '').padEnd(30, 'x')
const challenge = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))).toString('base64url')
async function start(email, withChallenge) {
  const query = new URLSearchParams({ return: `${BASE}/`, email })
  if (withChallenge) query.set('code_challenge', challenge)
  const res = await fetch(`${BASE}/auth/oidc/start?${query}`, { redirect: 'manual' })
  assert.equal(res.status, 302)
  const state = new URL(res.headers.get('Location')).searchParams.get('state')
  const cookie = res.headers.get('Set-Cookie')?.split(';')[0]
  assert.ok(state && cookie, 'the start sets a cookie for its state')
  return { state, cookie }
}
async function callback({ state, cookie }) {
  const res = await fetch(`${BASE}/auth/oidc/callback?state=${state}`, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} })
  return { status: res.status, code: res.status === 302 ? new URL(res.headers.get('Location')).searchParams.get('code') : null }
}
const exchange = (code, body = {}) =>
  fetch(`${BASE}/api/auth/exchange`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, ...body }) }).then((res) => res.status)
{
  const email = `flow-${run}@example.com`
  const elsewhere = await start(email, true)
  assert.equal((await callback({ state: elsewhere.state })).status, 400, 'a callback without the starting browser’s cookie is refused')

  const caught = await callback(await start(email, true))
  assert.equal(caught.status, 302)
  assert.equal(await exchange(caught.code), 400, 'a code caught on its way to the app is useless without the verifier')

  const own = await callback(await start(email, true))
  assert.equal(await exchange(own.code, { verifier }), 200, 'the app that started the sign-in finishes it')

  const planted = await callback(await start(email, false))
  assert.equal(await exchange(planted.code, { verifier }), 400, 'a code from a sign-in the app did not start is refused')
  const legacy = await callback(await start(email, false))
  assert.equal(await exchange(legacy.code), 200, 'sign-ins without a challenge still work for older apps')
  const user = (await call('GET', '/api/users', null, root.token)).find((item) => item.email === email)
  if (user) await call('PATCH', `/api/users/${user.id}`, { disabled: true }, root.token)
}

console.log('sso: all checks passed')
