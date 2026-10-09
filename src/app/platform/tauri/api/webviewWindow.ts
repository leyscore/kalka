import { call, native } from '../bridge'
import { TauriEvent, type EventCallback, type UnlistenFn } from './event'

export interface WebviewWindowOptions {
  url?: string
  title?: string
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  center?: boolean
  minimizable?: boolean
  maximizable?: boolean
  dragDropEnabled?: boolean
  focus?: boolean
}

/** Another window of the app, by label. Only what the updater window uses. */
export class WebviewWindow {
  constructor(
    readonly label: string,
    options?: WebviewWindowOptions
  ) {
    if (options) {
      void call('window.create', label, options).catch((error: unknown) => {
        for (const listener of this.errorListeners)
          listener({ event: 'tauri://error', id: 0, payload: String(error) })
      })
    }
  }

  private errorListeners = new Set<EventCallback<unknown>>()

  static async getByLabel(label: string): Promise<WebviewWindow | null> {
    return (await call<boolean>('window.exists', label)) ? new WebviewWindow(label) : null
  }

  unminimize(): Promise<void> {
    return call('window.unminimize', this.label)
  }

  setFocus(): Promise<void> {
    return call('window.focus', this.label)
  }

  async once<T>(event: string, handler: EventCallback<T>): Promise<UnlistenFn> {
    if (event === 'tauri://error') {
      const listener = handler as EventCallback<unknown>
      this.errorListeners.add(listener)
      return () => this.errorListeners.delete(listener)
    }
    // Window lifecycle events are broadcast with the label they concern.
    const name = `${event}:${this.label}`
    const stop = native().on(name, (payload) => {
      stop()
      handler({ event, id: 0, payload: payload as T })
    })
    return stop
  }
}

export { TauriEvent }
