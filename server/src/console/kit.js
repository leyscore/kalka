// Kalka's console kit: DOM helpers, the sky, the theme switch, pixel numbers and charts, pixel
// portraits, tips, the custom dropdown, menus, dialogs and forms. Shared by the server console,
// Kalka Cloud and its owner's admin; exposed as window.K. Plain browser JavaScript.
;(() => {
  'use strict'

  const SVG = 'http://www.w3.org/2000/svg'
  const THEME_KEY = 'kalka-theme'
  const ICONS = window.KALKA_ICONS || {}
  const root = document.getElementById('console')

  function stored(key) { try { return localStorage.getItem(key) } catch { return null } }
  function store(key, value) { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value) } catch {} }

  // ---------- DOM ----------

  function el(tag, attrs, ...children) {
    const node = ['svg', 'path', 'rect', 'circle', 'g'].includes(tag) ? document.createElementNS(SVG, tag) : document.createElement(tag)
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue
      if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value)
      else if (key === 'style' && typeof value === 'object') {
        for (const [prop, v] of Object.entries(value)) prop.startsWith('--') ? node.style.setProperty(prop, v) : (node.style[prop] = v)
      } else node.setAttribute(key, value === true ? '' : value)
    }
    for (const child of children.flat(Infinity)) if (child != null && child !== false) node.append(child)
    return node
  }

  /** A Hugeicons icon by name, drawn with the current text color. */
  function icon(name, size) {
    const svg = document.createElementNS(SVG, 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', size || 16)
    svg.setAttribute('height', size || 16)
    svg.setAttribute('aria-hidden', 'true')
    // The icon set is our own bundled data, never user input.
    svg.innerHTML = ICONS[name] || ''
    return svg
  }

  function mark(size) {
    return el('span', { class: 'mark', style: { width: size + 'px', height: size + 'px' } },
      el('svg', { viewBox: '14 14 72 72', 'aria-hidden': 'true' },
        el('rect', { x: 14, y: 14, width: 22, height: 72, fill: '#efefec' }),
        el('path', { d: 'M40 50 L86 14 L86 50 Z', fill: '#efefec' }),
        el('path', { d: 'M40 50 A46 36 0 0 0 86 86 L86 50 Z', fill: '#efefec' })))
  }

  // ---------- Sky and theme ----------

  const STARS = [[6, 12], [18, 64], [27, 30], [41, 8], [52, 46], [66, 18], [73, 70], [84, 34], [93, 10], [12, 88], [58, 82], [90, 58]]
  function mountSky() {
    if (document.querySelector('.k-sky')) return
    const sky = el('div', { class: 'k-sky', 'aria-hidden': 'true' },
      el('div', { class: 'night' }), el('div', { class: 'day' }), el('div', { class: 'clouds' }),
      STARS.map(([left, top], i) => el('svg', { class: 'star', viewBox: '0 0 24 24', style: { left: left + '%', top: top + '%', animationDelay: (-i * 0.7) + 's' } },
        el('path', { d: 'M12 0C12.6 6.6 17.4 11.4 24 12C17.4 12.6 12.6 17.4 12 24C11.4 17.4 6.6 12.6 0 12C6.6 11.4 11.4 6.6 12 0Z' }))))
    document.body.prepend(sky)
  }

  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  function themeChoice() { return stored(THEME_KEY) || 'system' }
  function isDark() { return document.documentElement.dataset.theme === 'dark' }
  function applyTheme() {
    const choice = themeChoice()
    document.documentElement.dataset.theme = choice === 'dark' || (choice === 'system' && darkQuery.matches) ? 'dark' : 'light'
  }
  darkQuery.addEventListener('change', applyTheme)
  applyTheme()

  /** Day to night (or back): spreads from `from` in pixels where the browser can, else at once. */
  function toggleTheme(from) {
    const next = isDark() ? 'light' : 'dark'
    const flip = () => { store(THEME_KEY, next); applyTheme() }
    if (from) {
      const rect = from.getBoundingClientRect()
      document.documentElement.style.setProperty('--k-vx', Math.round(rect.left + rect.width / 2) + 'px')
      document.documentElement.style.setProperty('--k-vy', Math.round(rect.top + rect.height / 2) + 'px')
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (document.startViewTransition && !reduce) document.startViewTransition(flip)
    else flip()
  }

  function themeToggle() {
    const knob = el('i')
    const paint = () => { knob.replaceChildren(icon(isDark() ? 'moon-02' : 'sun-03', 14)); button.setAttribute('aria-label', isDark() ? 'Night: switch to day' : 'Day: switch to night') }
    const button = el('button', { type: 'button', class: 'theme-toggle', onclick: () => { toggleTheme(button); setTimeout(paint, 30) } }, knob)
    paint()
    return button
  }

  // ---------- Formatting ----------

  function when(ms) {
    if (!ms) return 'Never'
    const diff = Date.now() - ms
    if (diff >= 0 && diff < 60e3) return 'Now'
    if (diff >= 0 && diff < 3600e3) return Math.round(diff / 60e3) + ' min ago'
    if (diff >= 0 && diff < 86400e3) return Math.round(diff / 3600e3) + ' h ago'
    const date = new Date(ms)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
  }
  function money(cents) { return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }) }
  function compact(n) { return n >= 10000 ? Math.round(n / 1000) + 'k' : n.toLocaleString('en-US') }
  function bytes(n) {
    if (n < 1024) return n + ' B'
    const units = ['KB', 'MB', 'GB', 'TB']
    let value = n / 1024
    let unit = 0
    while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++ }
    return value.toFixed(value < 10 ? 1 : 0) + ' ' + units[unit]
  }
  const PALETTE = ['#2f5bea', '#e2632a', '#8b5cf6', '#0f9d6e', '#c2410c', '#0ea5e9', '#db2777', '#475569']
  function hash(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
  function colorOf(text) { return PALETTE[hash(text) % PALETTE.length] }

  // ---------- Pixel things ----------

  /** A number written in pixels. */
  function px(text, size, extra) { return el('div', { class: 'px' + (extra ? ' ' + extra : ''), style: { fontSize: size + 'px' } }, String(text)) }

  function tip(text, label) { return el('button', { type: 'button', class: 'tip', 'aria-label': label || 'What this means', 'data-tip': text }, icon('information-circle', 14)) }

  function stat({ label, value, sub, tip: help, size }) {
    return el('div', { class: 'glass stat' },
      el('div', { class: 'top' }, el('span', { class: 'label' }, label), help ? tip(help, 'About ' + label.toLowerCase()) : null),
      px(value, size || 60),
      sub ? el('span', { class: 'sub' }, sub) : null)
  }

  /** Columns of pixels; `hi` marks the columns drawn bright. */
  function bars(values, hi) {
    const max = Math.max(1, ...values.map((v) => v.value))
    return el('div', { class: 'bars' }, values.map((v, i) => el('span', {
      class: hi && hi(v, i) ? 'hi' : null, title: v.title,
      style: { '--h': Math.max(3, Math.round(v.value / max * 100)) + '%', '--d': (i * 25) + 'ms' }
    })))
  }

  function meter(used, limit, warnAt) {
    const ratio = limit ? Math.min(1, used / limit) : 0
    return el('div', { class: 'meter' + (ratio >= (warnAt || 0.9) ? ' warn' : '') }, el('i', { style: { '--w': (ratio * 100).toFixed(1) + '%' } }))
  }

  /** One square in a hundred per share: parts are [{ share 0..1, color }]. */
  function waffle(parts) {
    const cells = []
    let filled = 0
    parts.forEach((part, index) => {
      const count = index === parts.length - 1 ? 100 - filled : Math.round(part.share * 100)
      for (let i = 0; i < count && cells.length < 100; i++) cells.push(part.color)
      filled += count
    })
    while (cells.length < 100) cells.push('var(--track)')
    return el('div', { class: 'waffle', 'aria-hidden': 'true' }, cells.map((color, i) => el('span', { style: { '--c': color, '--d': (i * 7) + 'ms' } })))
  }

  function seats(used, total) {
    const n = Math.max(1, Math.min(total, 20))
    return el('div', { class: 'seats', style: { '--n': n }, 'aria-hidden': 'true' },
      Array.from({ length: n }, (_, i) => el('span', { class: i < used ? 'on' : null, style: { '--d': (i * 60) + 'ms' } })))
  }

  // A pixel portrait per person, the same every time: an 8 by 8 face mirrored down the middle,
  // drawn from a hash of the address in Kalka's palette.
  const FACES = [['#dce6ff', '#2f5bea', '#0e1222'], ['#e7f6ee', '#0f9d6e', '#0e1222'], ['#ffe9df', '#e2632a', '#0e1222'], ['#efe7ff', '#8b5cf6', '#0e1222'], ['#fde7f1', '#db2777', '#0e1222'], ['#e3eafb', '#1236b8', '#ff6a3d']]
  function portrait(seed, size, label) {
    const key = String(seed || '?').toLowerCase()
    const palette = FACES[hash(key) % FACES.length]
    const cells = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const mx = x < 4 ? x : 7 - x
        const bit = hash(key + ':' + y + ':' + mx) % 100
        let color = 'transparent'
        if (y >= 1 && y <= 6 && bit < 58) color = palette[1]
        if ((y === 3 && mx === 2) || (y === 3 && mx === 1 && bit < 30)) color = palette[2]
        cells.push(el('i', { style: { background: color, animationDelay: ((y * 8 + x) * 6) + 'ms' } }))
      }
    }
    const pad = Math.round(size * 0.11) + 'px'
    return el('span', { class: 'portrait', role: 'img', 'aria-label': label || 'Portrait', style: { width: size + 'px', height: size + 'px', padding: pad, background: palette[0] } }, cells)
  }

  // ---------- Feedback ----------

  function toast(message) {
    document.querySelectorAll('.toast').forEach((node) => node.remove())
    const node = el('div', { class: 'toast', role: 'status' }, message)
    document.body.append(node)
    setTimeout(() => node.remove(), 3200)
  }
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast(label || 'Copied') } catch { toast('Copy failed: select the text instead') }
  }

  // ---------- Popovers: menus and the dropdown ----------

  let pop = null
  let popAnchor = null
  function closePop() {
    if (!pop) return
    pop.remove(); pop = null
    if (popAnchor) { popAnchor.setAttribute('aria-expanded', 'false'); popAnchor = null }
  }
  function openPop(anchor, children, opts) {
    closePop()
    popAnchor = anchor
    anchor.setAttribute('aria-expanded', 'true')
    pop = el('div', { class: 'pop', role: (opts && opts.role) || 'menu' }, children)
    document.body.append(pop)
    const rect = anchor.getBoundingClientRect()
    const width = Math.max(pop.offsetWidth, opts && opts.matchWidth ? rect.width : 0)
    if (opts && opts.matchWidth) pop.style.minWidth = rect.width + 'px'
    const below = rect.bottom + 6 + pop.offsetHeight < window.innerHeight
    pop.style.top = (below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - pop.offsetHeight)) + 'px'
    const left = opts && opts.alignLeft ? rect.left : rect.right - width
    pop.style.left = Math.max(8, Math.min(window.innerWidth - width - 8, left)) + 'px'
    const first = pop.querySelector('[aria-selected="true"], button, a')
    if (first) first.focus()
    return pop
  }
  document.addEventListener('click', (event) => { if (pop && !pop.contains(event.target) && !(popAnchor && popAnchor.contains(event.target))) closePop() }, true)
  document.addEventListener('keydown', (event) => {
    // Escape closes the open menu first, and the dialog only once no menu is open.
    if (event.key === 'Escape') {
      const anchor = popAnchor
      if (pop) closePop()
      else closeDialog()
      if (anchor) anchor.focus()
    }
    if (pop && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      const items = [...pop.querySelectorAll('button, a')]
      const index = items.indexOf(document.activeElement)
      const next = items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]
      if (next) { event.preventDefault(); next.focus() }
    }
  })
  window.addEventListener('resize', closePop)

  function menu(anchor, items) {
    openPop(anchor, items, {})
  }

  /** A Kalka dropdown: options [{ value, label, desc?, color? }]. */
  function dropdown({ value, options, onChange, label, wide, disabled }) {
    let current = value
    const swatch = el('span', { class: 'swatch' })
    const text = el('span', { class: 'txt' })
    const button = el('button', { type: 'button', class: 'dd-btn', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': label, disabled: disabled || null }, swatch, text, el('span', { class: 'chev' }, icon('arrow-down-01', 14)))
    function paint() {
      const option = options.find((o) => o.value === current) || options[0]
      text.textContent = option ? option.label : ''
      swatch.style.setProperty('--c', (option && option.color) || 'var(--blue)')
      swatch.hidden = !(option && option.color)
    }
    button.addEventListener('click', () => {
      if (popAnchor === button) { closePop(); return }
      openPop(button, options.map((o) => el('button', {
        type: 'button', class: 'opt', role: 'option', 'aria-selected': String(o.value === current),
        onclick: async () => {
          closePop(); button.focus()
          if (o.value === current) return
          const previous = current
          current = o.value; paint()
          try { await onChange(o.value) } catch (error) { current = previous; paint(); toast(error.message) }
        }
      },
      o.color ? el('span', { class: 'swatch', style: { '--c': o.color } }) : null,
      el('span', { class: 'body' }, el('span', { style: { fontWeight: '500' } }, o.label), o.desc ? el('span', {}, o.desc) : null),
      o.value === current ? el('span', { style: { color: 'var(--blue)' } }, icon('tick-02', 16)) : null)), { role: 'listbox', matchWidth: true })
    })
    paint()
    return el('div', { class: 'dd' + (wide ? ' wide' : '') }, button)
  }

  // ---------- Dialogs ----------

  let dialogNode = null
  let dialogReturn = null
  function closeDialog() {
    if (!dialogNode) return
    dialogNode.remove(); dialogNode = null
    if (dialogReturn && dialogReturn.focus) dialogReturn.focus()
  }
  function dialog(title, lead, body, foot, opts) {
    closeDialog()
    dialogReturn = document.activeElement
    const box = el('section', { class: 'glass dialog' + (opts && opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'k-dialog-title' },
      el('div', { class: 'dialog-head' }, el('div', {}, el('h2', { id: 'k-dialog-title' }, title), lead ? el('p', {}, lead) : null),
        el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', onclick: closeDialog }, icon('cancel-01', 16))),
      el('div', { class: 'dialog-body' }, body),
      foot ? el('div', { class: 'dialog-foot' }, foot) : null)
    dialogNode = el('div', { class: 'scrim', onclick: (event) => { if (event.target === dialogNode) closeDialog() } }, box)
    document.body.append(dialogNode)
    const first = box.querySelector('input, textarea, .dd-btn, button:not(.icon-btn)')
    if (first) first.focus()
    return box
  }
  /** A dialog that asks for confirmation; resolves true when confirmed. */
  function confirmDialog(title, text, action, danger) {
    return new Promise((resolve) => {
      dialog(title, null, el('p', { style: { margin: 0, color: 'var(--sub)' } }, text), [
        el('button', { type: 'button', class: 'btn ghost', onclick: () => { closeDialog(); resolve(false) } }, 'Cancel'),
        el('button', { type: 'button', class: 'btn' + (danger ? ' danger' : ''), style: danger ? { background: 'var(--danger-bg)' } : null, onclick: () => { closeDialog(); resolve(true) } }, action)
      ])
    })
  }

  // ---------- Forms ----------

  function form(fields, submit, onSubmit) {
    const error = el('p', { class: 'error', role: 'alert' })
    const node = el('form', { novalidate: true, onsubmit: async (event) => {
      event.preventDefault()
      error.textContent = ''
      const button = node.querySelector('button[type=submit]')
      if (button) button.disabled = true
      try { await onSubmit(Object.fromEntries(new FormData(node))) } catch (e) { error.textContent = e.message } finally { if (button) button.disabled = false }
    } },
    fields.map((f) => {
      const input = el('input', { class: 'field' + (f.code ? ' code-input' : ''), name: f.name, type: f.type || 'text', value: f.value, placeholder: f.placeholder, autocomplete: f.autocomplete, inputmode: f.inputmode, maxlength: f.maxlength, readonly: f.readonly })
      // A password can be shown, to check what was typed.
      const reveal = f.type === 'password'
        ? el('button', { type: 'button', class: 'reveal', 'aria-label': 'Show password', 'aria-pressed': 'false', onclick: (event) => {
            const shown = input.type === 'password'
            input.type = shown ? 'text' : 'password'
            event.currentTarget.setAttribute('aria-pressed', String(shown))
            event.currentTarget.setAttribute('aria-label', shown ? 'Hide password' : 'Show password')
            event.currentTarget.replaceChildren(icon(shown ? 'view-off' : 'view', 16))
          } }, icon('view', 16))
        : null
      return el('label', { class: 'stack' }, f.label,
        reveal ? el('span', { class: 'field-wrap' }, input, reveal) : input,
        f.hint ? el('span', { style: { color: 'var(--faint)', fontSize: '12px' } }, f.hint) : null)
    }),
    error, submit)
    return node
  }

  /** A signed-out screen: the full sky and one glass card. */
  function screen(title, lead, card, foot) {
    mountSky()
    root.replaceChildren(el('main', { class: 'screen' },
      el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' } }, mark(52), el('h1', {}, title), lead ? el('p', { class: 'lead' }, lead) : null),
      el('div', { class: 'glass card' }, card),
      el('p', { class: 'foot' }, foot || null)))
  }

  /**
   * The signed-in frame: glass sidebar, a heading on the sky, then the page. When the sidebar starts with a
   * `.brand`, phones and tablets show only that brand and a menu button, which opens the rest over the page.
   */
  function shell({ side, eyebrow, title, actions, body }) {
    mountSky()
    const parts = [side].flat(Infinity).filter((part) => part != null && part !== false)
    const aside = el('aside', { class: 'glass k-side' })
    if (parts[0] instanceof Element && parts[0].classList.contains('brand')) {
      // Both icons stay in the button and CSS shows one: swapping nodes mid-click would detach the click target.
      const burger = el('button', { type: 'button', class: 'icon-btn k-burger', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'k-drawer', onclick: () => sideMenu() },
        icon('menu-01', 20), icon('cancel-01', 20))
      aside.append(el('div', { class: 'k-bar' }, parts[0], burger),
        el('div', { class: 'k-drawer', id: 'k-drawer', onclick: (event) => { if (event.target.closest('a')) sideMenu(false) } }, parts.slice(1)))
    } else aside.append(...parts)
    root.replaceChildren(el('div', { class: 'k-app' },
      aside,
      el('main', { class: 'k-main' },
        el('header', { class: 'k-head' }, el('div', {}, eyebrow ? el('div', { class: 'eyebrow' }, eyebrow) : null, el('h1', {}, title)), actions ? el('div', { class: 'actions' }, actions) : null),
        body)))
    window.scrollTo(0, 0)
  }

  /** Opens, closes or toggles the phone menu of the current frame. */
  function sideMenu(open) {
    const aside = root.querySelector('.k-side')
    const burger = aside && aside.querySelector('.k-burger')
    if (!burger) return
    const next = open ?? !aside.classList.contains('open')
    aside.classList.toggle('open', next)
    burger.setAttribute('aria-expanded', String(next))
  }
  document.addEventListener('click', (event) => { const aside = root.querySelector('.k-side.open'); if (aside && !aside.contains(event.target)) sideMenu(false) })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !root.querySelector('.k-side.open')) return
    sideMenu(false)
    root.querySelector('.k-burger').focus()
  })

  function nav(items, active) {
    return el('nav', { class: 'nav', 'aria-label': 'Sections' }, items.map((item) => item.group
      ? el('span', { class: 'group' }, item.group)
      : el('a', { href: item.href, 'aria-current': item.id === active ? 'page' : null }, icon(item.icon), item.label, item.count != null ? el('span', { class: 'count' }, String(item.count)) : null)))
  }

  /** Passwordless sign-in: the email, then the six digits sent to it. */
  function codeSignIn({ api, title, lead, top, bottom, done, error, foot }) {
    function stepEmail(message) {
      screen(title, lead, [
        message ? el('p', { class: 'error' }, message) : null,
        top || null,
        form([{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', placeholder: 'you@company.com' }],
          el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Continue with email'),
          async (values) => { await api('POST', '/api/cloud/auth/code', { email: values.email }); stepCode(values.email) }),
        bottom || null
      ], foot)
    }
    function stepCode(email) {
      const node = form([{ name: 'code', label: 'Code', autocomplete: 'one-time-code', inputmode: 'numeric', maxlength: 6, code: true, placeholder: '000000' }],
        el('button', { type: 'submit', class: 'btn', style: { height: '42px' } }, 'Sign in'),
        async (values) => done(await api('POST', '/api/cloud/auth/code/verify', { email, code: values.code })))
      const input = node.querySelector('input')
      input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 6); if (input.value.length === 6) node.requestSubmit() })
      screen('Check your email', 'We sent a six-digit code to ' + email + '. It works for 10 minutes.', [node,
        el('div', { class: 'links' },
          el('a', { href: '#', onclick: async (event) => { event.preventDefault(); try { await api('POST', '/api/cloud/auth/code', { email }); toast('New code sent') } catch (e) { toast(e.message) } } }, 'Send a new code'),
          el('a', { href: '#', onclick: (event) => { event.preventDefault(); stepEmail() } }, 'Use another email'))], foot)
      input.focus()
    }
    stepEmail(error)
  }

  /** Calls a JSON API with a stored Bearer session; `onSignedOut` runs when it is refused. */
  function client(tokenKey, onSignedOut) {
    const token = () => stored(tokenKey)
    async function api(method, path, body, bearer) {
      const headers = {}
      if (body !== undefined) headers['Content-Type'] = 'application/json'
      const auth = bearer || token()
      if (auth) headers.Authorization = 'Bearer ' + auth
      const response = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401 && !bearer && !path.includes('/auth/')) { store(tokenKey, null); onSignedOut() }
      if (!response.ok) { const error = new Error(data.error || 'Request failed (' + response.status + ')'); error.status = response.status; throw error }
      return data
    }
    return { api, token, setToken: (value) => store(tokenKey, value) }
  }

  window.K = {
    root, el, icon, mark, mountSky, themeToggle, toggleTheme, isDark, when, money, compact, bytes, colorOf, hash,
    px, tip, stat, bars, meter, waffle, seats, portrait, toast, copy, menu, closePop, dropdown, dialog, closeDialog,
    confirmDialog, form, screen, shell, nav, codeSignIn, client, stored, store
  }
})()
