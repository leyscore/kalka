// WebDAV, end to end: app passwords, the folder listing, uploads that become pending versions,
// roles, locks and renames.
//   KALKA_URL=http://localhost:8787 node test/dav.mjs
import assert from 'node:assert/strict'

import { admin, BASE, call, member } from './lib.mjs'

const enc = new TextEncoder()
const dec = new TextDecoder()
const basic = (email, password) => 'Basic ' + Buffer.from(`${email}:${password}`).toString('base64')

async function dav(method, path, auth, { body, headers } = {}) {
  return fetch(BASE + path, { method, body, headers: { ...(auth ? { Authorization: auth } : {}), ...headers } })
}
const hrefs = (xml) => [...xml.matchAll(/<d:href>([^<]+)<\/d:href>/g)].map((m) => m[1])

const root = await admin()
const editor = await member(root.token, 'editor')
const viewer = await member(root.token, 'viewer')

// App passwords: created once, listed without the secret, revocable.
const made = await call('POST', '/api/me/app-passwords', { name: 'Finder' }, editor.token)
assert.match(made.password, /^[a-z2-9]{6}(-[a-z2-9]{6}){3}$/)
const listed = await call('GET', '/api/me/app-passwords', null, editor.token)
assert.equal(listed.length, 1)
assert.equal(listed[0].password, undefined, 'the list never shows the password')
const ed = basic(editor.email, made.password)
const viewerPassword = (await call('POST', '/api/me/app-passwords', { name: 'rclone' }, viewer.token)).password
const vw = basic(viewer.email, viewerPassword)
await assert.rejects(call('POST', '/api/me/app-passwords', { name: '  ' }, editor.token), /400/)

// Discovery and sign-in.
const options = await dav('OPTIONS', '/dav/')
assert.equal(options.status, 200)
assert.match(options.headers.get('DAV'), /2/)
assert.match(options.headers.get('Allow'), /PROPFIND/)
const anonymous = await dav('PROPFIND', '/dav/', null, { headers: { Depth: '1' } })
assert.equal(anonymous.status, 401)
assert.match(anonymous.headers.get('WWW-Authenticate'), /^Basic realm=/)
assert.equal((await dav('PROPFIND', '/dav/', basic(editor.email, 'wrong-password'), { headers: { Depth: '1' } })).status, 401)
assert.equal((await dav('PROPFIND', '/dav/', basic(viewer.email, made.password), { headers: { Depth: '1' } })).status, 401, 'an app password works only with its own email')
assert.equal((await dav('PROPFIND', '/dav/', `Bearer ${editor.token}`, { headers: { Depth: '0' } })).status, 207, 'a session works too')

// An upload creates a document holding the archive, as a version Kalka may apply.
const archive = enc.encode('PK pretend kalka archive v1')
const put = await dav('PUT', '/dav/Brand%20kit.kalka', ed, { body: archive })
assert.equal(put.status, 201)
let docs = await call('GET', '/api/documents', null, root.token)
let doc = docs.find((d) => d.name === 'Brand kit')
assert.ok(doc, 'the upload is a server document')
assert.ok(doc.hasFile)
assert.equal(doc.fileSize, archive.length)
assert.equal(doc.pending?.by, 'Editor')

const listing = await dav('PROPFIND', '/dav/', ed, { headers: { Depth: '1' } })
assert.equal(listing.status, 207)
const listingXml = await listing.text()
assert.ok(hrefs(listingXml).includes('/dav/'))
assert.ok(hrefs(listingXml).includes('/dav/Brand%20kit.kalka'))
assert.match(listingXml, new RegExp(`<d:getcontentlength>${archive.length}</d:getcontentlength>`))
assert.match(listingXml, /<d:collection\/>/)
const depth0 = await (await dav('PROPFIND', '/dav', ed, { headers: { Depth: '0' } })).text()
assert.deepEqual(hrefs(depth0), ['/dav/'], 'depth 0 lists the folder alone')
const one = await (await dav('PROPFIND', '/dav/brand%20KIT.kalka', ed, { headers: { Depth: '0' } })).text()
assert.deepEqual(hrefs(one), ['/dav/Brand%20kit.kalka'], 'names match without regard to case, as on macOS')

