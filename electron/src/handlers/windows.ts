import { app, BrowserWindow, type WebContents } from 'electron'

import { emit, registerAll, type CallContext } from '../ipc'

export interface WindowHost {
  createWindow(): BrowserWindow
  /** The page `path` of the app, in development or in the built app. */
  pageURL(path: string): string
  preload: string
}

const labels = new Map<string, BrowserWindow>()
const intercepted = new WeakSet<BrowserWindow>()
const destroying = new WeakSet<BrowserWindow>()
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
    emit(window.webContents, 'tauri://close-requested')
  })
  window.on('closed', () => {
    if (labels.get(label) === window) labels.delete(label)
    broadcast(`tauri://destroyed:${label}`)
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
    emit(main.webContents, 'menu-event', 'quit')
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
