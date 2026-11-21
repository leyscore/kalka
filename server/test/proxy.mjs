// Rate limits behind a reverse proxy, on Docker (workerd), where every header comes from the
// client unless the operator says how many proxies stand in front. Run against workerd started
// with KALKA_TRUSTED_PROXIES=1, not wrangler dev, which acts as Cloudflare's edge:
//   KALKA_TRUSTED_PROXIES=1 KALKA_PORT=8788 npm run workerd
//   KALKA_URL=http://localhost:8788 node test/proxy.mjs
import assert from 'node:assert/strict'

import { BASE } from './lib.mjs'

let n = 0
/** A failed sign-in to a new account each time, so only the per-address limit can refuse it. */
async function attempt(headers) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ email: `nobody-${Date.now()}-${n++}@example.com`, password: 'wrong wrong wrong' })
  })
  return res.status
}

// The client rotates the entries it controls; the address the proxy appended stays the same.
const proxy = '203.0.113.7'
const statuses = []
for (let i = 0; i < 65; i++) {
  statuses.push(await attempt({ 'X-Forwarded-For': `198.51.100.${i}, ${proxy}`, 'CF-Connecting-IP': `192.0.2.${i}` }))
}
assert.ok(statuses.slice(0, 60).every((status) => status === 401), 'the first 60 attempts are checked')
assert.ok(statuses.slice(60).every((status) => status === 429), 'spoofed headers do not reset the per-address limit')

// Another address, as the proxy reports it, has its own allowance.
assert.equal(await attempt({ 'X-Forwarded-For': '203.0.113.8' }), 401)
console.log('proxy: all checks passed')