const got = await dav('GET', '/dav/Brand%20kit.kalka', vw)
assert.equal(got.status, 200)
assert.equal(got.headers.get('Content-Type'), 'application/vnd.kalka+zip')
assert.equal(dec.decode(await got.arrayBuffer()), 'PK pretend kalka archive v1')
const etag = got.headers.get('ETag')
assert.equal((await dav('GET', '/dav/Brand%20kit.kalka', vw, { headers: { 'If-None-Match': etag } })).status, 304)
const head = await dav('HEAD', '/dav/Brand%20kit.kalka', vw)
assert.equal(head.headers.get('Content-Length'), String(archive.length))
assert.equal((await dav('GET', '/dav/Nothing.kalka', vw)).status, 404)

// Replacing it keeps the document and records a new pending version.
const v2 = enc.encode('PK pretend kalka archive v2, longer')
assert.equal((await dav('PUT', '/dav/Brand%20kit.kalka', ed, { body: v2 })).status, 204)
assert.equal((await dav('PUT', '/dav/Brand%20kit.kalka', ed, { body: new Uint8Array() })).status, 204, 'an empty upload keeps the archive')
docs = await call('GET', '/api/documents', null, root.token)
assert.equal(docs.filter((d) => d.name === 'Brand kit').length, 1)
const pending = await fetch(`${BASE}/api/documents/${doc.id}/pending`, { headers: { Authorization: `Bearer ${root.token}` } })
assert.equal(dec.decode(await pending.arrayBuffer()), 'PK pretend kalka archive v2, longer')
await assert.rejects(call('DELETE', `/api/documents/${doc.id}/pending`, null, viewer.token), /403/)
await call('DELETE', `/api/documents/${doc.id}/pending`, null, editor.token)
assert.equal((await call('GET', `/api/documents/${doc.id}`, null, root.token)).pending, null)
assert.equal((await fetch(`${BASE}/api/documents/${doc.id}/pending`, { headers: { Authorization: `Bearer ${root.token}` } })).status, 404)

// Viewers read but never write.
assert.equal((await dav('PUT', '/dav/Viewer.kalka', vw, { body: archive })).status, 403)
assert.equal((await dav('DELETE', '/dav/Brand%20kit.kalka', vw)).status, 403)
assert.equal((await dav('LOCK', '/dav/Brand%20kit.kalka', vw, { body: '<?xml version="1.0"?><d:lockinfo xmlns:d="DAV:"/>' })).status, 403)
assert.equal((await dav('MOVE', '/dav/Brand%20kit.kalka', vw, { headers: { Destination: `${BASE}/dav/X.kalka` } })).status, 403)

// What desktops write beside files is accepted and dropped; other kinds of file are refused.
assert.equal((await dav('PUT', '/dav/._Brand%20kit.kalka', ed, { body: archive })).status, 201)
assert.equal((await dav('PUT', '/dav/.DS_Store', ed, { body: archive })).status, 201)
assert.equal((await dav('PUT', '/dav/notes.txt', ed, { body: archive })).status, 403)
assert.equal((await dav('PUT', '/dav/folder/inside.kalka', ed, { body: archive })).status, 409)
assert.equal((await dav('MKCOL', '/dav/folder', ed)).status, 403)
const after = await (await dav('PROPFIND', '/dav/', ed, { headers: { Depth: '1' } })).text()
assert.ok(!after.includes('DS_Store') && !after.includes('._Brand'), 'sidecar files are not listed')

