// Branches of a server file: made from its saved file, listed under it, merged back into it as a
// version its editors apply, refused when the file changed since unless forced.
//   KALKA_URL=http://localhost:8787 node test/branches.mjs
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

async function pending(token, id) {
  const response = await fetch(`${BASE}/api/documents/${id}/pending`, { headers: { Authorization: `Bearer ${token}` } })
  return response.status === 200 ? new TextDecoder().decode(await response.arrayBuffer()) : null
}

const root = await admin()
const editor = await member(root.token, 'editor', 'brancher')
const viewer = await member(root.token, 'viewer', 'onlooker')
const main = await call('POST', '/api/documents', { name: 'Landing' }, editor.token)

// Nothing to branch from until Kalka saved the file once.
await assert.rejects(call('POST', `/api/documents/${main.id}/branches`, { name: 'Hero' }, editor.token), /409/)
await putFile(editor.token, main.id, 'main v1')

await assert.rejects(call('POST', `/api/documents/${main.id}/branches`, { name: 'Hero' }, viewer.token), /403/)
const branch = await call('POST', `/api/documents/${main.id}/branches`, { name: 'Hero' }, editor.token)
assert.equal(branch.branchOf, main.id)
assert.equal(await pending(editor.token, branch.id), 'main v1', 'a branch starts as the file is')
assert.deepEqual((await call('GET', `/api/documents/${main.id}/branches`, null, viewer.token)).map((b) => b.id), [branch.id])
await assert.rejects(call('POST', `/api/documents/${branch.id}/branches`, { name: 'Nested' }, editor.token), /400/)
await assert.rejects(call('POST', `/api/documents/${main.id}/merge`, {}, editor.token), /400/)

// Merging puts the branch's file into the main one, and the branch goes to the trash.
await putFile(editor.token, branch.id, 'branch v2')
const merged = await call('POST', `/api/documents/${branch.id}/merge`, {}, editor.token)
assert.equal(merged.id, main.id)
assert.equal(await pending(editor.token, main.id), 'branch v2', 'the main file takes the branch')
await assert.rejects(call('GET', `/api/documents/${branch.id}`, null, editor.token), /404/)
assert.deepEqual(await call('GET', `/api/documents/${main.id}/branches`, null, editor.token), [])

// A main file saved since the branch began is not replaced without asking.
const second = await call('POST', `/api/documents/${main.id}/branches`, { name: 'Footer' }, editor.token)
await putFile(editor.token, second.id, 'footer work')
await new Promise((resolve) => setTimeout(resolve, 5))
await putFile(editor.token, main.id, 'main moved on')
await assert.rejects(call('POST', `/api/documents/${second.id}/merge`, {}, editor.token), /409/)
await call('POST', `/api/documents/${second.id}/merge`, { force: true }, editor.token)
assert.equal(await pending(editor.token, main.id), 'footer work')

await call('DELETE', `/api/documents/${main.id}`, null, editor.token)
for (const person of [editor, viewer]) await call('DELETE', `/api/users/${person.user.id}`, null, root.token)
console.log('branches: all checks passed')
process.exit(0)
