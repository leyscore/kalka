import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, protocol, session, shell, type WebContents } from 'electron'

import { handleLink, LINK_SCHEME, queueOpenPaths, registerHandlers, track } from './handlers'
import { installIPC } from './ipc'

app.setName('Kalka')

const here = dirname(fileURLToPath(import.meta.url))
const PRELOAD = join(here, 'preload.cjs')
/** The Vite dev server during development; the built app otherwise. */
const DEV_URL = process.env.KALKA_DEV_URL?.replace(/\/$/, '')
const APP_SCHEME = 'kalka-app'
const APP_ORIGIN = `${APP_SCHEME}://app`
/** The built app: shipped in the package's resources, or the workspace build in development. */
const DIST = app.isPackaged
  ? normalize(join(process.resourcesPath, 'renderer'))
  : normalize(join(here, '..', '..', 'dist'))
/**
 * What the editor's pages may load and run: their own files, CanvasKit's WebAssembly, images and
 * fonts from data, blobs and HTTPS, and requests to HTTPS services and the local MCP server.
 * Artboards add their own, stricter policy.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: blob: https:",
  "connect-src 'self' data: blob: https: http://127.0.0.1:* ws://127.0.0.1:*",
  "media-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "frame-src 'self' about: blob: data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ')
/** The brand kit's app icon; a packaged app takes its icon from the bundle instead. */
const ICON = join(here, '..', 'build', 'icon.png')

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
])

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json'
}

/** Serves the built app, falling back to index.html for client-side routes. */
function serveApp(): void {
  protocol.handle(APP_SCHEME, async (request) => {
    const file = normalize(join(DIST, decodeURIComponent(new URL(request.url).pathname)))
    if (file !== DIST && !file.startsWith(DIST + sep))
      return new Response('Forbidden', { status: 403 })
    const extension = extname(file)
    try {
      const body = await readFile(extension ? file : join(DIST, 'index.html'))
      const type = MIME[extension] ?? (extension ? 'application/octet-stream' : 'text/html')
      const headers: Record<string, string> = { 'content-type': type }
      if (type === 'text/html') headers['content-security-policy'] = CONTENT_SECURITY_POLICY
      return new Response(body, { headers })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}

function pageURL(path: string): string {
  const relative = path.replace(/^\//, '')
  return DEV_URL ? `${DEV_URL}/${relative}` : `${APP_ORIGIN}/${relative}`
}

function isAppURL(url: string): boolean {
  return url.startsWith(DEV_URL ? `${DEV_URL}/` : `${APP_ORIGIN}/`) || url === DEV_URL
}

function lockDown(contents: WebContents): void {
  // The editor never navigates away from itself; web links open in the system browser.
  contents.on('will-navigate', (event, url) => {
    if (isAppURL(url)) return
    event.preventDefault()
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
  })
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
}

/** What the editor's page may ask for without a prompt: clipboard writes and local fonts. */
function grantPermissions(): void {
  const allowed = new Set(['clipboard-sanitized-write', 'local-fonts'])
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) =>
    callback(allowed.has(permission))
  )
  session.defaultSession.setPermissionCheckHandler((_contents, permission) =>
    allowed.has(permission)
  )
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    title: 'Kalka',
    icon: ICON,
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: '#121214',
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false
    }
  })
  track(window, 'main')
  lockDown(window.webContents)
  window.once('ready-to-show', () => window.show())
  void window.loadURL(pageURL(''))
  return window
}

const designFiles = (args: string[]) => args.filter((arg) => /\.(fig|pen)$/i.test(arg))
const links = (args: string[]) => args.filter((arg) => arg.startsWith(`${LINK_SCHEME}://`))

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  if (process.defaultApp && process.argv[1]) {
    app.setAsDefaultProtocolClient(LINK_SCHEME, process.execPath, [process.argv[1]])
  } else {
    app.setAsDefaultProtocolClient(LINK_SCHEME)
  }

  // Files and links passed on the command line, or by a second launch.
  const launch = process.argv.slice(app.isPackaged ? 1 : 2)
  void queueOpenPaths(designFiles(launch))
  for (const link of links(launch)) handleLink(link)

  app.on('second-instance', (_event, argv) => {
    void queueOpenPaths(designFiles(argv))
    for (const link of links(argv)) handleLink(link)
    const window = BrowserWindow.getAllWindows()[0]
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  })

  // macOS hands files and links over as events, even before the app is ready.
  app.on('open-file', (event, path) => {
    event.preventDefault()
    void queueOpenPaths([path])
  })
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleLink(url)
  })

  void (async () => {
    await app.whenReady()
    if (!app.isPackaged) app.dock?.setIcon(ICON)
    grantPermissions()
    serveApp()
    installIPC((contents) => BrowserWindow.fromWebContents(contents))
    registerHandlers({ createWindow, pageURL, preload: PRELOAD })
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })()

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
