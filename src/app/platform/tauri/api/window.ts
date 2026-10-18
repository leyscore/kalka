import { call, native } from '../bridge'
import type { UnlistenFn } from './event'

export interface CloseRequestedEvent {
  preventDefault(): void
  isPreventDefault(): boolean
}

/**
 * The window this page runs in. A close request reaches every `onCloseRequested` handler; the
 * window closes unless one of them prevents it, as in Tauri.
 */
class CurrentWindow {
  readonly label = 'current'

  async onCloseRequested(
    handler: (event: CloseRequestedEvent) => void | Promise<void>
  ): Promise<UnlistenFn> {
    await call('window.interceptClose', true)
    const stop = native().on('tauri://close-requested', () => {
      // Tells the main process the page is alive and asking, so it does not fall back to its
      // native box (`electron/src/handlers/close-ask.ts`).
      void call('window.acknowledgeClose')
      let prevented = false
      const event: CloseRequestedEvent = {
        preventDefault: () => {
          prevented = true
        },
        isPreventDefault: () => prevented
      }
      void Promise.resolve(handler(event)).then(() => {
        if (!prevented) return call('window.destroy')
        return undefined
      })
    })
    return () => {
      stop()
      void call('window.interceptClose', false)
    }
  }

  close(): Promise<void> {
    return call('window.close')
  }

  destroy(): Promise<void> {
    return call('window.destroy')
  }

  setFocus(): Promise<void> {
    return call('window.focus')
  }

  unminimize(): Promise<void> {
    return call('window.unminimize')
  }
}

const current = new CurrentWindow()

export function getCurrentWindow(): CurrentWindow {
  return current
}
