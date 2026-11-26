import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, protocol, session, shell, type WebContents } from 'electron'

import {
  frontEditor,
  handleLink,
  LINK_SCHEME,
  openEditorWindow,
  queueOpenPaths,
  registerHandlers,
  titleBarOptions,
  track,
  trackTitleBar
} from './handlers'
import {
  CONTENT_SECURITY_POLICY,
  SANDBOX_CONTENT_SECURITY_POLICY,
  SANDBOX_PATH
} from './csp'
import { installIPC } from './ipc'
import { APP_ORIGIN, APP_SCHEME, isAppURL, isTrustedSender } from './origin'

app.setName('Kalka')

const here = dirname(fileURLToPath(import.meta.url))
const PRELOAD = join(here, 'preload.cjs')
/** The Vite dev server during development; the built app otherwise. */
const DEV_URL = process.env.KALKA_DEV_URL?.replace(/\/$/, '')
/** The built app: shipped in the package's resources, or the workspace build in development. */
const DIST = app.isPackaged
  ? normalize(join(process.resourcesPath, 'renderer'))
  : normalize(join(here, '..', '..', 'dist'))

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
    const path = decodeURIComponent(new URL(request.url).pathname)
    const file = normalize(join(DIST, path))
    if (file !== DIST && !file.startsWith(DIST + sep))
      return new Response('Forbidden', { status: 403 })
    const extension = extname(file)
    try {
      const body = await readFile(extension ? file : join(DIST, 'index.html'))
      const type = MIME[extension] ?? (extension ? 'application/octet-stream' : 'text/html')
      const headers: Record<string, string> = { 'content-type': type }
      if (type === 'text/html')
        headers['content-security-policy'] =
          path === SANDBOX_PATH ? SANDBOX_CONTENT_SECURITY_POLICY : CONTENT_SECURITY_POLICY
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

/**
 * No window of the app navigates away from it or opens another window: web links open in the
 * system browser instead. Every web contents gets this, the Software Update window and any later
 * one as much as the editor, since they all carry the preload.
 */
function lockDown(contents: WebContents): void {
  contents.on('will-navigate', (event, url) => {
    if (isAppURL(url, DEV_URL)) return
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

/** An editor window; the first is `main`, later ones come from File › New Window. */
function createWindow(label: string): BrowserWindow {
  const window = new BrowserWindow({
    title: 'Kalka',
    icon: ICON,
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: '#121214',
    // The tab bar is the title bar (`./handlers/title-bar`).
    ...titleBarOptions(),
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      // Agents edit through the MCP server while the window is hidden or behind others; throttled
      // timers there would stall their tool calls past the server's timeout.
      backgroundThrottling: false
    }
  })
  // Off macOS the app draws its own menu, as on the web; the native bar stays hidden but keeps
  // its accelerators.
  if (process.platform !== 'darwin') window.setMenuBarVisibility(false)
  track(window, label)
  trackTitleBar(window)
  window.once('ready-to-show', () => window.show())
  void window.loadURL(pageURL(''))
  return window
}

/** Documents a launch names: design files, `.kalka` archives and Kalka folders. */
const designFiles = (args: string[]) =>
  args.filter(
    (arg) => /\.(fig|pen|kalka)$/i.test(arg) || existsSync(join(arg, 'project.json'))
  )
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
    const window = frontEditor() ?? BrowserWindow.getAllWindows()[0]
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
    installIPC((contents) => BrowserWindow.fromWebContents(contents), (frame) =>
      isTrustedSender(frame, DEV_URL)
    )
    registerHandlers({ createWindow, pageURL, preload: PRELOAD })
    openEditorWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) openEditorWindow()
    })
  })()

  app.on('web-contents-created', (_event, contents) => lockDown(contents))

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
