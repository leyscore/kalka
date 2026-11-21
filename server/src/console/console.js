// The Kalka Server console: one page, routed by the address's hash, drawn with the console kit
// (window.K). Plain browser JavaScript, embedded by scripts/embed-console.mjs; it talks only to
// this server's own API.
;(() => {
  'use strict'
  const K = window.K
  const { el, icon, px, stat, meter, seats, portrait, toast, copy, menu, closePop, dropdown, dialog, closeDialog, confirmDialog, form, screen, shell, nav, when, colorOf } = K
  const TOKEN_KEY = 'kalka-server-token'

  let server = null
  let me = null
  let routing = false
  const { api, token, setToken } = K.client(TOKEN_KEY, () => { me = null; if (!routing) route() })
  const fileFilter = { tab: 'all', query: '' }

  const ROLES = {
    admin: { label: 'Administrator', desc: 'Also manages people, sign-in and the license', color: '#8b5cf6' },
    editor: { label: 'Editor', desc: 'Opens, edits and creates files', color: '#2f5bea' },
    viewer: { label: 'Viewer', desc: 'Follows the work live, for clients and reviewers', color: '#94a3b8' }
  }
  const roleOptions = () => ['admin', 'editor', 'viewer'].map((id) => ({ value: id, ...ROLES[id] }))
  const isAdmin = () => me && me.role === 'admin'
  const canEdit = () => me && me.role !== 'viewer'
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's')

  // ---------- Signed out ----------

  function signedIn(result) {
    setToken(result.token)
    me = result.user
    location.hash = '#/home'
    route()
  }

  const foot = () => [el('span', {}, 'Kalka Server ' + server.version), el('a', { href: 'https://kalka.design', target: '_blank', rel: 'noopener' }, 'Get Kalka for desktop')]

  function ssoButton() {
    if (!server.auth.sso) return null
    return el('button', { type: 'button', class: 'btn soft', style: { height: '42px' }, onclick: () => { location.href = server.auth.sso.startPath + '?return=' + encodeURIComponent(location.origin + '/') } },
      icon('login-01'), 'Continue with ' + server.auth.sso.label)
  }

  function viewSignIn() {
    const sso = ssoButton()
    const card = []
    if (sso) card.push(sso)
    if (server.auth.password) {
      if (sso) card.push(el('div', { class: 'or' }, 'or with your email'))
      card.push(form([{ name: 'email', label: 'Email', type: 'email', autocomplete: 'username', placeholder: 'you@company.com' }, { name: 'password', label: 'Password', type: 'password', autocomplete: 'current-password' }],
        el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Sign in'),
        async (values) => signedIn(await api('POST', '/api/auth/login', values))),
      el('div', { class: 'links' }, el('a', { href: '#/forgot' }, 'Forgot your password?')))
    }
    if (!card.length) card.push(el('p', { style: { margin: 0, color: 'var(--sub)' } }, 'No way to sign in is set up yet. Ask the person who runs this server.'))
    screen(server.name, 'Sign in to design together on your team’s Kalka server.', card, foot())
  }

  function viewForgot() {
    const card = server.email
      ? [form([{ name: 'email', label: 'Email', type: 'email', autocomplete: 'username', placeholder: 'you@company.com' }],
        el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Send me a link'),
        async (values) => {
          await api('POST', '/api/auth/forgot', values)
          screen('Check your email', 'If an account uses this address, a link is on its way. It works for an hour.', el('a', { href: '#/', class: 'btn soft' }, 'Back to sign in'), foot())
        }), el('div', { class: 'links' }, el('a', { href: '#/' }, 'Back to sign in'))]
      : [el('p', { style: { margin: 0, color: 'var(--sub)' } }, 'Email is not set up on this server. Ask an administrator for a reset link.'),
        el('a', { href: '#/', class: 'btn soft' }, 'Back to sign in')]
    screen('Forgot your password?', server.email ? 'We email you a link to choose a new one.' : null, card, foot())
  }

  function viewReset(code) {
    screen('Choose a new password', null, form([{ name: 'password', label: 'New password', type: 'password', autocomplete: 'new-password', hint: '10 characters or more.' }],
      el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Save password'),
      async (values) => { const result = await api('POST', '/api/auth/reset', { code, password: values.password }); history.replaceState(null, '', '/'); signedIn(result) }), foot())
  }

  function viewInvite(code) {
    const sso = ssoButton()
    const card = []
    if (sso) card.push(sso)
    if (server.auth.password) {
      if (sso) card.push(el('div', { class: 'or' }, 'or create a password'))
      card.push(form([
        { name: 'name', label: 'Your name', autocomplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', autocomplete: 'username', placeholder: 'you@company.com' },
        { name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', hint: '10 characters or more.' }
      ], el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Create my account'),
      async (values) => { const result = await api('POST', '/api/auth/register', { ...values, invite: code }); history.replaceState(null, '', '/'); signedIn(result) }))
    }
    screen('Join ' + server.name, 'You were invited to design together on this Kalka server.', card, foot())
  }

  function viewSetup() {
    const state = { step: 0, code: '', account: null }
    const TITLES = ['Setup code', 'Your account', 'Name the server']
    function head() {
      return el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        el('b', { style: { fontSize: '15px' } }, TITLES[state.step]),
        el('span', { class: 'label', style: { marginLeft: 'auto' } }, 'Step ' + (state.step + 1) + ' of 3'))
    }
    function buttons(label) {
      return el('div', { style: { display: 'flex', gap: '8px' } },
        el('button', { type: 'button', class: 'btn ghost', style: { height: '42px' }, onclick: () => { state.step--; render() } }, icon('arrow-left-01'), 'Back'),
        el('button', { type: 'submit', class: 'btn', style: { height: '42px', flex: '1' } }, label))
    }
    function render() {
      let body
      if (state.step === 0) {
        body = form([{ name: 'code', label: 'The KALKA_SETUP_CODE you chose when deploying', type: 'password', value: state.code, autocomplete: 'off' }],
          el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Continue'),
          async (values) => { if (!values.code.trim()) throw new Error('Type the setup code.'); state.code = values.code; state.step = 1; render() })
      } else if (state.step === 1) {
        const account = state.account || {}
        body = form([
          { name: 'name', label: 'Your name', autocomplete: 'name', value: account.name },
          { name: 'email', label: 'Email', type: 'email', autocomplete: 'username', value: account.email, placeholder: 'you@company.com' },
          { name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', hint: '10 characters or more.' }
        ], buttons('Continue'), async (values) => {
          if (values.password.length < 10) throw new Error('Use a password of at least 10 characters.')
          state.account = values; state.step = 2; render()
        })
      } else {
        body = form([{ name: 'serverName', label: 'The name your team sees in Kalka', value: server.name === 'Kalka' ? '' : server.name, placeholder: 'Acme Design' }],
          buttons('Create the server'), async (values) => {
            const result = await api('POST', '/api/setup', { ...state.account, code: state.code, serverName: values.serverName || undefined })
            server = await api('GET', '/api/server')
            signedIn(result)
            setTimeout(openConnect, 300)
          })
      }
      screen('Your Kalka server is up', 'Create the first account. You become its administrator.', [head(), body], foot())
    }
    render()
  }

  // ---------- Frame ----------

  function accountMenu(event) {
    menu(event.currentTarget, [
      el('div', { class: 'head' }, el('span', {}, me.name), el('span', {}, me.email)),
      el('button', { type: 'button', role: 'menuitem', onclick: () => { closePop(); openAccount() } }, icon('user'), 'Your account'),
      el('button', { type: 'button', role: 'menuitem', onclick: () => { closePop(); openConnect() } }, icon('plug-01'), 'Connect Kalka'),
      el('a', { href: 'https://kalka.design', target: '_blank', rel: 'noopener', role: 'menuitem' }, icon('link-01'), 'kalka.design'),
      el('hr'),
      el('button', { type: 'button', role: 'menuitem', class: 'danger', onclick: signOut }, icon('logout-01'), 'Sign out')
    ])
  }

  async function signOut() {
    closePop()
    await api('POST', '/api/auth/logout').catch(() => {})
    setToken(null); me = null; location.hash = '#/'; route()
  }

  function frame(active, eyebrow, title, actions, body, counts) {
    const items = [{ id: 'home', label: 'Home', icon: 'home-01', href: '#/home' }, { id: 'files', label: 'Files', icon: 'folder-01', href: '#/files', count: counts && counts.files }]
    if (isAdmin()) items.push({ id: 'people', label: 'People', icon: 'user-group', href: '#/people', count: counts && counts.people }, { id: 'server', label: 'Server', icon: 'server-stack-01', href: '#/server' })
    const side = [
      el('a', { class: 'brand', href: '#/home', style: { textDecoration: 'none' } }, K.mark(32),
        el('span', { class: 'name' }, el('b', {}, server.name), el('span', {}, 'Kalka Server ' + server.version))),
      nav(items, active),
      el('div', { class: 'side-card' }, el('b', {}, 'Connect Kalka'), el('p', {}, 'Open this server’s files in the app and edit them together.'),
        el('button', { type: 'button', class: 'btn white small', style: { alignSelf: 'flex-start' }, onclick: () => copy(location.origin, 'Address copied: paste it in Kalka, Settings, Server') }, icon('copy-01', 14), 'Copy the address')),
      el('div', { class: 'side-foot' },
        el('button', { type: 'button', class: 'icon-btn', style: { width: '36px', height: '36px', padding: 0 }, 'aria-label': 'Account', 'aria-haspopup': 'menu', onclick: accountMenu }, portrait(me.email, 34, 'Your portrait')),
        el('span', { class: 'who' }, el('span', { style: { fontWeight: '500' } }, me.name), el('span', {}, ROLES[me.role].label)),
        K.themeToggle())
    ]
    document.title = server.name
    shell({ side, eyebrow, title, actions, body })
  }

  // ---------- Files ----------

  async function fileBytes(doc) {
    const response = await fetch('/api/documents/' + doc.id + '/file', { headers: { Authorization: 'Bearer ' + token() } })
    return response.ok ? new Uint8Array(await response.arrayBuffer()) : null
  }
  function save(blob, filename) {
    const url = URL.createObjectURL(blob)
    el('a', { href: url, download: filename }).click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  function fileName(doc) { return (doc.name.replace(/[\\/:*?"<>|]+/g, '-') || 'Untitled') + '-' + doc.id.slice(0, 6) + '.kalka' }
  async function download(doc) {
    const data = doc.hasFile ? await fileBytes(doc) : null
    if (data) save(new Blob([data]), fileName(doc))
    else toast('Open it in Kalka once: no file has been saved yet.')
  }

  // A stored (uncompressed) zip, built here so the server never spends CPU on it.
  const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  function crc32(data) { let c = 0xffffffff; for (const b of data) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  function zip(entries) {
    const enc = new TextEncoder(), parts = [], central = []
    let offset = 0
    for (const { name, data } of entries) {
      const nameBytes = enc.encode(name), crc = crc32(data)
      const local = new DataView(new ArrayBuffer(30))
      local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true)
      local.setUint32(14, crc, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true); local.setUint16(26, nameBytes.length, true)
      parts.push(new Uint8Array(local.buffer), nameBytes, data)
      const entry = new DataView(new ArrayBuffer(46))
      entry.setUint32(0, 0x02014b50, true); entry.setUint16(4, 20, true); entry.setUint16(6, 20, true); entry.setUint16(8, 0x0800, true)
      entry.setUint32(16, crc, true); entry.setUint32(20, data.length, true); entry.setUint32(24, data.length, true); entry.setUint16(28, nameBytes.length, true); entry.setUint32(42, offset, true)
      central.push(new Uint8Array(entry.buffer), nameBytes)
      offset += 30 + nameBytes.length + data.length
    }
    const size = central.reduce((sum, part) => sum + part.length, 0)
    const end = new DataView(new ArrayBuffer(22))
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true)
    end.setUint32(12, size, true); end.setUint32(16, offset, true)
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)])
  }
  async function exportAll(docs) {
    toast('Preparing the export…')
    const entries = []
    for (const doc of docs) { if (!doc.hasFile) continue; const data = await fileBytes(doc); if (data) entries.push({ name: fileName(doc), data }) }
    if (!entries.length) { toast('No file has been saved on the server yet.'); return }
    save(zip(entries), 'kalka-export-' + new Date().toISOString().slice(0, 10) + '.zip')
  }

  function fileCard(doc) {
    return el('button', { type: 'button', class: 'file', onclick: (event) => fileMenu(event.currentTarget, doc) },
      el('span', { class: 'thumb', style: { '--c': colorOf(doc.id) } }),
      el('span', { class: 'meta' },
        el('span', { class: 'grow' }, el('span', {}, doc.name), el('span', {}, 'Edited ' + when(doc.updatedAt).toLowerCase())),
        doc.pending ? el('span', { class: 'pill warn', title: 'A version uploaded by ' + doc.pending.by + ' ' + when(doc.pending.at).toLowerCase() + ' waits for Kalka to apply it.' }, 'NEW VERSION') : null,
        doc.live ? el('span', { class: 'pill ok', title: doc.live + ' open now' }, el('span', { class: 'live' }), String(doc.live)) : null))
  }

  function fileMenu(anchor, doc) {
    const items = [
      el('div', { class: 'head' }, el('span', {}, doc.name), el('span', {}, doc.live ? doc.live + ' open now' : 'Edited ' + when(doc.updatedAt).toLowerCase())),
      el('button', { type: 'button', role: 'menuitem', onclick: () => { closePop(); openConnect() } }, icon('plug-01'), 'Open in Kalka'),
      el('button', { type: 'button', role: 'menuitem', onclick: () => { closePop(); download(doc) } }, icon('download-01'), 'Download .kalka')
    ]
    if (canEdit()) {
      items.push(el('button', { type: 'button', role: 'menuitem', onclick: () => { closePop(); renameFile(doc) } }, icon('edit-02'), 'Rename'),
        el('hr'),
        el('button', { type: 'button', role: 'menuitem', class: 'danger', onclick: async () => {
          closePop()
          if (!(await confirmDialog('Delete ' + doc.name + '?', 'Everyone loses it, in the app too. This cannot be undone.', 'Delete', true))) return
          try { await api('DELETE', '/api/documents/' + doc.id); toast('Deleted'); route() } catch (e) { toast(e.message) }
        } }, icon('delete-02'), 'Delete'))
    }
    menu(anchor, items)
  }

  function renameFile(doc) {
    const input = el('input', { class: 'field', value: doc.name, 'aria-label': 'Name' })
    const error = el('p', { class: 'error', role: 'alert' })
    const submit = async () => {
      try { await api('PATCH', '/api/documents/' + doc.id, { name: input.value }); closeDialog(); toast('Renamed'); route() } catch (e) { error.textContent = e.message }
    }
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') submit() })
    dialog('Rename', null, [input, error], [
      el('button', { type: 'button', class: 'btn ghost', onclick: closeDialog }, 'Cancel'),
      el('button', { type: 'button', class: 'btn', onclick: submit }, 'Save')])
    input.select()
  }

  function emptyFiles() {
    return el('div', { class: 'empty' }, el('h2', {}, 'No files yet'),
      el('p', {}, 'Connect Kalka to this server, then open Share and choose Save on ' + server.name + '.'),
      el('button', { type: 'button', class: 'btn', onclick: openConnect }, icon('plug-01'), 'Connect Kalka'))
  }

  async function viewFiles() {
    const docs = await api('GET', '/api/documents')
    const week = Date.now() - 7 * 86400e3
    const grid = el('div', { class: 'files' })
    const empty = el('div')
    function fill() {
      const q = fileFilter.query.toLocaleLowerCase()
      const shown = docs.filter((doc) => (fileFilter.tab === 'all' || (fileFilter.tab === 'live' ? doc.live > 0 : doc.updatedAt >= week)) && doc.name.toLocaleLowerCase().includes(q))
      grid.replaceChildren(...shown.map(fileCard))
      empty.replaceChildren(!docs.length ? emptyFiles() : !shown.length ? el('p', { class: 'sub', style: { margin: 0, padding: '0 10px 10px', color: 'var(--sub)' } }, fileFilter.tab === 'live' ? 'Nobody is editing a file right now.' : 'No file matches.') : '')
    }
    const tabs = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Show' }, [['all', 'All'], ['live', 'Open now'], ['week', 'This week']].map(([id, label]) =>
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(fileFilter.tab === id), onclick: (event) => {
        fileFilter.tab = id
        for (const b of tabs.children) b.setAttribute('aria-checked', String(b === event.currentTarget))
        fill()
      } }, label)))
    const search = el('input', { 'aria-label': 'Search files', placeholder: 'Search files', value: fileFilter.query, oninput: (event) => { fileFilter.query = event.target.value; fill() } })
    const saved = docs.filter((doc) => doc.hasFile).length
    frame('files', plural(docs.length, 'file'), 'Files', [
      saved ? el('button', { type: 'button', class: 'btn sky', onclick: () => exportAll(docs) }, icon('download-01'), 'Export all') : null,
      el('button', { type: 'button', class: 'btn white', onclick: openConnect }, icon('plug-01'), 'Open in Kalka')
    ], [
      el('section', { class: 'glass', style: { padding: '14px' } },
        el('div', { class: 'list-head', style: { padding: '2px 6px 12px' } }, tabs, el('label', { class: 'search', style: { marginLeft: 'auto' } }, icon('search-01', 14), search)),
        grid, empty)
    ], { files: docs.length })
    fill()
    search.focus()
  }

  // ---------- Home ----------

  function greeting() {
    const hour = new Date().getHours()
    return hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  }

  function daysLeft(date) {
    return Math.max(0, Math.ceil((new Date(date + 'T23:59:59Z').getTime() - Date.now()) / 86400e3))
  }

  async function viewHome() {
    const [docs, users] = await Promise.all([api('GET', '/api/documents'), isAdmin() ? api('GET', '/api/users') : Promise.resolve(null)])
    const open = docs.reduce((sum, doc) => sum + (doc.live || 0), 0)
    const week = Date.now() - 7 * 86400e3
    const recent = docs.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6)
    const license = server.license
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const active = users ? users.filter((user) => !user.disabled) : null
    const cards = [
      stat({ label: 'Files', value: docs.length, sub: docs.filter((doc) => doc.updatedAt >= week).length + ' changed this week', tip: 'Shared documents saved on this server. Each opens in Kalka for everyone to edit together.' }),
      stat({ label: 'Open now', value: open, sub: open ? 'Kalka windows on these files' : 'Nobody is editing', tip: 'Kalka windows connected to this server right now, agents included.' })
    ]
    if (active) cards.push(stat({ label: 'People', value: active.length, sub: active.filter((user) => user.role !== 'viewer').length + ' can edit', tip: 'Accounts that can sign in. Viewers follow the work without editing.' }))
    if (license && license.valid) {
      cards.push(el('div', { class: 'glass stat' }, el('div', { class: 'top' }, el('span', { class: 'label' }, 'Seats'), K.tip('Editors and administrators who signed in with single sign-on in the last 90 days. Viewers are free.', 'About seats')),
        el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '12px' } }, px(license.usedSeats, 60), el('span', { class: 'sub mono', style: { paddingBottom: '6px' } }, 'of ' + license.seats)),
        seats(license.usedSeats, license.seats)))
      if (license.expiresAt) cards.push(stat({ label: 'License', value: daysLeft(license.expiresAt), sub: 'days left, until ' + new Date(license.expiresAt + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), tip: license.customer ? 'Licensed to ' + license.customer + '.' : 'The free Community key renews by itself every year.' }))
    }
    const methods = [server.auth.password ? 'PASSWORD' : null, server.auth.sso ? server.auth.sso.label.toUpperCase() : null].filter(Boolean)
    frame('home', today, greeting() + ', ' + me.name.split(/\s+/)[0],
      el('a', { href: '#/files', class: 'search sky', style: { textDecoration: 'none' } }, icon('search-01', 14), el('span', {}, 'Search files')), [
        el('section', { class: 'stats' }, cards),
        el('section', { class: 'cols' },
          el('div', { class: 'glass wide', style: { padding: '14px' } },
            el('div', { class: 'list-head', style: { padding: '2px 6px 10px' } }, el('h2', {}, 'Recent files'), docs.length > 6 ? el('a', { href: '#/files', style: { marginLeft: 'auto', color: 'var(--sub)', fontSize: '12px' } }, 'All ' + docs.length + ' files') : null),
            recent.length ? el('div', { class: 'files' }, recent.map(fileCard)) : emptyFiles()),
          el('div', { class: 'glass narrow', style: { padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' } },
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, el('span', { class: 'label' }, 'This server'), isAdmin() ? el('a', { href: '#/server', style: { marginLeft: 'auto', color: 'var(--sub)', fontSize: '12px' } }, 'Manage') : null),
            px(license && license.valid ? (license.customer ? 'Business' : 'Community') : 'Free', license && license.valid ? 40 : 56),
            el('span', { class: 'sub', style: { color: 'var(--sub)' } }, license && license.valid ? (license.customer ? 'Licensed to ' + license.customer : 'Single sign-on for up to ' + license.seats + ' people') : 'Open source, no license needed'),
            el('div', { class: 'copyline' }, el('code', {}, location.origin), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(location.origin, 'Address copied') }, 'Copy')),
            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } }, methods.map((m) => el('span', { class: 'pill' }, m)), server.email ? el('span', { class: 'pill ok dot' }, 'EMAIL') : null),
            active ? [el('span', { class: 'label', style: { marginTop: '6px' } }, 'People'),
              el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } }, active.slice(0, 14).map((user) => el('span', { title: user.name }, portrait(user.email, 30, user.name)))),
              el('a', { href: '#/people', class: 'btn soft', style: { alignSelf: 'flex-start' } }, icon('user-add-01'), 'Invite people')] : null))
      ], { files: docs.length, people: active ? active.length : null })
  }

  // ---------- People ----------

  function roleBadge(role) {
    return el('span', { class: 'dd' }, el('span', { class: 'dd-btn', style: { cursor: 'default' } }, el('span', { class: 'swatch', style: { '--c': ROLES[role].color } }), ROLES[role].label))
  }

  function linkDialog(title, lead, url, done) {
    dialog(title, lead,
      el('div', { class: 'copyline' }, el('code', {}, url), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(url, 'Link copied') }, icon('copy-01', 14), 'Copy')),
      el('button', { type: 'button', class: 'btn', onclick: () => { closeDialog(); if (done) done() } }, 'Done'))
  }

  function userMenu(anchor, user, ssoLabel) {
    const items = [el('div', { class: 'head' }, el('span', {}, user.name), el('span', {}, user.source === 'sso' ? 'Signs in with ' + ssoLabel : 'Signs in with a password'))]
    if (user.source === 'local') items.push(el('button', { type: 'button', role: 'menuitem', onclick: async () => {
      closePop()
      try {
        const reset = await api('POST', '/api/users/' + user.id + '/reset')
        linkDialog('Password reset link', reset.emailed ? 'Sent to ' + user.email + '. You can also send it yourself; it works once, for an hour.' : 'Send this link to ' + user.name + '. It works once, for an hour.', reset.url)
      } catch (e) { toast(e.message) }
    } }, icon('key-01'), 'Reset password'))
    items.push(el('button', { type: 'button', role: 'menuitem', onclick: async () => {
      closePop()
      try { await api('PATCH', '/api/users/' + user.id, { disabled: !user.disabled }); toast(user.disabled ? user.name + ' can sign in again' : user.name + ' is disabled'); route() } catch (e) { toast(e.message) }
    } }, icon(user.disabled ? 'checkmark-circle-02' : 'cancel-circle'), user.disabled ? 'Enable' : 'Disable'),
    el('hr'),
    el('button', { type: 'button', role: 'menuitem', class: 'danger', onclick: async () => {
      closePop()
      if (!(await confirmDialog('Delete ' + user.name + '’s account?', 'Their files stay. This cannot be undone.', 'Delete account', true))) return
      try { await api('DELETE', '/api/users/' + user.id); toast('Account deleted'); route() } catch (e) { toast(e.message) }
    } }, icon('delete-02'), 'Delete account'))
    menu(anchor, items)
  }

  async function viewPeople() {
    const [users, invites, settings] = await Promise.all([api('GET', '/api/users'), api('GET', '/api/invites'), api('GET', '/api/settings')])
    const license = settings.license
    const ssoLabel = settings.values.KALKA_OIDC_LABEL || 'single sign-on'
    const active = users.filter((user) => !user.disabled)
    const editors = active.filter((user) => user.role !== 'viewer').length
    const rows = users.map((user) => {
      const self = user.id === me.id
      return el('div', { class: 'row', style: { opacity: user.disabled ? 0.55 : 1 } },
        portrait(user.email, 36, user.name),
        el('span', { class: 'grow' }, el('span', {}, user.name + (self ? ' (you)' : '')), el('span', {}, user.email)),
        user.disabled ? el('span', { class: 'pill warn dot' }, 'DISABLED') : null,
        user.provisioned ? el('span', { class: 'pill', title: 'Managed by your identity provider through SCIM' }, 'SCIM') : null,
        el('span', { class: 'cell', style: { width: '120px' } }, user.source === 'sso' ? ssoLabel : 'Password'),
        el('span', { class: 'cell', style: { width: '90px' } }, when(user.lastSeenAt)),
        self ? roleBadge(user.role) : dropdown({ value: user.role, label: 'Role of ' + user.name, options: roleOptions(), onChange: async (role) => {
          await api('PATCH', '/api/users/' + user.id, { role })
          toast(user.name + ' is now ' + ROLES[role].label.toLowerCase())
        } }),
        self ? el('span', { style: { width: '32px' } }) : el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'More for ' + user.name, 'aria-haspopup': 'menu', onclick: (event) => userMenu(event.currentTarget, user, ssoLabel) }, icon('more-horizontal')))
    })
    const inviteRows = invites.map((invite) => el('div', { class: 'row' },
      el('span', { class: 'mark', style: { width: '36px', height: '36px', background: 'var(--chip)', color: 'var(--faint)' } }, icon(invite.email ? 'mail-send-01' : 'link-01', 18)),
      el('span', { class: 'grow' }, el('span', {}, invite.email || 'Invitation link'), el('span', {}, 'Invited as ' + ROLES[invite.role].label.toLowerCase() + ', until ' + when(invite.expiresAt))),
      el('button', { type: 'button', class: 'btn danger small', onclick: async () => {
        try { await api('DELETE', '/api/invites/' + invite.id); toast('Invitation revoked'); route() } catch (e) { toast(e.message) }
      } }, 'Revoke')))
    const cards = [
      stat({ label: 'Can edit', value: editors, sub: 'administrators and editors', tip: 'People who open, edit and create files.' }),
      stat({ label: 'Viewers', value: active.length - editors, sub: 'follow the work live', tip: 'Viewers open files and follow edits without changing them. They never take a seat.' }),
      stat({ label: 'Waiting', value: invites.length, sub: 'invitations sent', tip: 'Invitations not accepted yet. Each link works once, for 7 days.' })
    ]
    if (license && license.valid) {
      cards.unshift(el('div', { class: 'glass stat' }, el('div', { class: 'top' }, el('span', { class: 'label' }, 'Seats'), K.tip('Editors and administrators who signed in with single sign-on in the last 90 days. Viewers are free.', 'About seats')),
        el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '12px' } }, px(license.usedSeats, 60), el('span', { class: 'sub mono', style: { paddingBottom: '6px' } }, 'of ' + license.seats)),
        seats(license.usedSeats, license.seats)))
    }
    frame('people', plural(users.length, 'person').replace('persons', 'people'), 'People', el('button', { type: 'button', class: 'btn white', onclick: () => openInvite(settings) }, icon('user-add-01'), 'Invite people'), [
      el('section', { class: 'stats' }, cards),
      el('section', { class: 'glass list' }, el('div', { class: 'list-head' }, el('h2', {}, 'Members')), rows),
      el('section', { class: 'glass list' }, el('div', { class: 'list-head' }, el('h2', {}, 'Invitations')),
        inviteRows.length ? inviteRows : el('div', { class: 'row' }, el('span', { class: 'sub', style: { color: 'var(--sub)' } }, 'No invitation is waiting.')))
    ], { people: active.length })
  }

  function openInvite(settings) {
    let role = 'editor'
    const emails = el('textarea', { class: 'field', rows: 3, 'aria-label': 'Emails', disabled: !settings.emailReady, placeholder: settings.emailReady ? 'ana@company.com, ben@company.com' : 'Email is not set up: copy a link instead' })
    const error = el('p', { class: 'error', role: 'alert' })
    const parse = () => [...new Set(emails.value.split(/[\s,;]+/).map((part) => part.trim()).filter((part) => /^[^\s@]+@[^\s@]+$/.test(part)))]
    const send = el('button', { type: 'button', class: 'btn', disabled: true, onclick: async () => {
      error.textContent = ''
      const list = parse()
      send.disabled = true
      try {
        let mailed = 0
        for (const email of list) { const invite = await api('POST', '/api/invites', { role, email }); if (invite.emailed) mailed++ }
        closeDialog()
        toast(mailed === list.length ? (mailed > 1 ? mailed + ' invitations sent' : 'Invitation sent') : 'Some emails could not be sent: check Server, Email')
        route()
      } catch (e) { error.textContent = e.message; send.disabled = false }
    } }, icon('mail-send-01'), 'Send')
    emails.addEventListener('input', () => {
      const count = parse().length
      send.disabled = count === 0
      send.lastChild.textContent = count > 1 ? 'Send ' + count + ' invitations' : 'Send'
    })
    const link = el('button', { type: 'button', class: 'btn ghost', style: { marginRight: 'auto' }, onclick: async () => {
      try {
        const invite = await api('POST', '/api/invites', { role })
        linkDialog('Invitation link', 'Send it to one person. It works once, for 7 days, as ' + ROLES[role].label.toLowerCase() + '.', invite.url, route)
      } catch (e) { error.textContent = e.message }
    } }, icon('link-01'), 'Copy a link instead')
    dialog('Invite people', 'Each person gets an email with a link that works once, for 7 days.', [
      el('label', { class: 'stack' }, 'Emails', emails, el('span', { style: { color: 'var(--faint)', fontSize: '12px' } }, 'Separate them with commas or new lines.')),
      el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--sub)' } }, 'Role', dropdown({ value: role, wide: true, label: 'Role', options: roleOptions(), onChange: (value) => { role = value } })),
      error
    ], [link, el('button', { type: 'button', class: 'btn ghost', onclick: closeDialog }, 'Cancel'), send])
  }

  // ---------- Server settings ----------

  /** A section of settings saved together: each field writes its KALKA_* key into `draft`. */
  function section(title, intro, rows, draft, extra) {
    const error = el('p', { class: 'error', role: 'alert', style: { padding: '0 18px' } })
    const saveButton = el('button', { type: 'button', class: 'btn', onclick: async () => {
      error.textContent = ''
      const values = {}
      for (const [key, value] of Object.entries(draft)) values[key] = value === '' ? null : value
      if (!Object.keys(values).length) { toast('Nothing to save'); return }
      saveButton.disabled = true
      try { await api('PUT', '/api/settings', { values }); server = await api('GET', '/api/server'); toast('Saved'); route() } catch (e) { error.textContent = e.message; saveButton.disabled = false }
    } }, 'Save')
    return el('section', { class: 'glass list', id: 'section-' + title.toLowerCase().replace(/\s+/g, '-') },
      el('div', { class: 'list-head' }, el('h2', {}, title), extra || null, draft ? el('span', { style: { marginLeft: 'auto' } }, saveButton) : null),
      intro ? el('p', { style: { margin: 0, padding: '0 18px 12px', color: 'var(--sub)', maxWidth: '640px' } }, intro) : null,
      rows, error)
  }

  function settingsRow(name, value, note) {
    return el('div', { class: 'settings-row' }, el('span', { class: 'name' }, name), el('div', { class: 'value' }, value), note ? el('span', { class: 'note' }, note) : null)
  }

  const LOCKED_NOTE = 'Set by the server’s environment, so it cannot change here.'

  /** A text field bound to a setting; read-only when the environment sets it. */
  function textRow(settings, draft, key, label, opts) {
    const o = opts || {}
    const locked = settings.locked.includes(key)
    const input = el('input', {
      class: 'field', 'aria-label': label, type: o.secret ? 'password' : 'text', readonly: locked, disabled: locked,
      value: o.secret ? '' : settings.values[key] || '', autocomplete: 'off', spellcheck: 'false',
      placeholder: o.secret ? (settings.secretsSet.includes(key) ? (locked ? 'Set' : 'Saved: type to replace') : '') : o.placeholder || '',
      oninput: (event) => { draft[key] = event.target.value }
    })
    return settingsRow(label, [input, locked ? el('span', { class: 'pill', title: LOCKED_NOTE }, icon('lock-key', 12), 'ENV') : null], locked ? LOCKED_NOTE : o.note)
  }

  function switchRow(settings, draft, key, label, on, note) {
    const locked = settings.locked.includes(key)
    const button = el('button', { type: 'button', role: 'switch', class: 'switch', 'aria-checked': String(on), 'aria-label': label, disabled: locked, onclick: () => {
      const next = button.getAttribute('aria-checked') !== 'true'
      button.setAttribute('aria-checked', String(next))
      draft[key] = next ? 'true' : 'false'
    } })
    return settingsRow(label, [button, locked ? el('span', { class: 'pill', title: LOCKED_NOTE }, icon('lock-key', 12), 'ENV') : null], locked ? LOCKED_NOTE : note)
  }

  function dropdownRow(settings, draft, key, label, value, options, note, onChange) {
    const locked = settings.locked.includes(key)
    return settingsRow(label, [dropdown({ value, label, options, disabled: locked, onChange: (next) => { draft[key] = next; if (onChange) onChange(next) } }),
      locked ? el('span', { class: 'pill', title: LOCKED_NOTE }, icon('lock-key', 12), 'ENV') : null], locked ? LOCKED_NOTE : note)
  }

  function copyRow(label, text, note) {
    return settingsRow(label, el('div', { class: 'copyline', style: { flex: 1 } }, el('code', {}, text), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(text, label + ' copied') }, 'Copy')), note)
  }

  function generalSection(settings) {
    const draft = {}
    const passwords = (settings.values.KALKA_LOCAL_LOGIN || 'true') !== 'false'
    return section('General', null, [
      textRow(settings, draft, 'KALKA_SERVER_NAME', 'Name', { placeholder: 'Acme Design', note: 'What your team sees in Kalka and on this page.' }),
      copyRow('Address', settings.publicUrl, 'In Kalka, open Settings, then Server, and enter this address.'),
      textRow(settings, draft, 'KALKA_APP_ORIGINS', 'App origins', { placeholder: 'https://kalka.example.com', note: 'Other web addresses a sign-in may return to, separated by commas. The desktop app is always allowed.' }),
      switchRow(settings, draft, 'KALKA_LOCAL_LOGIN', 'Passwords', passwords, settings.ssoReady ? 'Turn off once everyone signs in with single sign-on. Administrators keep theirs as a way back in.' : 'People sign in with an email and a password.'),
      settingsRow('Version', el('span', { class: 'mono', style: { color: 'var(--sub)' } }, 'Kalka Server ' + server.version + ', protocol ' + server.protocol))
    ], draft)
  }

  function ssoSection(settings) {
    if (!settings.enterprise) {
      return section('Single sign-on', null, el('div', { class: 'empty', style: { padding: '0 18px 18px' } },
        el('p', {}, 'Single sign-on comes with a Kalka license key, free for up to 5 people. Add the key as the build variable KALKA_LICENSE_KEY, then redeploy the server: the build adds single sign-on.'),
        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
          el('a', { class: 'btn', href: 'https://kalka.design/pricing#kp-self', target: '_blank', rel: 'noopener' }, icon('key-01'), 'Get a key'),
          el('a', { class: 'btn soft', href: 'https://github.com/leyscore/kalka-server#single-sign-on', target: '_blank', rel: 'noopener' }, 'How to add it'))), null,
      el('span', { class: 'pill' }, 'NOT INSTALLED'))
    }
    const draft = {}
    const v = settings.values
    const label = v.KALKA_OIDC_LABEL || 'your identity provider'
    const status = settings.ssoReady
      ? el('span', { class: 'pill ok dot', title: settings.lastSsoSignIn ? 'Last sign-in ' + when(settings.lastSsoSignIn).toLowerCase() : null }, 'CONNECTED')
      : settings.license && !settings.license.valid
        ? el('span', { class: 'pill warn dot', title: settings.license.problem }, 'LICENSE PROBLEM')
        : el('span', { class: 'pill' }, 'NOT SET UP')
    const intro = settings.ssoReady
      ? 'Connected to ' + label + (settings.lastSsoSignIn ? ', last sign-in ' + when(settings.lastSsoSignIn).toLowerCase() : '') + '.'
      : settings.license && !settings.license.valid ? settings.license.problem : 'Connect an OpenID Connect provider such as Authentik, Keycloak, Okta or Google Workspace.'
    return section('Single sign-on', intro, [
      textRow(settings, draft, 'KALKA_OIDC_LABEL', 'Button label', { placeholder: 'Authentik' }),
      textRow(settings, draft, 'KALKA_OIDC_ISSUER', 'Issuer URL', { placeholder: 'https://auth.example.com/application/o/kalka/' }),
      textRow(settings, draft, 'KALKA_OIDC_CLIENT_ID', 'Client ID'),
      textRow(settings, draft, 'KALKA_OIDC_CLIENT_SECRET', 'Client secret', { secret: true }),
      copyRow('Redirect URI', settings.redirectUri, 'Register it with your provider.'),
      textRow(settings, draft, 'KALKA_OIDC_SCOPES', 'Scopes', { placeholder: 'openid email profile' }),
      textRow(settings, draft, 'KALKA_OIDC_GROUPS_CLAIM', 'Groups claim', { placeholder: 'groups' }),
      textRow(settings, draft, 'KALKA_OIDC_ALLOWED_GROUPS', 'Allowed groups', { placeholder: 'Anyone', note: 'Only these groups may sign in, separated by commas. Empty lets everyone in.' }),
      textRow(settings, draft, 'KALKA_OIDC_ADMIN_GROUPS', 'Administrators', { placeholder: 'kalka-admins', note: 'Group names, separated by commas. Checked at every sign-in.' }),
      textRow(settings, draft, 'KALKA_OIDC_EDITOR_GROUPS', 'Editors', { placeholder: 'design, marketing' }),
      textRow(settings, draft, 'KALKA_OIDC_VIEWER_GROUPS', 'Viewers', { placeholder: 'clients' }),
      dropdownRow(settings, draft, 'KALKA_OIDC_DEFAULT_ROLE', 'Everyone else', v.KALKA_OIDC_DEFAULT_ROLE || 'editor',
        [{ value: 'editor', label: 'Editor', color: ROLES.editor.color }, { value: 'viewer', label: 'Viewer', color: ROLES.viewer.color }, { value: 'none', label: 'Cannot sign in', color: '#b42318' }],
        'The role of people in none of the groups above.'),
      settings.ssoReady ? settingsRow('Test', el('button', { type: 'button', class: 'btn soft', onclick: () => window.open(server.auth.sso.startPath + '?return=' + encodeURIComponent(location.origin + '/'), '_blank') }, icon('login-01'), 'Test sign-in'), 'Opens a new tab and signs in there.') : null
    ], draft, status)
  }

  function emailSection(settings) {
    const draft = {}
    const v = settings.values
    const port = v.KALKA_SMTP_PORT || '587'
    const secure = v.KALKA_SMTP_SECURE || (port === '465' ? 'tls' : 'starttls')
    const portInput = textRow(settings, draft, 'KALKA_SMTP_PORT', 'Port', { placeholder: '587' })
    const result = el('span', { class: 'sub', style: { color: 'var(--sub)' } }, settings.emailReady ? 'Sends to ' + me.email + '.' : 'Save a mail server first.')
    const test = el('button', { type: 'button', class: 'btn soft', disabled: !settings.emailReady, onclick: async () => {
      test.disabled = true
      try { const sent = await api('POST', '/api/settings/email/test'); result.style.color = 'var(--ok)'; result.textContent = 'Delivered to ' + sent.to + '.' } catch (e) { result.style.color = 'var(--danger)'; result.textContent = e.message } finally { test.disabled = false }
    } }, icon('mail-send-01'), 'Send a test email')
    return section('Email', 'Invitations, password resets and seat warnings go out through your mail server. Without one, you copy links and send them yourself.', [
      textRow(settings, draft, 'KALKA_SMTP_HOST', 'Host', { placeholder: 'smtp.example.com' }),
      dropdownRow(settings, draft, 'KALKA_SMTP_SECURE', 'Security', secure,
        [{ value: 'starttls', label: 'STARTTLS', desc: 'Usually port 587' }, { value: 'tls', label: 'TLS', desc: 'Usually port 465' }, { value: 'none', label: 'None', desc: 'Only for a relay on the same network' }], null,
        (next) => {
          const input = portInput.querySelector('input')
          if (input.disabled) return
          const suggested = next === 'tls' ? '465' : next === 'starttls' ? '587' : input.value
          if (suggested !== input.value) { input.value = suggested; draft.KALKA_SMTP_PORT = suggested }
        }),
      portInput,
      textRow(settings, draft, 'KALKA_SMTP_USER', 'Username'),
      textRow(settings, draft, 'KALKA_SMTP_PASSWORD', 'Password', { secret: true }),
      textRow(settings, draft, 'KALKA_SMTP_FROM', 'Sender', { placeholder: 'Acme Design <kalka@example.com>' }),
      settingsRow('Test', [test, result])
    ], draft, settings.emailReady ? el('span', { class: 'pill ok dot' }, 'SET UP') : el('span', { class: 'pill' }, 'NOT SET UP'))
  }

  function licenseSection(settings) {
    const draft = {}
    const license = settings.license
    const rows = []
    if (license && license.valid) {
      rows.push(el('div', { class: 'settings-row', style: { alignItems: 'flex-start' } },
        el('div', { style: { flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '10px' } }, el('span', { class: 'label' }, 'Plan'), px(license.customer ? 'Business' : 'Community', 56),
          el('span', { style: { color: 'var(--sub)' } }, license.customer ? 'Licensed to ' + license.customer + ', ' + license.seats + ' editors.' : 'Free, up to ' + license.seats + ' people with single sign-on. Renews by itself every year.')),
        el('div', { style: { flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' } },
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, el('span', { style: { fontWeight: '500' } }, 'Seats'), K.tip('Editors and administrators who signed in with single sign-on in the last 90 days. Viewers are free.', 'About seats'), el('span', { class: 'mono', style: { marginLeft: 'auto', color: 'var(--sub)' } }, license.usedSeats + ' of ' + license.seats)),
          meter(license.usedSeats, license.seats, 0.8),
          license.problem ? el('span', { class: 'pill warn dot', style: { alignSelf: 'flex-start' } }, license.problem) : null)))
    } else {
      rows.push(settingsRow('Plan', el('span', { style: { color: 'var(--sub)' } }, license ? license.problem : 'No license. Everything works without one, except single sign-on. A free Community key covers 5 people.')))
    }
    if (license && license.expiresAt) rows.push(settingsRow('Valid until', el('span', {}, new Date(license.expiresAt + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), el('span', { style: { color: 'var(--faint)' } }, ', ' + plural(daysLeft(license.expiresAt), 'day') + ' left'))))
    rows.push(textRow(settings, draft, 'KALKA_LICENSE_KEY', 'Key', { secret: true, note: settings.enterprise ? 'The server checks the key itself and never calls Kalka.' : 'Single sign-on is added when the server is built with a key. On Cloudflare, add it as the build variable KALKA_LICENSE_KEY and redeploy.' }))
    if (!license || !license.customer) {
      rows.push(settingsRow('Business', [el('span', { style: { flex: '1 1 260px', color: 'var(--sub)' } }, '$8 per editor per month, billed yearly. No user limit and email support, with the audit log, SCIM and managed backups as they ship. Viewers are always free.'),
        el('a', { class: 'btn soft', href: 'https://kalka.design/pricing#kp-self', target: '_blank', rel: 'noopener' }, 'See plans')]))
    }
    const pill = license && license.valid ? el('span', { class: 'pill ok dot' }, license.customer ? 'BUSINESS' : 'COMMUNITY') : el('span', { class: 'pill' }, 'NO LICENSE')
    return section('License', null, rows, draft, pill)
  }

  /** The Server pages: settings, then what the Business license adds. */
  const SERVER_TABS = [['settings', 'Settings', '#/server'], ['audit', 'Audit log', '#/server/audit'], ['backups', 'Backups', '#/server/backups'], ['scim', 'Provisioning', '#/server/scim']]
  function serverTabs(active) {
    return el('div', { class: 'seg sky', role: 'tablist', 'aria-label': 'Server pages' }, SERVER_TABS.map(([id, label, href]) =>
      el('button', { type: 'button', role: 'tab', 'aria-checked': String(id === active), 'aria-selected': String(id === active), onclick: () => { location.hash = href } }, label)))
  }

  const hasFeature = (feature) => (server.features || []).includes(feature)

  /** What a page shows when the license does not include its Business feature. */
  function businessGate(title, text) {
    return el('section', { class: 'glass empty' }, el('span', { class: 'pill' }, 'BUSINESS'), el('h2', {}, title), el('p', {}, text),
      el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
        el('a', { class: 'btn', href: 'https://kalka.design/pricing#kp-self', target: '_blank', rel: 'noopener' }, icon('key-01'), 'See plans'),
        el('a', { class: 'btn soft', href: '#/server/license' }, 'Enter a license key')))
  }

  async function viewServer(focus) {
    const settings = await api('GET', '/api/settings')
    const jump = el('div', { class: 'seg', role: 'navigation', 'aria-label': 'Sections', style: { alignSelf: 'flex-start' } }, [['general', 'General'], ['single-sign-on', 'Single sign-on'], ['email', 'Email'], ['license', 'License']].map(([id, label]) =>
      el('button', { type: 'button', onclick: () => { const node = document.getElementById('section-' + id); if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }, label)))
    frame('server', 'Kalka Server ' + server.version, 'Server', serverTabs('settings'), [jump, generalSection(settings), ssoSection(settings), emailSection(settings), licenseSection(settings)])
    if (focus) { const node = document.getElementById('section-' + focus); if (node) node.scrollIntoView({ block: 'start' }) }
  }

  // ---------- Audit log ----------

  const AUDIT_VERBS = {
    'auth.login': ['signed in', 'login-01'],
    'auth.login_failed': ['could not sign in', 'alert-02'],
    'user.created': ['created an account', 'user-add-01'],
    'user.role_changed': ['changed the role of', 'user-group'],
    'user.disabled': ['disabled an account', 'cancel-circle'],
    'user.enabled': ['enabled an account', 'checkmark-circle-02'],
    'user.deleted': ['deleted an account', 'delete-02'],
    'user.password_reset': ['reset their password', 'key-01'],
    'user.password_changed': ['changed their password', 'key-01'],
    'user.reset_link': ['made a password reset link', 'key-01'],
    'invite.created': ['invited someone', 'mail-send-01'],
    'invite.revoked': ['revoked an invitation', 'cancel-01'],
    'document.created': ['created a file', 'file-01'],
    'document.renamed': ['renamed a file', 'edit-02'],
    'document.deleted': ['deleted a file', 'delete-02'],
    'document.exported': ['exported a file', 'download-01'],
    'document.uploaded': ['uploaded a new version', 'share-01'],
    'settings.changed': ['changed settings', 'settings-02'],
    'app_password.created': ['created an app password', 'key-01'],
    'app_password.revoked': ['revoked an app password', 'key-01'],
    'audit.exported': ['exported the audit log', 'download-01'],
    'backup.started': ['started a backup', 'database-01'],
    'backup.restored': ['restored a file from a backup', 'database-01'],
    'user.updated': ['updated an account', 'user'],
    'group.created': ['created a group', 'user-group'],
    'group.updated': ['changed a group', 'user-group'],
    'group.deleted': ['deleted a group', 'user-group'],
    'scim.token_created': ['made a provisioning token', 'key-01'],
    'scim.token_revoked': ['revoked the provisioning token', 'key-01']
  }
  const AUDIT_CATEGORIES = [
    { value: '', label: 'Everything' },
    { value: 'auth.', label: 'Sign-ins', desc: 'Sign-ins and failed attempts' },
    { value: 'user.', label: 'People', desc: 'Accounts, roles and passwords' },
    { value: 'invite.', label: 'Invitations' },
    { value: 'document.', label: 'Files', desc: 'Created, renamed, deleted, exported' },
    { value: 'settings.', label: 'Settings' },
    { value: 'app_password.', label: 'App passwords' },
    { value: 'backup.', label: 'Backups' },
    { value: 'group.', label: 'Groups', desc: 'Pushed by your identity provider' },
    { value: 'scim.', label: 'Provisioning' }
  ]
  const auditFilter = { action: '', q: '', from: '', to: '' }

  function auditSentence(event) {
    const verb = AUDIT_VERBS[event.action] ? AUDIT_VERBS[event.action][0] : event.action
    const d = event.detail || {}
    const who = event.actorName || event.actorEmail || (event.action === 'auth.login_failed' ? (d.email || 'Someone') : 'The server')
    let what = ''
    if (event.action === 'user.role_changed') what = (d.email || 'someone') + ' from ' + (ROLES[d.from] ? ROLES[d.from].label : d.from) + ' to ' + (ROLES[d.to] ? ROLES[d.to].label : d.to)
    else if (event.action === 'document.renamed') what = (d.from || '') + ' to ' + (d.to || '')
    else if (event.action === 'settings.changed') what = (d.keys || []).map((key) => key.replace(/^KALKA_/, '').toLowerCase().replace(/_/g, ' ')).join(', ')
    else if (event.action === 'auth.login_failed') what = d.reason ? '(' + d.reason.replace(/\.$/, '').toLowerCase() + ')' : ''
    else if (event.action === 'auth.login') what = d.method ? 'with ' + (d.method === 'sso' ? 'single sign-on' : d.method) : ''
    else what = d.name || d.email || ''
    return who + ' ' + verb + (what ? ' ' + what : '') + (d.via ? ', through ' + ({ webdav: 'WebDAV', scim: 'SCIM' }[d.via] || d.via) : '')
  }

  function auditQuery(extra) {
    const params = new URLSearchParams()
    if (auditFilter.action) params.set('action', auditFilter.action)
    if (auditFilter.q.trim()) params.set('q', auditFilter.q.trim())
    if (auditFilter.from) params.set('from', String(new Date(auditFilter.from + 'T00:00:00').getTime()))
    if (auditFilter.to) params.set('to', String(new Date(auditFilter.to + 'T23:59:59.999').getTime()))
    for (const [key, value] of Object.entries(extra || {})) params.set(key, String(value))
    return params.toString()
  }

  function auditRow(event) {
    const [, iconName] = AUDIT_VERBS[event.action] || ['', 'activity-01']
    const failedSignIn = event.action === 'auth.login_failed'
    const where = [event.ip, event.country].filter(Boolean).join(', ')
    return el('div', { class: 'row', title: event.userAgent || '' },
      el('span', { class: 'mark', style: { width: '32px', height: '32px', background: failedSignIn ? 'var(--danger-bg)' : 'var(--chip)', color: failedSignIn ? 'var(--danger)' : 'var(--faint)' } }, icon(iconName, 16)),
      el('span', { class: 'grow' }, el('span', {}, auditSentence(event)), el('span', {}, event.action + (where ? ', from ' + where : ''))),
      el('span', { class: 'cell', style: { width: '150px', textAlign: 'right' }, title: new Date(event.at).toLocaleString() }, new Date(event.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })))
  }

  async function exportAudit() {
    const response = await fetch('/api/ee/audit/export?' + auditQuery(), { headers: { Authorization: 'Bearer ' + token() } })
    if (!response.ok) { toast((await response.json().catch(() => ({}))).error || 'The export failed.'); return }
    save(await response.blob(), 'kalka-audit-' + new Date().toISOString().slice(0, 10) + '.csv')
  }

  async function viewAudit() {
    if (!hasFeature('audit')) {
      return frame('server', 'Kalka Server ' + server.version, 'Audit log', serverTabs('audit'),
        businessGate('See who did what, and when', 'The audit log records sign-ins and failed attempts, role changes, invitations, deletions, settings changes and exports, with who, when and from where. Filter it and export it as CSV. It comes with Kalka Business.'))
    }
    const [first, settings] = await Promise.all([api('GET', '/api/ee/audit?' + auditQuery({ limit: 50 })), api('GET', '/api/settings')])
    const list = el('div')
    const more = el('div')
    let next = first.next
    function append(events) {
      list.append(...events.map(auditRow))
      more.replaceChildren(next ? el('div', { class: 'row' }, el('button', { type: 'button', class: 'btn soft', onclick: async (event) => {
        event.currentTarget.disabled = true
        try { const page = await api('GET', '/api/ee/audit?' + auditQuery({ limit: 50, before: next })); next = page.next; append(page.events) } catch (e) { toast(e.message) }
      } }, 'Show older events')) : null)
    }
    if (!first.events.length) list.append(el('div', { class: 'row' }, el('span', { style: { color: 'var(--sub)' } }, 'No event matches.')))
    append(first.events)
    const reload = () => route()
    const search = el('input', { 'aria-label': 'Search the audit log', placeholder: 'Person, file, address', value: auditFilter.q, onkeydown: (event) => { if (event.key === 'Enter') { auditFilter.q = event.target.value; reload() } } })
    const date = (key, label) => el('input', { class: 'field', type: 'date', 'aria-label': label, value: auditFilter[key], style: { width: '150px', height: '36px' }, onchange: (event) => { auditFilter[key] = event.target.value; reload() } })
    const locked = settings.locked.includes('KALKA_AUDIT_RETENTION_DAYS')
    const retention = String(first.retentionDays)
    const retentionOptions = ['30', '90', '180', '365', '730', '1825'].concat(['30', '90', '180', '365', '730', '1825'].includes(retention) ? [] : [retention])
      .map((days) => ({ value: days, label: Number(days) % 365 === 0 ? plural(Number(days) / 365, 'year') : plural(Number(days), 'day') }))
    const filters = el('div', { class: 'list-head' },
      el('h2', {}, 'Events'),
      dropdown({ value: auditFilter.action, label: 'Kind of event', options: AUDIT_CATEGORIES, onChange: (value) => { auditFilter.action = value; reload() } }),
      el('label', { class: 'search' }, icon('search-01', 14), search),
      date('from', 'From'), el('span', { style: { color: 'var(--faint)' } }, 'to'), date('to', 'To'),
      auditFilter.action || auditFilter.q || auditFilter.from || auditFilter.to ? el('button', { type: 'button', class: 'btn ghost small', onclick: () => { Object.assign(auditFilter, { action: '', q: '', from: '', to: '' }); reload() } }, 'Clear') : null)
    frame('server', 'Kalka Server ' + server.version, 'Audit log', serverTabs('audit'), [
      el('section', { class: 'glass list' }, filters, list, more),
      el('section', { class: 'glass list' },
        el('div', { class: 'list-head' }, el('h2', {}, 'Keep and export'), el('span', { style: { marginLeft: 'auto' } }, el('button', { type: 'button', class: 'btn soft', onclick: exportAudit }, icon('download-01'), 'Export CSV'))),
        settingsRow('Keep events for', [dropdown({ value: retention, label: 'Keep events for', options: retentionOptions, disabled: locked, onChange: async (value) => {
          try { await api('PUT', '/api/settings', { values: { KALKA_AUDIT_RETENTION_DAYS: value } }); toast('Events are kept for ' + retentionOptions.find((o) => o.value === value).label) } catch (e) { toast(e.message) }
        } }), locked ? el('span', { class: 'pill', title: LOCKED_NOTE }, icon('lock-key', 12), 'ENV') : null], locked ? LOCKED_NOTE : 'Older events are deleted. The export holds the newest 10,000 events that match the filters.'))
    ])
  }

  // ---------- Dialogs ----------

  function openConnect() {
    dialog('Connect Kalka', 'Open ' + server.name + '’s files in the Kalka app and edit them together.', [
      el('ol', { class: 'steps' },
        el('li', {}, 'Open in Kalka fills in this server’s address in Settings, Server. Or open them yourself and paste the address below.'),
        el('li', {}, 'Sign in.'),
        el('li', {}, 'The server’s files appear on Home, in the Server tab. To share a file, open Share and choose Save on ' + server.name + '.')),
      el('div', { class: 'copyline' }, el('code', {}, location.origin), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(location.origin, 'Address copied') }, icon('copy-01', 14), 'Copy'))
    ], [el('a', { class: 'btn ghost', href: 'https://kalka.design', target: '_blank', rel: 'noopener', style: { marginRight: 'auto' } }, 'Get Kalka'),
      el('button', { type: 'button', class: 'btn ghost', onclick: closeDialog }, 'Done'),
      el('a', { class: 'btn', href: 'kalka://server?url=' + encodeURIComponent(location.origin), onclick: () => setTimeout(closeDialog, 300) }, icon('plug-01'), 'Open in Kalka')])
  }

  function openAccount() {
    const error = el('p', { class: 'error', role: 'alert' })
    const name = el('input', { class: 'field', value: me.name, 'aria-label': 'Name', autocomplete: 'name' })
    const body = [
      el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, portrait(me.email, 48, 'Your portrait'),
        el('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 0 } }, el('span', { style: { fontWeight: '500' } }, me.email),
          el('span', { style: { color: 'var(--faint)', fontSize: '12px' } }, ROLES[me.role].label + (me.source === 'sso' ? ', signs in with single sign-on' : ', signs in with a password')))),
      el('label', { class: 'stack' }, 'Name', name)
    ]
    let current = null, next = null
    if (me.source === 'local') {
      current = el('input', { class: 'field', type: 'password', autocomplete: 'current-password', 'aria-label': 'Current password' })
      next = el('input', { class: 'field', type: 'password', autocomplete: 'new-password', 'aria-label': 'New password' })
      body.push(el('label', { class: 'stack' }, 'Current password', current), el('label', { class: 'stack' }, 'New password', next),
        el('p', { style: { margin: 0, color: 'var(--faint)', fontSize: '12px' } }, '10 characters or more. Leave both empty to keep your password. Changing it signs out your other devices.'))
    }
    body.push(appPasswords(), error)
    const saveButton = el('button', { type: 'button', class: 'btn', onclick: async () => {
      error.textContent = ''
      saveButton.disabled = true
      try {
        if (name.value.trim() !== me.name) me = await api('PATCH', '/api/me', { name: name.value })
        if (current && (current.value || next.value)) setToken((await api('POST', '/api/me/password', { current: current.value, password: next.value })).token)
        closeDialog(); toast('Saved'); route()
      } catch (e) { error.textContent = e.message; saveButton.disabled = false }
    } }, 'Save')
    dialog('Your account', null, body, [el('button', { type: 'button', class: 'btn ghost', onclick: closeDialog }, 'Cancel'), saveButton])
  }

  /** App passwords: how Finder, Windows, Nextcloud and rclone sign in to the WebDAV folder. */
  function appPasswords() {
    const address = location.origin + '/dav/'
    const list = el('div', { class: 'app-passwords', style: { display: 'flex', flexDirection: 'column', gap: '6px' } })
    const note = el('p', { style: { margin: 0, color: 'var(--faint)', fontSize: '12px' } })
    const name = el('input', { class: 'field', 'aria-label': 'App password name', placeholder: 'Finder on my laptop', maxlength: 80, style: { flex: 1 } })
    async function load() {
      try {
        const items = await api('GET', '/api/me/app-passwords')
        list.replaceChildren(...items.map((item) => el('div', { class: 'copyline' },
          el('span', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } }, el('span', {}, item.name),
            el('span', { style: { color: 'var(--faint)', fontSize: '12px' } }, item.lastUsedAt ? 'Used ' + when(item.lastUsedAt).toLowerCase() : 'Never used')),
          el('button', { type: 'button', class: 'btn danger small', onclick: async () => {
            try { await api('DELETE', '/api/me/app-passwords/' + item.id); toast('App password revoked'); load() } catch (e) { toast(e.message) }
          } }, 'Revoke'))))
      } catch (e) { note.textContent = e.message }
    }
    const create = el('button', { type: 'button', class: 'btn soft', onclick: async () => {
      note.textContent = ''
      try {
        const made = await api('POST', '/api/me/app-passwords', { name: name.value })
        name.value = ''
        note.replaceChildren('Copy it now: it is shown once. Sign in with ', el('b', {}, me.email), ' and this password.',
          el('div', { class: 'copyline', style: { marginTop: '6px' } }, el('code', {}, made.password), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(made.password, 'App password copied') }, icon('copy-01', 14), 'Copy')))
        load()
      } catch (e) { note.textContent = e.message }
    } }, icon('key-01', 14), 'Create')
    name.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); create.click() } })
    load()
    return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '12px' } },
      el('b', { style: { fontWeight: '500' } }, 'Files folder (WebDAV)'),
      el('p', { style: { margin: 0, color: 'var(--sub)', fontSize: '13px' } }, 'Mount the server’s files as a folder of .kalka files in Finder, Windows, Nextcloud or rclone. ' + (canEdit() ? 'Files you save there reach Kalka as a version to apply.' : 'As a viewer, the folder is read-only.')),
      el('div', { class: 'copyline' }, el('code', {}, address), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(address, 'Folder address copied') }, icon('copy-01', 14), 'Copy')),
      el('span', { style: { color: 'var(--sub)', fontSize: '13px' } }, 'App passwords'),
      list, el('div', { style: { display: 'flex', gap: '8px' } }, name, create), note)
  }

  // ---------- Backups ----------

  const RUN_STATUS = { running: ['pill ok dot', 'RUNNING'], done: ['pill ok', 'DONE'], failed: ['pill warn dot', 'FAILED'] }
  const longDate = (ms) => new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const hourLabel = (hour) => String(hour).padStart(2, '0') + ':00 UTC'

  function runRow(run) {
    const [pillClass, pillLabel] = RUN_STATUS[run.status] || ['pill', run.status.toUpperCase()]
    const sub = run.status === 'running'
      ? (run.phase === 'documents' ? run.remaining + ' files to copy' : 'Copying ' + (run.phase === 'directory' ? 'accounts and settings' : run.phase === 'manifest' ? 'the list of files' : 'done, deleting old backups'))
      : run.status === 'failed' ? run.error || 'Failed' : (run.trigger === 'manual' ? 'Started by ' + (run.startedBy || 'an administrator') : 'Daily backup') + (run.finishedAt ? ', took ' + Math.max(1, Math.round((run.finishedAt - run.startedAt) / 1000)) + ' s' : '')
    return el('div', { class: 'row click', role: 'button', tabindex: '0', onclick: () => openRun(run.id), onkeydown: (event) => { if (event.key === 'Enter') openRun(run.id) } },
      el('span', { class: 'mark', style: { width: '32px', height: '32px', background: 'var(--chip)', color: 'var(--faint)' } }, icon('database-01', 16)),
      el('span', { class: 'grow' }, el('span', {}, longDate(run.startedAt)), el('span', {}, sub)),
      el('span', { class: 'cell', style: { width: '80px' } }, plural(run.documents, 'file')),
      el('span', { class: 'cell mono', style: { width: '80px' } }, K.bytes(run.bytes)),
      el('span', { class: pillClass }, pillLabel))
  }

  async function openRun(id) {
    let run
    try { run = await api('GET', '/api/ee/backups/' + id) } catch (e) { toast(e.message); return }
    const restore = async (item, into) => {
      if (into === 'original' && !(await confirmDialog('Restore ' + item.name + '?', 'The file gets this backup’s version as a new version to apply: Kalka offers it to the next person who opens the file. Nothing is lost.', 'Restore', false))) return
      try {
        const doc = await api('POST', '/api/ee/backups/' + id + '/restore', { documentId: item.documentId, into })
        closeDialog(); toast(into === 'copy' ? 'Restored as ' + doc.name : 'Restored into ' + doc.name)
      } catch (e) { toast(e.message) }
    }
    const rows = run.items.length ? run.items.map((item) => el('div', { class: 'row', style: { padding: '9px 0' } },
      el('span', { class: 'grow' }, el('span', {}, item.name), el('span', {}, K.bytes(item.size))),
      el('button', { type: 'button', class: 'btn soft small', onclick: () => restore(item, 'copy') }, 'Restore as a copy'),
      el('button', { type: 'button', class: 'btn ghost small', onclick: () => restore(item, 'original') }, 'Into the file')))
      : [el('p', { style: { margin: 0, color: 'var(--sub)' } }, run.status === 'running' ? 'Files appear here as they are copied.' : 'This backup holds no file.')]
    dialog('Backup of ' + longDate(run.startedAt), plural(run.documents, 'file') + ', ' + K.bytes(run.bytes) + (run.error ? '. ' + run.error : '. Also holds the accounts, invitations, settings (without secrets) and audit log, as directory.json.'),
      el('div', { style: { maxHeight: '50vh', overflow: 'auto' } }, rows),
      el('button', { type: 'button', class: 'btn', onclick: closeDialog }, 'Done'), { wide: true })
  }

  let backupTimer = null
  async function viewBackups() {
    clearTimeout(backupTimer)
    if (!hasFeature('backups')) {
      return frame('server', 'Kalka Server ' + server.version, 'Backups', serverTabs('backups'),
        businessGate('A copy of everything, every day', 'Managed backups copy every file and the server’s accounts and settings to your own S3-compatible storage (Cloudflare R2, Backblaze B2, MinIO, Amazon S3) once a day, keep them as long as you choose, and restore any file in two clicks. They come with Kalka Business.'))
    }
    const [state, settings] = await Promise.all([api('GET', '/api/ee/backups'), api('GET', '/api/settings')])
    const draft = {}
    const running = state.runs.find((run) => run.status === 'running')
    const checkResult = el('span', { class: 'sub', style: { color: 'var(--sub)' } }, state.configured ? 'Writes, reads and deletes a small file.' : 'Save the storage first.')
    const check = el('button', { type: 'button', class: 'btn soft', disabled: !state.configured, onclick: async () => {
      check.disabled = true
      try { await api('POST', '/api/ee/backups/check'); checkResult.style.color = 'var(--ok)'; checkResult.textContent = 'The storage works.' } catch (e) { checkResult.style.color = 'var(--danger)'; checkResult.textContent = e.message } finally { check.disabled = false }
    } }, icon('checkmark-circle-02'), 'Check the storage')
    const keep = String(state.retentionDays)
    const keepOptions = ['7', '14', '30', '90', '180', '365'].concat(['7', '14', '30', '90', '180', '365'].includes(keep) ? [] : [keep]).map((days) => ({ value: days, label: plural(Number(days), 'day') }))
    const hours = Array.from({ length: 24 }, (_, hour) => ({ value: String(hour), label: hourLabel(hour) }))
    const storageSection = section('Storage', 'Any S3-compatible storage: Cloudflare R2, Backblaze B2, MinIO or Amazon S3. Give the keys write, read, list and delete rights on the bucket only.', [
      textRow(settings, draft, 'KALKA_BACKUP_ENDPOINT', 'Endpoint', { placeholder: 'https://<account>.r2.cloudflarestorage.com', note: 'Amazon S3: https://s3.<region>.amazonaws.com. Backblaze B2: https://s3.<region>.backblazeb2.com.' }),
      textRow(settings, draft, 'KALKA_BACKUP_BUCKET', 'Bucket', { placeholder: 'kalka-backups' }),
      textRow(settings, draft, 'KALKA_BACKUP_REGION', 'Region', { placeholder: state.storage ? state.storage.region : 'From the endpoint', note: 'Leave empty to read it from the endpoint (auto on R2).' }),
      textRow(settings, draft, 'KALKA_BACKUP_ACCESS_KEY_ID', 'Access key ID'),
      textRow(settings, draft, 'KALKA_BACKUP_SECRET_ACCESS_KEY', 'Secret access key', { secret: true }),
      textRow(settings, draft, 'KALKA_BACKUP_PREFIX', 'Folder', { placeholder: 'kalka-backups', note: 'Backups go under this folder of the bucket, one folder per backup.' }),
      dropdownRow(settings, draft, 'KALKA_BACKUP_HOUR', 'Every day at', String(state.hour), hours, 'The daily backup starts within the hour after this time.'),
      dropdownRow(settings, draft, 'KALKA_BACKUP_RETENTION_DAYS', 'Keep for', keep, keepOptions, 'Older backups are deleted from the bucket.'),
      settingsRow('Check', [check, checkResult])
    ], draft, state.configured ? el('span', { class: 'pill ok dot' }, 'SET UP') : el('span', { class: 'pill' }, 'NOT SET UP'))
    const runNow = el('button', { type: 'button', class: 'btn white', disabled: !state.configured || Boolean(running), onclick: async () => {
      runNow.disabled = true
      try { await api('POST', '/api/ee/backups/run'); toast('Backup started'); route() } catch (e) { toast(e.message); runNow.disabled = false }
    } }, icon('database-01'), running ? 'Backing up…' : 'Back up now')
    const last = state.runs.find((run) => run.status === 'done')
    const cards = [
      stat({ label: 'Last backup', value: last ? last.documents : 0, sub: last ? plural(last.documents, 'file').replace(/^\d+ /, '') + ', ' + K.bytes(last.bytes) + ', ' + when(last.finishedAt).toLowerCase() : 'No backup has finished yet', tip: 'Files in the newest backup that finished.' }),
      stat({ label: 'Every day at', value: state.nextAt ? String(state.hour).padStart(2, '0') : '--', sub: state.nextAt ? 'UTC, next on ' + new Date(state.nextAt).toLocaleDateString('en-US', { weekday: 'long' }) : 'Set up the storage', tip: 'Backups run once a day, at the hour you choose.' }),
      stat({ label: 'Kept', value: state.runs.filter((run) => run.status === 'done').length, sub: 'backups, for ' + plural(state.retentionDays, 'day'), tip: 'Backups in the bucket. Older ones are deleted after the time you choose.' })
    ]
    frame('server', 'Kalka Server ' + server.version, 'Backups', [serverTabs('backups'), runNow], [
      el('section', { class: 'stats' }, cards),
      el('section', { class: 'glass list' }, el('div', { class: 'list-head' }, el('h2', {}, 'Backups'), el('span', { class: 'sub', style: { color: 'var(--faint)', fontSize: '12px' } }, 'Open one to restore a file.')),
        state.runs.length ? state.runs.map(runRow) : el('div', { class: 'row' }, el('span', { style: { color: 'var(--sub)' } }, state.configured ? 'No backup yet. The first one runs within the hour, or now with Back up now.' : 'Set up the storage below to start.'))),
      storageSection
    ])
    if (running) backupTimer = setTimeout(() => { if (location.hash === '#/server/backups') route() }, 3000)
  }

  // ---------- Provisioning (SCIM) ----------

  function tokenDialog(token) {
    dialog('Provisioning token', 'Paste it in your identity provider now: it is shown once. Making a new one stops this one.',
      el('div', { class: 'copyline' }, el('code', { style: { wordBreak: 'break-all' } }, token), el('button', { type: 'button', class: 'btn soft small', onclick: () => copy(token, 'Token copied') }, icon('copy-01', 14), 'Copy')),
      el('button', { type: 'button', class: 'btn', onclick: () => { closeDialog(); route() } }, 'Done'))
  }

  async function viewScim() {
    if (!hasFeature('scim')) {
      return frame('server', 'Kalka Server ' + server.version, 'Provisioning', serverTabs('scim'),
        businessGate('Accounts that follow your directory', 'With SCIM 2.0, Okta, Microsoft Entra ID, Authentik and other identity providers create accounts, keep names and emails current, deactivate people who leave, and push groups that give roles. It comes with Kalka Business.'))
    }
    const state = await api('GET', '/api/ee/scim')
    const makeToken = async () => {
      if (state.token && !(await confirmDialog('Make a new token?', 'The current token stops working at once: update it in your identity provider.', 'Make a new token', true))) return
      try { tokenDialog((await api('POST', '/api/ee/scim/token')).token) } catch (e) { toast(e.message) }
    }
    const revoke = async () => {
      if (!(await confirmDialog('Revoke the token?', 'Your identity provider can no longer create or change accounts until you make a new token.', 'Revoke', true))) return
      try { await api('DELETE', '/api/ee/scim/token'); toast('Token revoked'); route() } catch (e) { toast(e.message) }
    }
    const tokenRow = settingsRow('Bearer token', state.token
      ? [el('span', { style: { flex: '1 1 200px', color: 'var(--sub)' } }, 'Made ' + when(state.token.createdAt).toLowerCase() + (state.token.lastUsedAt ? ', last used ' + when(state.token.lastUsedAt).toLowerCase() : ', never used yet')),
        el('button', { type: 'button', class: 'btn soft', onclick: makeToken }, icon('refresh'), 'New token'),
        el('button', { type: 'button', class: 'btn danger', onclick: revoke }, 'Revoke')]
      : [el('span', { style: { flex: '1 1 200px', color: 'var(--sub)' } }, 'No token yet.'), el('button', { type: 'button', class: 'btn', onclick: makeToken }, icon('key-01'), 'Make a token')])
    const roleName = (role) => role ? ROLES[role].label : 'Cannot sign in'
    const groupRows = state.groups.length ? state.groups.map((group) => el('div', { class: 'row' },
      el('span', { class: 'mark', style: { width: '32px', height: '32px', background: 'var(--chip)', color: 'var(--faint)' } }, icon('user-group', 16)),
      el('span', { class: 'grow' }, el('span', {}, group.displayName), el('span', {}, plural(group.members, 'member') + (group.externalId ? ', ID ' + group.externalId : ''))),
      group.role ? el('span', { class: 'dd' }, el('span', { class: 'dd-btn', style: { cursor: 'default' } }, el('span', { class: 'swatch', style: { '--c': ROLES[group.role].color } }), ROLES[group.role].label))
        : el('span', { class: 'cell', title: 'Add the group’s name to Administrators, Editors or Viewers under Server, Single sign-on.' }, 'No role of its own')))
      : [el('div', { class: 'row' }, el('span', { style: { color: 'var(--sub)' } }, 'No group pushed yet. In your identity provider, push the groups that should give roles.'))]
    frame('server', 'Kalka Server ' + server.version, 'Provisioning', serverTabs('scim'), [
      el('section', { class: 'stats' },
        stat({ label: 'Provisioned', value: state.provisionedUsers, sub: 'accounts managed by SCIM', tip: 'Accounts your identity provider created or updated. They take a seat only once they sign in.' }),
        stat({ label: 'Groups', value: state.groups.length, sub: state.groups.filter((group) => group.role).length + ' give a role', tip: 'Groups your identity provider pushed. Roles come from the group names under Server, Single sign-on.' })),
      section('Connection', 'In your identity provider, add a SCIM 2.0 app with this base URL and token. Okta: Provisioning, To App. Microsoft Entra ID: Enterprise application, Provisioning, Automatic. Authentik: a SCIM provider.', [
        copyRow('Base URL', state.baseUrl, 'SCIM 2.0, with Users and Groups.'),
        tokenRow,
        settingsRow('Roles', el('span', { style: { color: 'var(--sub)' } }, 'A group gives a role when its name (or its ID, for Entra) is listed under Administrators, Editors or Viewers in single sign-on. Everyone else: ' + roleName(state.defaultRole) + '.'), null)
      ], null, state.token ? el('span', { class: 'pill ok dot' }, 'TOKEN SET') : el('span', { class: 'pill' }, 'NO TOKEN')),
      el('section', { class: 'glass list' }, el('div', { class: 'list-head' }, el('h2', {}, 'Groups'), el('a', { href: '#/server/sso', style: { marginLeft: 'auto', color: 'var(--sub)', fontSize: '12px' } }, 'Role settings')), groupRows)
    ])
  }

  // ---------- Router ----------

  async function route() {
    if (routing) return
    routing = true
    closePop(); closeDialog()
    try {
      if (!server) server = await api('GET', '/api/server')
      // A single sign-on comes back with a one-time code (or an error) in the query.
      const params = new URLSearchParams(location.search)
      if (params.get('code')) {
        history.replaceState(null, '', '/' + location.hash)
        try { const result = await api('POST', '/api/auth/exchange', { code: params.get('code') }); setToken(result.token); me = result.user } catch (e) { toast(e.message) }
      }
      if (params.get('error')) { history.replaceState(null, '', '/' + location.hash); toast(params.get('error')) }
      const hash = location.hash
      if (server.setupRequired) return viewSetup()
      if (hash.startsWith('#invite=')) return viewInvite(hash.slice(8))
      if (hash.startsWith('#reset=')) return viewReset(hash.slice(7))
      if (hash === '#/forgot') return viewForgot()
      if (!me && token()) me = await api('GET', '/api/me').catch(() => null)
      if (!me) { setToken(null); return viewSignIn() }
      const [page, sub] = hash.slice(2).split('/')
      try {
        if (page === 'files') return await viewFiles()
        if (page === 'people' && isAdmin()) return await viewPeople()
        if ((page === 'server' || page === 'settings') && isAdmin()) {
          if (sub === 'audit') return await viewAudit()
          if (sub === 'backups') return await viewBackups()
          if (sub === 'scim') return await viewScim()
          return await viewServer(sub === 'sso' ? 'single-sign-on' : sub)
        }
        return await viewHome()
      } catch (e) {
        if (!me) return viewSignIn()
        frame(page || 'home', server.name, 'Something went wrong', null, el('section', { class: 'glass empty' }, el('p', {}, e.message), el('button', { type: 'button', class: 'btn', onclick: route }, icon('refresh'), 'Try again')))
      }
    } catch (e) {
      screen('Something went wrong', e.message, el('button', { type: 'button', class: 'btn', onclick: route }, icon('refresh'), 'Try again'))
    } finally {
      routing = false
    }
  }

  window.addEventListener('hashchange', route)
  route()
})()
