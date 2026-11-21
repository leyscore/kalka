// End-to-end check against a running server (wrangler dev or workerd):
//   KALKA_URL=http://localhost:8787 node test/e2e.mjs
// Two Yjs clients edit through a room; a third, joining after both left, gets the document back
// from storage; then a compaction replaces the log with a snapshot.
import assert from 'node:assert/strict'
import { deflateSync, inflateSync } from 'fflate'
import WebSocket from 'ws'
import * as Y from 'yjs'

import { startSmtpSink } from './smtp-sink.mjs'

const BASE = process.env.KALKA_URL ?? 'http://localhost:8787'
const SETUP_CODE = process.env.KALKA_SETUP_CODE ?? 'dev-setup-code'
// Against a public deployment, pass a random password: the default one is in this file.
const PASSWORD = process.env.KALKA_E2E_PASSWORD ?? 'correct horse battery'
const WITH_MAIL = process.env.KALKA_E2E_MAIL !== 'off'
/** How long edits get to cross the network; raise it for a remote server. */
const SETTLE = Number(process.env.KALKA_E2E_SETTLE ?? 300)
const enc = new TextEncoder()
const dec = new TextDecoder()

async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${data.error}`)
  return data
}

const str = (s) => { const b = enc.encode(s); return [b.length, ...b] }
function action(ns, target, payload) { return Uint8Array.from([1, ...str(ns), ...str(target), ...payload]) }
function decode(buf) {
  const b = new Uint8Array(buf); let at = 1
  const s = () => { const n = b[at++]; const v = dec.decode(b.subarray(at, at + n)); at += n; return v }
  if (b[0] === 1) { const ns = s(); const peer = s(); return { type: 'action', ns, peer, payload: b.subarray(at) } }
  if (b[0] === 2) { const self = s(); const count = b[at++] * 256 + b[at++]; const peers = []; for (let i = 0; i < count; i++) peers.push(s()); return { type: 'welcome', self, peers } }
  return { type: b[0] === 3 ? 'join' : 'leave', peer: s() }
}

async function client(token, documentId, label) {
  const { url } = await call('POST', `/api/documents/${documentId}/ticket`, {}, token)
  const doc = new Y.Doc()
  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  let snapshot = [], updates = [], loaded
  const ready = new Promise((resolve) => (loaded = resolve))
  const state = { doc, ws, compactions: 0, peers: new Set() }
  doc.on('updateV2', (update, origin) => {
    if (origin !== 'remote' && ws.readyState === 1) ws.send(action('yjs-update', '', update))
  })
  ws.on('message', (data) => {
    const frame = decode(data)
    if (frame.type === 'welcome') frame.peers.forEach((p) => state.peers.add(p))
    if (frame.type === 'join') state.peers.add(frame.peer)
    if (frame.type === 'leave') state.peers.delete(frame.peer)
    if (frame.type !== 'action') return
    if (frame.ns === 'srv-load') {
      const kind = frame.payload[0], data = frame.payload.subarray(1)
      if (kind === 1) snapshot.push(data)
      if (kind === 2) updates.push(new Uint8Array(data))
      if (kind === 3) {
        if (snapshot.length) Y.applyUpdateV2(doc, inflateSync(Buffer.concat(snapshot)), 'remote')
        for (const u of updates) Y.applyUpdateV2(doc, u, 'remote')
        loaded()
      }
    }
    if (frame.ns === 'yjs-update') Y.applyUpdateV2(doc, new Uint8Array(frame.payload), 'remote')
    if (frame.ns === 'srv-compact') {
      state.compactions++
      const seq = Buffer.from(frame.payload.subarray(0, 4))
      ws.send(action('srv-snap', 'server', Uint8Array.from([...seq, ...deflateSync(Y.encodeStateAsUpdateV2(doc))])))
    }
  })
  await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject) })
  await ready
  state.close = () => new Promise((resolve) => { ws.once('close', resolve); ws.close() })
  return state
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const info = await call('GET', '/api/server')
assert.equal(info.kalkaServer, true)
let admin
if (info.setupRequired) {
  await assert.rejects(call('POST', '/api/setup', { code: 'wrong', email: 'a@example.com', name: 'Admin', password: 'correct horse battery' }))
  admin = await call('POST', '/api/setup', { code: SETUP_CODE, email: 'admin@example.com', name: 'Admin', password: PASSWORD })
} else {
  admin = await call('POST', '/api/auth/login', { email: 'admin@example.com', password: PASSWORD })
}
const token = admin.token
console.log('signed in as', admin.user.email)
if (!info.enterprise) {
  // Without the enterprise module, what it would add is not there.
  assert.deepEqual(info.features, [])
  assert.equal((await fetch(`${BASE}/api/ee/audit`, { headers: { Authorization: `Bearer ${token}` } })).status, 404)
  assert.equal((await fetch(`${BASE}/scim/v2/Users`)).status, 404)
}

// An invited viewer can read but not write.
const invite = await call('POST', '/api/invites', { role: 'viewer' }, token)
const viewerEmail = `viewer-${Date.now()}@example.com`
const viewer = await call('POST', '/api/auth/register', { invite: invite.code, email: viewerEmail, name: 'Viewer', password: 'another long password' })
assert.equal(viewer.user.role, 'viewer')
await assert.rejects(call('POST', '/api/documents', { name: 'nope' }, viewer.token), /403/)

const document = await call('POST', '/api/documents', { name: 'E2E' }, token)
const a = await client(token, document.id, 'A')
const b = await client(token, document.id, 'B')
a.doc.getMap('nodes').set('hello', 'world')
await wait(SETTLE)
assert.equal(b.doc.getMap('nodes').get('hello'), 'world', 'B sees A’s edit')
b.doc.getMap('nodes').set('from-b', 42)
await wait(SETTLE)
assert.equal(a.doc.getMap('nodes').get('from-b'), 42, 'A sees B’s edit')

const listedLive = await call('GET', '/api/documents', null, token)
assert.equal(listedLive.find((d) => d.id === document.id)?.live, 2, 'the file list counts open windows')
const v = await client(viewer.token, document.id, 'Viewer')
assert.equal(v.doc.getMap('nodes').get('hello'), 'world', 'viewer loads the document')
v.doc.getMap('nodes').set('vandal', true)
await wait(SETTLE)
assert.equal(a.doc.getMap('nodes').get('vandal'), undefined, 'viewer edits do not spread')
await v.close()

// Enough updates to trigger a compaction, answered by A.
for (let i = 0; i < 320; i++) a.doc.getMap('counter').set('n', i)
await wait(SETTLE * 5)
console.log('compactions answered:', a.compactions + b.compactions)
assert.ok(a.compactions + b.compactions >= 1, 'the room asked for a snapshot')
a.doc.getMap('nodes').set('after', 'compaction')
await wait(SETTLE)
await a.close()
await b.close()
await wait(SETTLE)

const c = await client(token, document.id, 'C')
assert.equal(c.doc.getMap('nodes').get('hello'), 'world')
assert.equal(c.doc.getMap('nodes').get('from-b'), 42)
assert.equal(c.doc.getMap('counter').get('n'), 319)
assert.equal(c.doc.getMap('nodes').get('after'), 'compaction')
await c.close()

// Kalka file upload and download.
const file = enc.encode('pretend kalka archive')
const put = await fetch(`${BASE}/api/documents/${document.id}/file`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: file })
assert.equal(put.status, 200)
const got = await fetch(`${BASE}/api/documents/${document.id}/file`, { headers: { Authorization: `Bearer ${token}` } })
assert.equal(dec.decode(await got.arrayBuffer()), 'pretend kalka archive')
const listed = await call('GET', '/api/documents', null, token)
assert.ok(listed.find((d) => d.id === document.id)?.hasFile)

// A ticket works once.
const { url } = await call('POST', `/api/documents/${document.id}/ticket`, {}, token)
const first = new WebSocket(url); await new Promise((r) => first.on('open', r)); first.close()
const second = new WebSocket(url)
await new Promise((resolve) => { second.on('error', resolve); second.on('unexpected-response', resolve) })

await call('DELETE', `/api/documents/${document.id}`, null, token)

// Email, password reset, profile, deletion and sign-in limits.
if (!WITH_MAIL) {
  console.log('e2e: all checks passed (email skipped)')
  process.exit(0)
}
const sink = startSmtpSink(2525)
// An invitation sent to an address works for that address only.
const editorEmail = `editor-${Date.now()}@example.com`
const emailInvite = await call('POST', '/api/invites', { role: 'editor', email: editorEmail }, token)
assert.equal(emailInvite.emailed, true, 'invitation emailed')
assert.ok(sink.messages.some((m) => m.to.includes(editorEmail) && m.body.includes(emailInvite.url)))
assert.ok(sink.messages.some((m) => m.to.includes(editorEmail) && m.body.includes(`kalka://server?url=${encodeURIComponent(BASE)}`)), 'the invitation opens the server in Kalka')
const editor = await call('POST', '/api/auth/register', { invite: emailInvite.code, email: editorEmail, name: 'Editor', password: 'first password 123' })
await call('POST', '/api/auth/forgot', { email: editorEmail })
const resetMail = sink.messages.find((m) => m.to.includes(editorEmail) && m.body.includes('#reset='))
const resetCode = /#reset=([a-f0-9]+)/.exec(resetMail?.body ?? '')?.[1]
assert.ok(resetCode, 'reset email has a link')
await call('POST', '/api/auth/reset', { code: resetCode, password: 'second password 456' })
await assert.rejects(call('GET', '/api/me', null, editor.token), /401/, 'old sessions end after a reset')
const relogged = await call('POST', '/api/auth/login', { email: editorEmail, password: 'second password 456' })
const renamed = await call('PATCH', '/api/me', { name: 'Renamed' }, relogged.token)
assert.equal(renamed.name, 'Renamed')
const changed = await call('POST', '/api/me/password', { current: 'second password 456', password: 'third password 789' }, relogged.token)
await call('GET', '/api/me', null, changed.token)
const adminReset = await call('POST', `/api/users/${editor.user.id}/reset`, {}, token)
assert.ok(adminReset.url.includes('#reset=') && adminReset.emailed)
for (let i = 0; i < 10; i++) await call('POST', '/api/auth/login', { email: editorEmail, password: 'wrong wrong wrong' }).catch(() => {})
await assert.rejects(call('POST', '/api/auth/login', { email: editorEmail, password: 'third password 789' }), /429/, 'too many attempts are refused')
await call('DELETE', `/api/users/${editor.user.id}`, null, token)
await assert.rejects(call('GET', '/api/me', null, changed.token), /401/, 'a deleted account is signed out')
await assert.rejects(call('DELETE', `/api/users/${admin.user.id}`, null, token), /409/)
sink.close()
assert.equal((await fetch(`${BASE}/healthz`)).status, 200)
console.log('e2e: all checks passed')
