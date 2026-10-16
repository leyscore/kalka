import { basename, dirname } from 'node:path'

import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'

import appMenuSpec from '../../generated/app-menu.json'
import menuSpec from '../../generated/menu.json'
import { emit } from '../ipc'

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

let recentFiles: string[] = []
const checked = new Map<string, boolean>()

/** Every click reaches the focused window as Tauri's `menu-event`, with the item id. */
function send(id: string): void {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  if (window) emit(window.webContents, 'menu-event', id)
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

function item(entry: Entry): MenuItemConstructorOptions {
  if (entry.type === 'separator') return { type: 'separator' }
  const id = entry.id ?? ''
  if (id === 'open-recent') return recentSubmenu()
  if (entry.sub) return { label: entry.label, submenu: entry.sub.map(item) }
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
    native.checked = checked.get(id) ?? true
    native.click = (menuItem) => {
      checked.set(id, menuItem.checked)
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
      { label: spec.quit?.label, accelerator: spec.quit?.accelerator, click: () => send('quit') }
    ]
  }
}

export function buildMenu(): void {
  const groups = (menuSpec as Group[]).map((group) => ({
    label: group.label,
    submenu: group.items.map(item)
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

export function setChecked(id: string, value: boolean): void {
  const menuItem = Menu.getApplicationMenu()?.getMenuItemById(id)
  if (!menuItem) throw new Error(`No menu item ${id}`)
  if (menuItem.type !== 'checkbox') throw new Error(`Menu item ${id} is not a check item`)
  checked.set(id, value)
  menuItem.checked = value
}
