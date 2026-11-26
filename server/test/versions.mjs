// Version history of a server file: a version kept when it is first saved, versions named by
// hand, each readable, and a restore that keeps the file as it was first, then waits as a
// version for its editors to apply.
//   KALKA_URL=http://localhost:8787 node test/versions.mjs
import assert from 'node:assert/strict'

import { BASE, admin, call, member } from './lib.mjs'

async function putFile(token, id, text) {
  const response = await fetch(`${BASE}/api/documents/${id}/file`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: new TextEncoder().encode(text)
  })
  assert.equal(response.status, 200, `saving ${id}`)
}

async function read(token, path) {
  const response = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  return response.status === 200 ? new TextDecoder().decode(await response.arrayBuffer()) : null
}

const root = await admin()
const editor = await member(root.token, 'editor', 'historian')
const viewer = await member(root.token, 'viewer', 'reader')
const file = await call('POST', '/api/documents', { name: 'Pricing' }, editor.token)

// Nothing to name until Kalka saved the file once.
await assert.rejects(call('POST', `/api/documents/${file.id}/versions`, { label: 'Draft' }, editor.token), /409/)
await putFile(editor.token, file.id, 'first draft')
let versions = await call('GET', `/api/documents/${file.id}/versions`, null, viewer.token)
assert.deepEqual(versions.map((version) => version.kind), ['auto'], 'the first save is kept')

// Saving again within the half hour keeps no new version; naming one does.
await putFile(editor.token, file.id, 'reviewed')
await assert.rejects(call('POST', `/api/documents/${file.id}/versions`, { label: 'Nope' }, viewer.token), /403/)
await assert.rejects(call('POST', `/api/documents/${file.id}/versions`, { label: '  ' }, editor.token), /400/)
const named = await call('POST', `/api/documents/${file.id}/versions`, { label: 'Reviewed' }, editor.token)
assert.equal(named.kind, 'named')
assert.equal(named.label, 'Reviewed')
assert.equal(named.by, 'Historian')
versions = await call('GET', `/api/documents/${file.id}/versions`, null, editor.token)
assert.deepEqual(versions.map((version) => version.label ?? version.kind), ['Reviewed', 'auto'])
assert.equal(await read(viewer.token, `/api/documents/${file.id}/versions/${named.id}/file`), 'reviewed')
assert.equal(await read(viewer.token, `/api/documents/${file.id}/versions/nope/file`), null)

// Restoring keeps what is there first, then the version waits for the editors to apply it.
await putFile(editor.token, file.id, 'broken')
const auto = versions[1]
await assert.rejects(call('POST', `/api/documents/${file.id}/versions/${auto.id}/restore`, {}, viewer.token), /403/)
await call('POST', `/api/documents/${file.id}/versions/${auto.id}/restore`, { before: 'Before restoring' }, editor.token)
assert.equal(await read(editor.token, `/api/documents/${file.id}/pending`), 'first draft')
assert.equal(await read(editor.token, `/api/documents/${file.id}/file`), 'first draft')
versions = await call('GET', `/api/documents/${file.id}/versions`, null, editor.token)
assert.equal(versions[0].kind, 'restore')
assert.equal(versions[0].label, 'Before restoring')
assert.equal(await read(editor.token, `/api/documents/${file.id}/versions/${versions[0].id}/file`), 'broken')

await call('DELETE', `/api/documents/${file.id}`, null, editor.token)
for (const person of [editor, viewer]) await call('DELETE', `/api/users/${person.user.id}`, null, root.token)
console.log('versions: all checks passed')
process.exit(0)
