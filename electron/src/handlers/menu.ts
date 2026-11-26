import { basename, dirname } from 'node:path'

import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'

import appMenuSpec from '../../generated/app-menu.json'
import menuSpec from '../../generated/menu.json'
import { emit } from '../ipc'
import { routeMenuEvent } from './menu-route'
import { openEditor } from './pending'
import { createWindowChecks, windowListGroups } from './window-list'
import {
  editorWindows,
  editorWindowSummaries,
  frontEditor,
  labelOf,
  openEditorWindow,
  windowByLabel
} from './windows'

/** Entries of the menu the app's menu schema generates (`bun run generate:tauri-menu`). */
interface Entry {
  type?: 'separator'
  id?: string
  label?: string
  accelerator?: string
  checkbox?: boolean
  sub?: Entry[]
}
interface Group {
  label: string
  items: Entry[]
}
interface AppMenuEntry {
  label: string
  accelerator?: string
}

const NATIVE_EDIT = new Map<string, MenuItemConstructorOptions['role']>([
  ['copy', 'copy'],
  ['cut', 'cut'],
  ['paste', 'paste']
])
/** The Window menu's own items, which the system carries out. Zoom and Bring All to Front are the Mac's. */
const NATIVE_WINDOW = new Map<string, MenuItemConstructorOptions['role']>([
  ['window-minimize', 'minimize'],
  ['window-zoom', 'zoom'],
  ['window-front', 'front']
])
const MAC_ONLY = new Set(['window-zoom', 'window-front'])
/** Expands to each editor window's documents (`windowListGroups`). */
const WINDOW_LIST_ID = 'window-list'
/** Tells each editor page its own label and every editor's documents, for its own Window menu. */
export const EDITOR_WINDOWS_EVENT = 'editor-windows'
/** Asks an editor page to show one of its tabs, chosen in the Window menu. */
export const SHOW_TAB_EVENT = 'show-tab'
/** A window whose page has not reported its documents yet. */
const UNNAMED_WINDOW = 'Kalka'
/** Coalesces a burst of changes, such as a rename typed letter by letter, into one rebuild. */
const REFRESH_DELAY_MS = 50

let recentFiles: string[] = []
const checks = createWindowChecks<BrowserWindow>()
let refreshTimer: ReturnType<typeof setTimeout> | null = null

/** A click reaches the editor as Tauri's `menu-event`, with the item id (`routeMenuEvent`). */
function send(id: string): void {
  const route = routeMenuEvent(id, BrowserWindow.getFocusedWindow(), frontEditor())
  if (route.kind === 'send') emit(route.window.webContents, 'menu-event', id)
  else if (route.kind === 'close') route.window.close()
  else if (route.kind === 'new-window') openEditorWindow()
  else openEditor()
}

function recentSubmenu(): MenuItemConstructorOptions {
  const items: MenuItemConstructorOptions[] = recentFiles.map((path, index) => ({
    label: `${basename(path)} — ${basename(dirname(path))}`,
    click: () => send(`open-recent:${index}`)
  }))
  if (items.length > 0)
    items.push(
      { type: 'separator' },
      { label: 'Clear Menu', click: () => send('clear-recent-files') }
    )
  return { id: 'open-recent', label: 'Open Recent', enabled: items.length > 0, submenu: items }
}

/** Shows the chosen document: its window comes forward and switches to its tab. */
function showDocument(windowLabel: string, documentId: string): void {
  const window = windowByLabel(windowLabel)
  if (!window) return
  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
  if (documentId) emit(window.webContents, SHOW_TAB_EVENT, documentId)
}

function windowList(): MenuItemConstructorOptions[] {
  const groups = windowListGroups(editorWindowSummaries(), UNNAMED_WINDOW)
  return groups.flatMap((group, index) => [
    ...(index > 0 ? [{ type: 'separator' as const }] : []),
    ...group.map((document): MenuItemConstructorOptions => ({
      label: document.label,
      type: 'checkbox',
      checked: document.checked,
      click: () => showDocument(document.windowLabel, document.documentId)
    }))
  ])
}

function items(entry: Entry): MenuItemConstructorOptions[] {
  if (entry.id === WINDOW_LIST_ID) return windowList()
  if (entry.id && MAC_ONLY.has(entry.id) && process.platform !== 'darwin') return []
  return [item(entry)]
}

function item(entry: Entry): MenuItemConstructorOptions {
  if (entry.type === 'separator') return { type: 'separator' }
  const id = entry.id ?? ''
  if (id === 'open-recent') return recentSubmenu()
  if (entry.sub) return { label: entry.label, submenu: entry.sub.flatMap(items) }
  const windowRole = NATIVE_WINDOW.get(id)
  if (windowRole) return { role: windowRole, label: entry.label }
  const role = NATIVE_EDIT.get(id)
  if (role && process.platform !== 'linux') return { role, label: entry.label }
  const native: MenuItemConstructorOptions = {
    id,
    label: entry.label,
    accelerator: role ? undefined : entry.accelerator,
    click: () => send(id)
  }
  if (entry.checkbox) {
    native.type = 'checkbox'
    native.checked = checks.get(frontEditor(), id) ?? true
    native.click = (menuItem) => {
      const editor = frontEditor()
      if (editor) checks.set(editor, id, menuItem.checked)
      send(id)
    }
  }
  return native
}

function appMenu(): MenuItemConstructorOptions {
  const spec = appMenuSpec as Record<string, AppMenuEntry>
  return {
    label: app.name,
    submenu: [
      { role: 'about', label: spec.about?.label },
      { label: spec['check-updates']?.label, click: () => send('check-updates') },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      // Quitting goes through the quit guard, which asks the editor or, failing that, natively.
      { label: spec.quit?.label, accelerator: spec.quit?.accelerator, click: () => app.quit() }
    ]
  }
}

export function buildMenu(): void {
  const groups = (menuSpec as Group[]).map((group) => ({
    label: group.label,
    submenu: group.items.flatMap(items)
  }))
  const template: MenuItemConstructorOptions[] =
    process.platform === 'darwin' ? [appMenu(), ...groups] : groups
  if (!app.isPackaged)
    template.push({ label: 'Develop', submenu: [{ role: 'toggleDevTools' }, { role: 'reload' }] })
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

export function setRecentFiles(paths: string[]): void {
  recentFiles = paths
  buildMenu()
}

/** A page's check item: shown at once when its window is the editor in front. */
export function setChecked(window: BrowserWindow | null, id: string, value: boolean): void {
  const menuItem = Menu.getApplicationMenu()?.getMenuItemById(id)
  if (!menuItem) throw new Error(`No menu item ${id}`)
  if (menuItem.type !== 'checkbox') throw new Error(`Menu item ${id} is not a check item`)
  if (!window) return
  checks.set(window, id, value)
  if (window === frontEditor()) menuItem.checked = value
}

/**
 * An editor opened, closed, came forward or changed its documents: the Window menu lists them
 * again, the check items show those of the editor in front, and every editor's own Window menu
 * is told.
 */
export function refreshWindowMenu(): void {
  if (refreshTimer) return
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    buildMenu()
    const windows = editorWindowSummaries()
    for (const window of editorWindows())
      emit(window.webContents, EDITOR_WINDOWS_EVENT, { current: labelOf(window), windows })
  }, REFRESH_DELAY_MS)
}