// Locks, as Finder and Office take them.
const lock = await dav('LOCK', '/dav/Brand%20kit.kalka', ed, {
  headers: { 'Content-Type': 'application/xml', Timeout: 'Second-600' },
  body: '<?xml version="1.0"?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>Finder</D:href></D:owner></D:lockinfo>'
})
assert.equal(lock.status, 200)
const token = lock.headers.get('Lock-Token')
assert.match(token, /^<opaquelocktoken:/)
const lockXml = await lock.text()
assert.match(lockXml, /<d:href>Finder<\/d:href>/)
const refresh = await dav('LOCK', '/dav/Brand%20kit.kalka', ed, { headers: { If: `(${token})` } })
assert.equal(refresh.headers.get('Lock-Token'), token, 'a refresh keeps the token')
assert.equal((await dav('LOCK', '/dav/New%20one.kalka', ed, { body: '<d:lockinfo xmlns:d="DAV:"/>' })).status, 201)
assert.equal((await dav('UNLOCK', '/dav/Brand%20kit.kalka', ed, { headers: { 'Lock-Token': token } })).status, 204)
assert.equal((await dav('PROPPATCH', '/dav/Brand%20kit.kalka', ed, { body: '<d:propertyupdate xmlns:d="DAV:"><d:set><d:prop><x:a xmlns:x="urn:x">1</x:a></d:prop></d:set></d:propertyupdate>' })).status, 207)

// Rename, copy, overwrite and delete.
assert.equal((await dav('MOVE', '/dav/Brand%20kit.kalka', ed, { headers: { Destination: `${BASE}/dav/Brand%20book.kalka` } })).status, 201)
assert.equal((await call('GET', `/api/documents/${doc.id}`, null, root.token)).name, 'Brand book')
assert.equal((await dav('COPY', '/dav/Brand%20book.kalka', ed, { headers: { Destination: `${BASE}/dav/Brand%20copy.kalka` } })).status, 201)
docs = await call('GET', '/api/documents', null, root.token)
const copied = docs.find((d) => d.name === 'Brand copy')
assert.ok(copied?.hasFile, 'a copy holds the archive')
assert.equal((await dav('MOVE', '/dav/Brand%20copy.kalka', ed, { headers: { Destination: `${BASE}/dav/Brand%20book.kalka`, Overwrite: 'F' } })).status, 412)
assert.equal((await dav('DELETE', '/dav/Brand%20copy.kalka', ed)).status, 204)
assert.equal((await fetch(`${BASE}/api/documents/${copied.id}`, { headers: { Authorization: `Bearer ${root.token}` } })).status, 404)

// Two documents with one name each keep a name of their own.
const first = await call('POST', '/api/documents', { name: 'Same' }, root.token)
const second = await call('POST', '/api/documents', { name: 'Same' }, root.token)
const same = hrefs(await (await dav('PROPFIND', '/dav/', ed, { headers: { Depth: '1' } })).text())
assert.ok(same.includes(`/dav/Same%20(${first.id.slice(0, 6)}).kalka`))
assert.ok(same.includes(`/dav/Same%20(${second.id.slice(0, 6)}).kalka`))
for (const d of [first, second, doc]) await call('DELETE', `/api/documents/${d.id}`, null, root.token)
for (const name of ['New%20one.kalka']) await dav('DELETE', `/dav/${name}`, ed)

// Revoked passwords and disabled accounts stop working at once.
await call('DELETE', `/api/me/app-passwords/${listed[0].id}`, null, editor.token)
assert.equal((await dav('PROPFIND', '/dav/', ed, { headers: { Depth: '0' } })).status, 401)
await call('PATCH', `/api/users/${viewer.user.id}`, { disabled: true }, root.token)
assert.equal((await dav('PROPFIND', '/dav/', vw, { headers: { Depth: '0' } })).status, 401)
await call('DELETE', `/api/users/${viewer.user.id}`, null, root.token)
await call('DELETE', `/api/users/${editor.user.id}`, null, root.token)
console.log('dav: all checks passed')
