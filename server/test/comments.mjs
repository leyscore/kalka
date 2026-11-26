// Viewers comment, as in Figma, without ever changing the document: the server keeps what they
// send on its comment channel, stamped with who sent it, until an editor writes it in.
//   KALKA_URL=http://localhost:8787 node test/comments.mjs
import assert from 'node:assert/strict'
import WebSocket from 'ws'

import { admin, call, member } from './lib.mjs'

const enc = new TextEncoder()
const dec = new TextDecoder()
const SETTLE = Number(process.env.KALKA_E2E_SETTLE ?? 300)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const str = (s) => { const b = enc.encode(s); return [b.length, ...b] }
const action = (ns, target, payload) => Uint8Array.from([1, ...str(ns), ...str(target), ...payload])

function readAction(buf) {
  const b = new Uint8Array(buf)
  if (b[0] !== 1) return null
  let at = 1
  const text = () => { const n = b[at]; const value = dec.decode(b.subarray(at + 1, at + 1 + n)); at += 1 + n; return value }
  const namespace = text()
  const peer = text()
  return { namespace, peer, payload: b.subarray(at) }
}

/** `[id][user id][name][comment]`, as the server stamps a comment. */
function readComment(payload) {
  let at = 0
  const text = () => { const n = payload[at]; const value = dec.decode(payload.subarray(at + 1, at + 1 + n)); at += 1 + n; return value }
  const id = text()
  const userId = text()
  const name = text()
  return { id, userId, name, body: dec.decode(payload.subarray(at)) }
}

/** A raw room socket that keeps the frames it receives. */
async function socket(token, documentId) {
  const { url, role } = await call('POST', `/api/documents/${documentId}/ticket`, {}, token)
  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  const state = { ws, role, frames: [] }
  ws.on('message', (data) => { const frame = readAction(data); if (frame) state.frames.push(frame) })
  await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject) })
  await wait(SETTLE)
  state.of = (namespace) => state.frames.filter((frame) => frame.namespace === namespace)
  state.send = (namespace, target, payload) => ws.send(action(namespace, target, payload))
  state.close = () => ws.close()
  return state
}

const root = await admin()
const maker = await member(root.token, 'editor', 'maker')
const reader = await member(root.token, 'viewer', 'reader')
const document = await call('POST', '/api/documents', { name: 'Comments from viewers' }, maker.token)

const viewer = await socket(reader.token, document.id)
assert.equal(viewer.role, 'viewer')

// A viewer still cannot change the document: its update reaches nobody and is not stored.
const watcher = await socket(maker.token, document.id)
viewer.send('yjs-update', '', [0, 0])
await wait(SETTLE)
assert.equal(watcher.of('yjs-update').length, 0, 'a viewer’s edit is not relayed')
watcher.close()
await wait(SETTLE)

// Nor can it pass something off as the server's, or as a comment someone else stamped.
const comment = enc.encode(JSON.stringify({ ops: [{ op: 'resolve', threadId: 't', resolved: true }] }))
const forged = await socket(maker.token, document.id)
forged.frames.length = 0
viewer.send('srv-comment', '', comment)
viewer.send('srv-load', '', [3])
await wait(SETTLE)
assert.equal(forged.of('srv-comment').length, 0, 'nothing waits before a comment reaches the server')
assert.equal(forged.frames.filter((frame) => frame.namespace.startsWith('srv-')).length, 0, 'no server frame is relayed from a viewer')
forged.close()
await wait(SETTLE)

// With nobody to write it in, the comment waits on the server, under the viewer's own name.
viewer.send('srv-comment', 'server', comment)
await wait(SETTLE)
const editor = await socket(maker.token, document.id)
const [waiting] = editor.of('srv-comment')
assert.ok(waiting, 'an editor who opens the file receives the waiting comment')
assert.equal(waiting.peer, 'server')
const stamped = readComment(waiting.payload)
assert.equal(stamped.userId, reader.user.id)
assert.equal(stamped.name, 'Reader')
assert.equal(stamped.body, dec.decode(comment))
assert.equal(editor.of('yjs-update').length, 0, 'the comment is not an edit of the document')

// Live, it reaches the editors at once; a viewer's acknowledgement changes nothing.
viewer.send('srv-comment', 'server', comment)
await wait(SETTLE)
assert.equal(editor.of('srv-comment').length, 2)
viewer.send('srv-comment-ack', 'server', enc.encode(stamped.id))
await wait(SETTLE)
const again = await socket(maker.token, document.id)
assert.equal(again.of('srv-comment').length, 2, 'only an editor’s acknowledgement counts')
again.close()

// Once an editor wrote them in and says so, they no longer wait.
const ids = editor.of('srv-comment').map((frame) => readComment(frame.payload).id)
editor.send('srv-comment-ack', 'server', enc.encode(ids.join('\n')))
await wait(SETTLE)
const later = await socket(maker.token, document.id)
assert.equal(later.of('srv-comment').length, 0, 'acknowledged comments are gone')
later.close()

// A comment past the size limit is turned away.
viewer.send('srv-comment', 'server', new Uint8Array(17 * 1024).fill(32))
await wait(SETTLE)
const last = await socket(maker.token, document.id)
assert.equal(last.of('srv-comment').length, 0, 'an oversized comment is not kept')
last.close()

viewer.close()
editor.close()
await call('DELETE', `/api/documents/${document.id}`, null, maker.token)
for (const person of [maker, reader]) await call('DELETE', `/api/users/${person.user.id}`, null, root.token)
console.log('comments: all checks passed')
process.exit(0)
