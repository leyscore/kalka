// The trash: a deleted file waits there, comes back with its content, or goes for good.
import assert from 'node:assert/strict'

import { admin, call, member } from './lib.mjs'

const { token } = await admin()
const viewer = await member(token, 'viewer', 'reader')
const document = await call('POST', '/api/documents', { name: 'Trash me' }, token)

await call('DELETE', `/api/documents/${document.id}`, null, token)
const listed = await call('GET', '/api/documents', null, token)
assert.ok(!listed.some((d) => d.id === document.id), 'a file in the trash leaves the list')
await assert.rejects(call('POST', `/api/documents/${document.id}/ticket`, {}, token), /404/, 'nobody opens a file in the trash')

const trash = await call('GET', '/api/trash', null, token)
const entry = trash.find((d) => d.id === document.id)
assert.ok(entry, 'the file is in the trash')
assert.equal(entry.deletedBy, 'Admin')
assert.ok(entry.expiresAt - entry.deletedAt >= 29 * 24 * 3600 * 1000, 'it waits about 30 days')
await assert.rejects(call('GET', '/api/trash', null, viewer.token), /403/, 'viewers do not see the trash')

const restored = await call('POST', `/api/trash/${document.id}/restore`, {}, token)
assert.equal(restored.name, 'Trash me')
assert.ok((await call('GET', '/api/documents', null, token)).some((d) => d.id === document.id), 'restored')
await assert.rejects(call('POST', `/api/trash/${document.id}/restore`, {}, token), /404/, 'only a file in the trash is restored')

await call('DELETE', `/api/documents/${document.id}`, null, token)
await call('DELETE', `/api/trash/${document.id}`, null, token)
assert.ok(!(await call('GET', '/api/trash', null, token)).some((d) => d.id === document.id), 'deleted for good')
await assert.rejects(call('GET', `/api/documents/${document.id}`, null, token), /404/)

console.log('trash: all checks passed')
