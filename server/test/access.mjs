// Losing access takes effect at once: in open rooms and over WebDAV.
//   KALKA_URL=http://localhost:8787 node test/access.mjs
import assert from 'node:assert/strict'
import WebSocket from 'ws'

import { admin, BASE, call, member } from './lib.mjs'

const enc = new TextEncoder()
const dec = new TextDecoder()
const SETTLE = Number(process.env.KALKA_E2E_SETTLE ?? 300)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const str = (s) => { const b = enc.encode(s); return [b.length, ...b] }
const action = (ns, target, payload) => Uint8Array.from([1, ...str(ns), ...str(target), ...payload])
function namespaceOf(buf) {
  const b = new Uint8Array(buf)
  if (b[0] !== 1) return null
  return dec.decode(b.subarray(2, 2 + b[1]))
}

/** A raw room socket: counts the `yjs-update` frames it receives and says how it closed. */
async function socket(token, documentId) {
  const { url, role } = await call('POST', `/api/documents/${documentId}/ticket`, {}, token)
  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  const state = { ws, role, updates: 0, closed: null }
  ws.on('message', (data) => { if (namespaceOf(data) === 'yjs-update') state.updates++ })
  ws.on('close', (code) => { if (state.closed === null) state.closed = code })
  await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject) })
  await wait(SETTLE)
  state.send = () => { if (ws.readyState === WebSocket.OPEN) ws.send(action('yjs-update', '', [0, 0])) }
  return state
}

/**
 * The close code the server sent, or null when the socket is still open after a while. `ws`
 * reports `close` only once the connection ends, which wrangler dev can delay: a received close
 * frame (the socket turns CLOSING without our asking) is enough, and `_closeCode` holds its code.
 */
async function closedWithin(state, ms = 3000) {
  for (let waited = 0; waited < ms; waited += 50) {
    if (state.closed !== null) return state.closed
    if (state.ws.readyState === WebSocket.CLOSING) {
      state.ws.terminate()
      return state.ws._closeCode
    }
    await wait(50)
  }
  return null
}

const root = await admin()
const document = await call('POST', '/api/documents', { name: 'Access' }, root.token)
const watcher = await socket(root.token, document.id)

// A disabled editor's open socket closes, and nothing they send afterwards reaches anyone.
{
  const editor = await member(root.token, 'editor', 'leaver')
  const open = await socket(editor.token, document.id)
  open.send()
  await wait(SETTLE)
  assert.equal(watcher.updates, 1, 'an editor’s edit is relayed')
  await call('PATCH', `/api/users/${editor.user.id}`, { disabled: true }, root.token)
  assert.equal(await closedWithin(open), 4401, 'the room closes a disabled person’s socket')
  open.send()
  await wait(SETTLE)
  assert.equal(watcher.updates, 1, 'nothing more from a disabled person is relayed')
  await assert.rejects(call('POST', `/api/documents/${document.id}/ticket`, {}, editor.token), /401/)
}

// A demoted editor is reconnected as a viewer, whose edits stay on their device.
{
  const editor = await member(root.token, 'editor', 'demoted')
  const open = await socket(editor.token, document.id)
  const before = watcher.updates
  await call('PATCH', `/api/users/${editor.user.id}`, { role: 'viewer' }, root.token)
  assert.equal(await closedWithin(open), 4403, 'the room closes the socket of someone whose role changed')
  const again = await socket(editor.token, document.id)
  assert.equal(again.role, 'viewer')
  again.send()
  await wait(SETTLE)
  assert.equal(watcher.updates, before, 'a demoted person’s edits are not relayed')
  again.ws.close()
}

// A deleted account's socket closes too.
{
  const editor = await member(root.token, 'editor', 'deleted')
  const open = await socket(editor.token, document.id)
  await call('DELETE', `/api/users/${editor.user.id}`, null, root.token)
  assert.equal(await closedWithin(open), 4401, 'the room closes a deleted person’s socket')
}

// Someone else's change leaves the administrator's own socket open.
assert.equal(watcher.closed, null, 'other people’s sockets stay open')
watcher.ws.close()
await call('DELETE', `/api/documents/${document.id}`, null, root.token)

// A password reset ends the app passwords made with the old password.
{
  const editor = await member(root.token, 'editor', 'reset')
  const made = await call('POST', '/api/me/app-passwords', { name: 'Finder' }, editor.token)
  const propfind = () =>
    fetch(`${BASE}/dav/`, {
      method: 'PROPFIND',
      headers: { Depth: '0', Authorization: `Basic ${Buffer.from(`${editor.email}:${made.password}`).toString('base64')}` }
    })
  assert.equal((await propfind()).status, 207, 'the app password opens the files folder')
  const link = await call('POST', `/api/users/${editor.user.id}/reset`, {}, root.token)
  const code = /#reset=([a-f0-9]+)/.exec(link.url)?.[1]
  await call('POST', '/api/auth/reset', { code, password: 'a new long password' })
  assert.equal((await propfind()).status, 401, 'app passwords end with a password reset')
  assert.deepEqual(await call('GET', '/api/me/app-passwords', null, (await call('POST', '/api/auth/login', { email: editor.email, password: 'a new long password' })).token), [])
  await call('DELETE', `/api/users/${editor.user.id}`, null, root.token)
}

console.log('access: all checks passed')
