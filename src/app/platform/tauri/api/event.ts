import { call, native } from '../bridge'

export type UnlistenFn = () => void
export interface Event<T> {
  event: string
  id: number
  payload: T
}
export type EventCallback<T> = (event: Event<T>) => void

export const TauriEvent = {
  WINDOW_DESTROYED: 'tauri://destroyed',
  WINDOW_CLOSE_REQUESTED: 'tauri://close-requested'
} as const

let nextId = 0

/** Events from the main process, and events other windows sent to this one. */
export function listen<T>(event: string, handler: EventCallback<T>): Promise<UnlistenFn> {
  const stop = native().on(event, (payload) =>
    handler({ event, id: ++nextId, payload: payload as T })
  )
  return Promise.resolve(stop)
}

export async function once<T>(event: string, handler: EventCallback<T>): Promise<UnlistenFn> {
  const stop = await listen<T>(event, (received) => {
    stop()
    handler(received)
  })
  return stop
}

/** Sends an event to the window with `label` ('main', 'updater'). */
export function emitTo(label: string, event: string, payload?: unknown): Promise<void> {
  return call('window.emitTo', label, event, payload)
}

export function emit(event: string, payload?: unknown): Promise<void> {
  return call('window.emitAll', event, payload)
}
