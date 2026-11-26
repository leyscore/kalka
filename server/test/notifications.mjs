// Notifications, as Figma's bell keeps them for every file: a mention or a reply reaches the
// person on the server, open file or not, under the sender's own name, until they read it.
//   KALKA_URL=http://localhost:8787 node test/notifications.mjs
import assert from 'node:assert/strict'

import { admin, call, member } from './lib.mjs'

const root = await admin()
const ada = await member(root.token, 'editor', 'ada')
const bob = await member(root.token, 'editor', 'bob')
const cleo = await member(root.token, 'viewer', 'cleo')
const file = await call('POST', '/api/documents', { name: 'Pricing page' }, ada.token)

// A viewer comments too: Cleo mentions Ada, in a thread Bob wrote in, and cannot pose as anyone.
await call('POST', `/api/documents/${file.id}/notify`, {
  threadId: 'thread-1',
  mentions: ['ada', 'Nobody here'],
  participants: ['Bob', 'Cleo', 'Ada'],
  excerpt: '@Ada can the title be larger?'
}, cleo.token)

const forAda = await call('GET', '/api/me/notifications', null, ada.token)
assert.equal(forAda.unread, 1)
const [note] = forAda.notifications
assert.equal(note.reason, 'mention', 'a mention wins over a reply')
assert.equal(note.from, 'Cleo', 'the sender is who the server knows')
assert.equal(note.documentId, file.id)
assert.equal(note.documentName, 'Pricing page')
assert.equal(note.threadId, 'thread-1')
assert.equal(note.excerpt, '@Ada can the title be larger?')
assert.equal(note.read, false)

const forBob = await call('GET', '/api/me/notifications', null, bob.token)
assert.deepEqual(forBob.notifications.map((n) => n.reason), ['reply'])
// Never for the sender.
assert.equal((await call('GET', '/api/me/notifications', null, cleo.token)).notifications.length, 0)

// Reading one, then a file's, then all.
const afterRead = await call('POST', '/api/me/notifications/read', { ids: [note.id] }, ada.token)
assert.equal(afterRead.unread, 0)
assert.equal(afterRead.notifications[0].read, true)
// Someone else's ids change nothing.
await call('POST', '/api/me/notifications/read', { ids: [forBob.notifications[0].id] }, ada.token)
assert.equal((await call('GET', '/api/me/notifications', null, bob.token)).unread, 1)
assert.equal((await call('POST', '/api/me/notifications/read', { documentId: file.id }, bob.token)).unread, 0)

// No notes about a file that does not exist, nor for a stranger without an account.
await assert.rejects(call('POST', '/api/documents/nope/notify', { threadId: 't', excerpt: 'x' }, ada.token), /404/)
await assert.rejects(call('GET', '/api/me/notifications', null, null), /401/)

// A file in the trash takes its notes with it.
await call('POST', `/api/documents/${file.id}/notify`, { threadId: 't2', mentions: ['Bob'], excerpt: 'Again' }, ada.token)
assert.equal((await call('GET', '/api/me/notifications', null, bob.token)).unread, 1)
await call('DELETE', `/api/documents/${file.id}`, null, ada.token)
assert.equal((await call('GET', '/api/me/notifications', null, bob.token)).unread, 0)

for (const person of [ada, bob, cleo]) await call('DELETE', `/api/users/${person.user.id}`, null, root.token)
console.log('notifications: all checks passed')
process.exit(0)
