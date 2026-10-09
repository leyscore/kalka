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

/**
 * Calls a main-process handler. Rejects as Tauri does, with the value the handler failed with:
 * a message string, or an object such as `{code, message}`.
 */
export async function call<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
  try {
    return await native().call<T>(name, ...args)
  } catch (error) {
    throw unwrapError(error)
  }
}

/** Electron wraps a handler's error in its own message; the value sits after the marker. */
function unwrapError(error: unknown): unknown {
  const message = error instanceof Error ? error.message : String(error)
  const marker = message.indexOf('KALKA_ERROR:')
  if (marker === -1) return message
  try {
    return JSON.parse(message.slice(marker + 'KALKA_ERROR:'.length)) as unknown
  } catch {
    return message
  }
}
