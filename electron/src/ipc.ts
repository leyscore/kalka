import { ipcMain, type BrowserWindow, type WebContents } from 'electron'

/**
 * One request channel and one event channel between the editor and the main process.
 * The renderer's `@tauri-apps/*` shims call `kalka:call` with a handler name; the main process
 * pushes events (menu clicks, file opens, file watches, child process output) on `kalka:event`.
 */
export const CALL_CHANNEL = 'kalka:call'
export const EVENT_CHANNEL = 'kalka:event'

export interface CallContext {
  sender: WebContents
  window: BrowserWindow | null
}

export type Handler = (context: CallContext, ...args: never[]) => unknown

const handlers = new Map<string, Handler>()

export function handle(name: string, handler: Handler): void {
  if (handlers.has(name)) throw new Error(`Handler ${name} is already registered`)
  handlers.set(name, handler)
}

export function registerAll(group: Record<string, Handler>, prefix: string): void {
  for (const [name, handler] of Object.entries(group)) handle(`${prefix}.${name}`, handler)
}

export function installIPC(windowOf: (sender: WebContents) => BrowserWindow | null): void {
  ipcMain.handle(CALL_CHANNEL, async (event, name: unknown, args: unknown) => {
    if (typeof name !== 'string' || !Array.isArray(args)) throw new Error('Malformed call')
    const handler = handlers.get(name)
    if (!handler) throw new Error(`Unknown native call: ${name}`)
    const context: CallContext = { sender: event.sender, window: windowOf(event.sender) }
    try {
      return await (handler as (context: CallContext, ...rest: unknown[]) => unknown)(
        context,
        ...args
      )
    } catch (error) {
      // Tauri rejects with the value a command returned as its error; carry it over intact.
      const value =
        error instanceof NativeError
          ? error.value
          : error instanceof Error
            ? error.message
            : String(error)
      throw new Error(`KALKA_ERROR:${JSON.stringify(value)}`)
    }
  })
}

/** An error whose value reaches the page as is, such as `{code, message}`. */
export class NativeError extends Error {
  constructor(readonly value: unknown) {
    super(typeof value === 'string' ? value : JSON.stringify(value))
  }
}

export function emit(target: WebContents, event: string, payload?: unknown): void {
  if (!target.isDestroyed()) target.send(EVENT_CHANNEL, event, payload)
}
