/**
 * The desktop bridge Electron's preload exposes. The modules next to this file stand in for
 * `@tauri-apps/*` (see `vite/aliases.ts`), so the app keeps its Tauri-shaped calls while the
 * work happens in Electron's main process (`electron/src/handlers`).
 */
export interface KalkaNative {
  platform: string
  arch: string
  systemVersion: string
  call<T = unknown>(name: string, ...args: unknown[]): Promise<T>
  on(event: string, listener: (payload: unknown) => void): () => void
}

declare global {
  interface Window {
    kalkaNative?: KalkaNative
  }
}

export function native(): KalkaNative {
  const bridge = window.kalkaNative
  if (!bridge) throw new Error('The desktop bridge is not available in this window')
  return bridge
}

/** The main process answers every call with its value or the value it failed with. */
type CallResult = { ok: true; value: unknown } | { ok: false; error: unknown }

function isCallResult(value: unknown): value is CallResult {
  return typeof value === 'object' && value !== null && 'ok' in value
}

/**
 * Calls a main-process handler. Rejects as Tauri does, with the value the handler failed with:
 * a message string, or an object such as `{code, message}`.
 */
export async function call<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
  const result: unknown = await native().call(name, ...args)
  if (!isCallResult(result)) throw new Error(`Malformed reply to ${name}`)
  // Rethrows the handler's own value, as Tauri rejects with it.
  // oxlint-disable-next-line no-throw-literal
  if (!result.ok) throw result.error
  return result.value as T
}
