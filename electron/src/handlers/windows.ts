import { app, BrowserWindow, dialog, nativeTheme, type WebContents } from 'electron'
import * as v from 'valibot'

import { emit, registerAll, type CallContext } from '../ipc'
import {
  CloseFallbackText,
  createPageCloseAsks,
  DEFAULT_CLOSE_FALLBACK_TEXT,
  type PageCloseRequest
} from './close-ask'
import { applyTitleBarTheme, TitleBarTheme } from './title-bar'

export interface WindowHost {
  createWindow(): BrowserWindow
  /** The page `path` of the app, in development or in the built app. */
  pageURL(path: string): string
  preload: string
}

const labels = new Map<string, BrowserWindow>()
const intercepted = new WeakSet<BrowserWindow>()
const destroying = new WeakSet<BrowserWindow>()
/** Pages that cannot answer a close request: crashed, or busy past Electron's patience. */
const unanswerable = new WeakSet<BrowserWindow>()
const fallbackText = new WeakMap<BrowserWindow, CloseFallbackText>()
const closeAsks = createPageCloseAsks<BrowserWindow>()
let exiting = false

export function windowByLabel(label: string): BrowserWindow | null {
  const window = labels.get(label)
  return window && !window.isDestroyed() ? window : null
}

export function labelOf(window: BrowserWindow): string | undefined {
  for (const [label, known] of labels) if (known === window) return label
  return undefined
}

export function mainContents(): WebContents | null {
  return windowByLabel('main')?.webContents ?? null
}

export function broadcast(event: string, payload?: unknown): void {
  for (const window of BrowserWindow.getAllWindows()) emit(window.webContents, event, payload)
}

/**
 * Gives a window a label and Tauri's close semantics: while the page listens for close
 * requests, closing asks the page, which destroys the window once it agrees.
 */
export function track(window: BrowserWindow, label: string): void {
  labels.set(label, window)
  window.on('close', (event) => {
    if (exiting || destroying.has(window) || !intercepted.has(window)) return
    event.preventDefault()
    askPage(window, 'tauri://close-requested', undefined, () => {
      destroying.add(window)
      window.destroy()
    })
  })
  window.webContents.on('render-process-gone', () => unanswerable.add(window))
  window.on('unresponsive', () => unanswerable.add(window))
  window.on('responsive', () => unanswerable.delete(window))
  window.webContents.on('did-start-loading', () => unanswerable.delete(window))
  window.on('closed', () => {
    if (labels.get(label) === window) labels.delete(label)
    broadcast(`tauri://destroyed:${label}`)
  })
}

/** The native box for a page that cannot draw its own unsaved-changes dialog. */
async function closeWithoutPage(window: BrowserWindow): Promise<boolean> {
  if (window.isDestroyed()) return true
  const text = fallbackText.get(window) ?? DEFAULT_CLOSE_FALLBACK_TEXT
  const { response } = await dialog.showMessageBox(window, {
    type: 'warning',
    message: text.title,
    detail: text.description,
    buttons: [text.closeAnyway, text.cancel],
    defaultId: 1,
    cancelId: 1,
    noLink: true
  })
  return response === 0
}

/**
 * Sends a close or quit request to the page, which answers with its own dialog. A page that
 * does not acknowledge it in time gets the native box instead (`./close-ask`).
 */
function askPage(
  window: BrowserWindow,
  event: string,
  payload: unknown,
  proceed: PageCloseRequest['proceed']
): void {
  closeAsks.ask(window, {
    send: () => {
      if (unanswerable.has(window) || window.webContents.isDestroyed()) return false
      emit(window.webContents, event, payload)
      return true
    },
    fallback: () => closeWithoutPage(window),
    proceed
  })
}

export function markExiting(): void {
  exiting = true
}

/** Quitting with windows open asks the editor first, as a Quit menu click does. */
export function installQuitGuard(): void {
  app.on('before-quit', (event) => {
    if (exiting) return
    const main = windowByLabel('main')
    if (!main || !intercepted.has(main)) return
    event.preventDefault()
    askPage(main, 'menu-event', 'quit', () => {
      markExiting()
      app.quit()
    })
  })
}

function target(context: CallContext, label?: string): BrowserWindow | null {
  return label ? windowByLabel(label) : context.window
}

export function windowHandlers(host: WindowHost) {
  return {
    interceptClose(context: CallContext, on: boolean) {
      if (!context.window) return
      if (on) intercepted.add(context.window)
      else intercepted.delete(context.window)
    },
    /** The page received a close or quit request and is asking the person itself. */
    acknowledgeClose(context: CallContext) {
      if (context.window) closeAsks.acknowledge(context.window)
    },
    /** The page's words for the native box shown when it cannot answer a close request. */
    setCloseFallback(context: CallContext, text: unknown) {
      const parsed = v.safeParse(CloseFallbackText, text)
      if (!parsed.success) throw new Error('Malformed close fallback text')
      if (context.window) fallbackText.set(context.window, parsed.output)
    },
    /** Tauri's `setTheme`: the app's light or dark theme, or `null` for the system's. */
    setTheme(context: CallContext, theme: unknown) {
      const parsed = v.safeParse(TitleBarTheme, theme ?? null)
      if (!parsed.success) throw new Error('Unknown window theme')
      if (!context.window) return
      const resolved = parsed.output ?? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
      applyTitleBarTheme(context.window, resolved)
    },
    close(context: CallContext) {
      context.window?.close()
    },
    destroy(context: CallContext) {
      if (!context.window) return
      destroying.add(context.window)
      context.window.destroy()
    },
    focus(context: CallContext, label?: string) {
      target(context, label)?.focus()
    },
    unminimize(context: CallContext, label?: string) {
      const window = target(context, label)
      if (window?.isMinimized()) window.restore()
    },
    exists(_context: CallContext, label: string) {
      return windowByLabel(label) !== null
    },
    emitTo(_context: CallContext, label: string, event: string, payload?: unknown) {
      const window = windowByLabel(label)
      if (window) emit(window.webContents, event, payload)
    },
    emitAll(_context: CallContext, event: string, payload?: unknown) {
      broadcast(event, payload)
    },
    create(
      context: CallContext,
      label: string,
      options: {
        url?: string
        title?: string
        width?: number
        height?: number
        minWidth?: number
        minHeight?: number
        center?: boolean
        minimizable?: boolean
        maximizable?: boolean
        focus?: boolean
      }
    ) {
      if (windowByLabel(label)) throw new Error(`A window labelled ${label} already exists`)
      // Secondary windows (Software Update) have no tab bar to stand in for a title bar, so
      // they keep the native frame (`./title-bar`).
      const window = new BrowserWindow({
        title: options.title,
        width: options.width,
        height: options.height,
        minWidth: options.minWidth,
        minHeight: options.minHeight,
        center: options.center ?? true,
        minimizable: options.minimizable ?? true,
        maximizable: options.maximizable ?? true,
        parent: context.window ?? undefined,
        webPreferences: {
          preload: host.preload,
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false
        }
      })
      if (process.platform !== 'darwin') window.setMenuBarVisibility(false)
      track(window, label)
      void window.loadURL(host.pageURL(options.url ?? ''))
      if (options.focus ?? true) window.focus()
    }
  }
}

export function registerWindowHandlers(host: WindowHost): void {
  registerAll(windowHandlers(host), 'window')
}
