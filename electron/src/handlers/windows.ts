import { app, BrowserWindow, dialog, nativeTheme, type WebContents } from 'electron'
import * as v from 'valibot'

import { emit, registerAll, type CallContext } from '../ipc'
import {
  CloseFallbackText,
  createPageCloseAsks,
  DEFAULT_CLOSE_FALLBACK_TEXT,
  type PageCloseRequest
} from './close-ask'
import { createFocusOrder, createQuitSequence, isEditorLabel, nextEditorLabel } from './editors'
import { applyTitleBarTheme, TitleBarTheme } from './title-bar'
import { WindowDocuments, type EditorWindowSummary, type WindowDocument } from './window-list'

/** Tells each editor page whether the MCP server's calls are its own (`src/app/automation/mcp`). */
export const MCP_TARGET_EVENT = 'mcp-target'
/** Tells a page that agreed to quit that another window kept its documents open. */
export const QUIT_CANCELLED_EVENT = 'quit-cancelled'
/** How far a new editor window sits from the one in front, as on macOS. */
const CASCADE_OFFSET = 24

export interface WindowHost {
  /** Opens an editor window with the given label. */
  createWindow(label: string): BrowserWindow
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
const focusOrder = createFocusOrder<BrowserWindow>()
let exiting = false
let openEditorWith: WindowHost['createWindow'] | null = null
/** The editor window the pages were last told holds the MCP server's calls. */
let mcpTarget: BrowserWindow | null = null
/** Each editor's documents, as its page reports them, for the Window menu. */
const documents = new WeakMap<BrowserWindow, WindowDocument[]>()
const editorListeners = new Set<() => void>()

/** Runs `listener` when an editor window opens, closes, comes forward or reports its documents. */
export function onEditorsChanged(listener: () => void): void {
  editorListeners.add(listener)
}

function editorsChanged(): void {
  for (const listener of editorListeners) listener()
}

export function windowByLabel(label: string): BrowserWindow | null {
  const window = labels.get(label)
  return window && !window.isDestroyed() ? window : null
}

export function labelOf(window: BrowserWindow): string | undefined {
  for (const [label, known] of labels) if (known === window) return label
  return undefined
}

function isEditor(window: BrowserWindow): boolean {
  return !window.isDestroyed() && isEditorLabel(labelOf(window))
}

export { isEditor as isEditorWindow }

export function editorWindows(): BrowserWindow[] {
  return BrowserWindow.getAllWindows().filter(isEditor)
}

/** The editor window in front, or the one last in front while another window or app is. */
export function frontEditor(): BrowserWindow | null {
  const focused = BrowserWindow.getFocusedWindow()
  if (focused && isEditor(focused)) return focused
  return focusOrder.latest(isEditor) ?? editorWindows()[0] ?? null
}

/** The editor windows and their documents, for the Window menu here and in each page. */
export function editorWindowSummaries(): EditorWindowSummary[] {
  const front = frontEditor()
  return editorWindows().map((window) => ({
    label: labelOf(window) ?? '',
    front: window === front,
    documents: documents.get(window) ?? []
  }))
}

export function setEditorDocuments(window: BrowserWindow, value: unknown): void {
  const parsed = v.safeParse(WindowDocuments, value)
  if (!parsed.success) throw new Error('Malformed window documents')
  documents.set(window, parsed.output)
  editorsChanged()
}

export function frontEditorContents(): WebContents | null {
  return frontEditor()?.webContents ?? null
}

/** Opens another editor window, a little below and right of the one in front. */
export function openEditorWindow(): BrowserWindow | null {
  if (!openEditorWith) return null
  const from = frontEditor()
  const window = openEditorWith(nextEditorLabel((label) => windowByLabel(label) !== null))
  if (from && !from.isMaximized() && !from.isFullScreen()) {
    const [x, y] = from.getPosition()
    if (x !== undefined && y !== undefined)
      window.setPosition(x + CASCADE_OFFSET, y + CASCADE_OFFSET)
  }
  return window
}

/**
 * The MCP server takes one app connection, so only the editor in front connects; the others
 * let go, and a window that comes forward takes over. `always` also tells a target that did not
 * change, such as after the server stopped with the window that started it.
 */
export function announceMCPTarget(always = true, closing?: BrowserWindow): void {
  const editors = editorWindows().filter((window) => window !== closing)
  const target = frontEditor()
  const next = target && target !== closing ? target : (editors[0] ?? null)
  if (!always && next === mcpTarget) return
  mcpTarget = next
  for (const window of editors) emit(window.webContents, MCP_TARGET_EVENT, window === next)
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
  if (isEditorLabel(label)) {
    focusOrder.focus(window)
    announceMCPTarget()
    window.on('focus', () => {
      if (focusOrder.focus(window)) editorsChanged()
      announceMCPTarget(false)
    })
    editorsChanged()
  }
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
    if (isEditorLabel(label)) {
      focusOrder.remove(window)
      quit.gone(window)
      announceMCPTarget(true, window)
      editorsChanged()
    }
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
  proceed: PageCloseRequest['proceed'],
  declined?: () => void
): void {
  closeAsks.ask(window, {
    send: () => {
      if (unanswerable.has(window) || window.webContents.isDestroyed()) return false
      emit(window.webContents, event, payload)
      return true
    },
    fallback: async () => {
      const closing = await closeWithoutPage(window)
      if (!closing) declined?.()
      return closing
    },
    proceed
  })
}

export function markExiting(): void {
  exiting = true
}

/** An editor window whose page asks about its documents before it closes. */
function asksOnQuit(window: BrowserWindow): boolean {
  return isEditor(window) && intercepted.has(window)
}

function quitAskers(): BrowserWindow[] {
  const inFront = focusOrder.all(asksOnQuit)
  return [
    ...inFront,
    ...editorWindows().filter((window) => asksOnQuit(window) && !inFront.includes(window))
  ]
}

function finishQuit(): void {
  markExiting()
  app.quit()
}

const quit = createQuitSequence<BrowserWindow>({
  editors: quitAskers,
  ask(window) {
    if (window.isMinimized()) window.restore()
    window.show()
    window.focus()
    askPage(
      window,
      'menu-event',
      'quit',
      () => {
        if (!quit.agree(window)) finishQuit()
      },
      () => quit.decline()
    )
  },
  finish: finishQuit,
  cancelled(agreed) {
    for (const window of agreed) emit(window.webContents, QUIT_CANCELLED_EVENT)
  }
})

/** Quitting with windows open asks each editor in turn, as a Quit menu click does. */
export function installQuitGuard(): void {
  app.on('before-quit', (event) => {
    if (exiting || quitAskers().length === 0) return
    event.preventDefault()
    quit.start()
  })
}

/**
 * A page asks to exit once its documents may close. While a quit asks the windows in turn, that
 * is its yes; on its own, as after the in-app Quit, the other editors are asked before the app
 * ends.
 */
export function exitFromPage(window: BrowserWindow | null, code: number): void {
  if (window && quit.agree(window)) return
  if (window && isEditor(window) && quitAskers().some((other) => other !== window)) {
    quit.start(window)
    return
  }
  markExiting()
  app.exit(code)
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
    /** The person kept their documents open: a quit asking the windows in turn stops there. */
    cancelQuit() {
      quit.decline()
    },
    /** Whether the MCP server's calls go to this window (`announceMCPTarget`). */
    isMCPTarget(context: CallContext) {
      return context.window !== null && context.window === (mcpTarget ?? frontEditor())
    },
    /** The labels of the open windows, as Tauri's `getAllWebviewWindows` gives them. */
    labels() {
      return [...labels.entries()]
        .filter(([, window]) => !window.isDestroyed())
        .map(([label]) => label)
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
  openEditorWith = host.createWindow
  registerAll(windowHandlers(host), 'window')
}
