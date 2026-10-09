import { contextBridge, ipcRenderer } from 'electron'

const CALL_CHANNEL = 'kalka:call'
const EVENT_CHANNEL = 'kalka:event'

type Listener = (payload: unknown) => void
const listeners = new Map<string, Set<Listener>>()

ipcRenderer.on(EVENT_CHANNEL, (_event, name: string, payload: unknown) => {
  for (const listener of listeners.get(name) ?? []) listener(payload)
})

/**
 * The bridge the renderer's `@tauri-apps/*` shims use. Nothing else from Node or Electron
 * reaches the page: every capability is a named handler in the main process.
 */
contextBridge.exposeInMainWorld('kalkaNative', {
  platform: process.platform,
  arch: process.arch,
  systemVersion: process.getSystemVersion(),
  call: (name: string, ...args: unknown[]) => ipcRenderer.invoke(CALL_CHANNEL, name, args),
  on: (name: string, listener: Listener) => {
    let set = listeners.get(name)
    if (!set) listeners.set(name, (set = new Set()))
    set.add(listener)
    return () => set.delete(listener)
  }
})

// The app detects its desktop build by this global, as it did under Tauri.
contextBridge.exposeInMainWorld('__TAURI_INTERNALS__', { kalka: true })
