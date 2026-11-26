// A file shared to view: its members open it as viewers, and only its maker or an
// administrator changes how it is shared.
//   KALKA_URL=http://localhost:8787 node test/link-role.mjs
import assert from 'node:assert/strict'
import WebSocket from 'ws'

import { admin, call, member } from './lib.mjs'

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
const maker = await member(root.token, 'editor', 'maker')
const other = await member(root.token, 'editor', 'other')
const document = await call('POST', '/api/documents', { name: 'Shared to view' }, maker.token)
assert.equal(document.linkRole, 'edit', 'a new file is shared to edit')

const watcher = await socket(maker.token, document.id)
const open = await socket(other.token, document.id)
assert.equal(open.role, 'editor')

// Only the maker, or an administrator, changes how the file is shared.
await assert.rejects(
  call('PATCH', `/api/documents/${document.id}`, { linkRole: 'view' }, other.token),
  /403/
)
const shared = await call('PATCH', `/api/documents/${document.id}`, { linkRole: 'view' }, maker.token)
assert.equal(shared.linkRole, 'view')
assert.equal((await call('GET', `/api/documents/${document.id}`, null, other.token)).linkRole, 'view')

// Everyone in the room reconnects; another editor comes back as a viewer, whose edits stay theirs.
assert.equal(await closedWithin(open), 4403, 'the room reopens when sharing changes')
const viewer = await socket(other.token, document.id)
assert.equal(viewer.role, 'viewer')
const makerSocket = await socket(maker.token, document.id)
assert.equal(makerSocket.role, 'editor', 'the maker keeps editing')
viewer.send()
await wait(SETTLE)
assert.equal(makerSocket.updates, 0, 'a viewer’s edit is not relayed')
assert.equal((await socket(root.token, document.id)).role, 'admin', 'an administrator keeps editing')

// Nor can a viewer of the file save, rename or trash it.
await assert.rejects(call('PATCH', `/api/documents/${document.id}`, { name: 'Renamed' }, other.token), /403/)
await assert.rejects(call('DELETE', `/api/documents/${document.id}`, null, other.token), /403/)

// Shared to edit again, the other editor edits.
await call('PATCH', `/api/documents/${document.id}`, { linkRole: 'edit' }, root.token)
assert.equal((await socket(other.token, document.id)).role, 'editor')

watcher.ws.close()
await call('DELETE', `/api/documents/${document.id}`, null, maker.token)
for (const person of [maker, other]) await call('DELETE', `/api/users/${person.user.id}`, null, root.token)
console.log('link role: all checks passed')
process.exit(0)
