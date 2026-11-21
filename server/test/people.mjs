// People, invitations and the server's address, end to end.
//   KALKA_URL=http://localhost:8787 node test/people.mjs
import assert from 'node:assert/strict'
import { request as httpRequest } from 'node:http'

import { admin, BASE, call, member, SETUP_CODE } from './lib.mjs'

const root = await admin()

// The setup code is checked on its own, so the first screen can say so; never once set up.
await assert.rejects(call('POST', '/api/setup/check', { code: SETUP_CODE }), /409/)

// An invitation sent to an address works only for that address; a link for anyone still works.
const sent = await call('POST', '/api/invites', { role: 'admin', email: 'Boss@Example.com' }, root.token)
assert.deepEqual(await call('POST', '/api/auth/invite', { invite: sent.code }), { role: 'admin', email: 'Boss@Example.com' })
await assert.rejects(
  call('POST', '/api/auth/register', { invite: sent.code, email: `mallory-${Date.now()}@example.com`, name: 'Mallory', password: 'a long enough password' }),
  /403/
)
await assert.rejects(call('POST', '/api/auth/invite', { invite: 'a'.repeat(64) }), /400/)
await call('DELETE', `/api/invites/${sent.code}`, null, root.token).catch(() => undefined)

// A disabled administrator can be demoted or deleted while another one is active.
const second = await member(root.token, 'admin', 'second')
await call('PATCH', `/api/users/${second.user.id}`, { disabled: true }, root.token)
await call('PATCH', `/api/users/${second.user.id}`, { role: 'editor' }, root.token)
await call('PATCH', `/api/users/${second.user.id}`, { role: 'admin' }, root.token)
await call('DELETE', `/api/users/${second.user.id}`, null, root.token)
// The last active one still cannot leave.
await assert.rejects(call('PATCH', `/api/users/${root.user.id}`, { role: 'editor' }, root.token), /409/)

// Links take the server's own address, not the Host a request claims.
const base = new URL(BASE)
const forged = await new Promise((resolve, reject) => {
  const req = httpRequest(
    { host: base.hostname, port: base.port, path: '/api/invites', method: 'POST', headers: { Host: 'evil.example', 'Content-Type': 'application/json', Authorization: `Bearer ${root.token}` } },
    (res) => { let text = ''; res.on('data', (chunk) => (text += chunk)); res.on('end', () => resolve(JSON.parse(text))) }
  )
  req.on('error', reject)
  req.end(JSON.stringify({ role: 'viewer' }))
})
assert.ok(!forged.url.includes('evil.example'), `the link stays on the server: ${forged.url}`)
await call('DELETE', `/api/invites/${forged.code}`, null, root.token).catch(() => undefined)
console.log('people: all checks passed')
