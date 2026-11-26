import { isTauri } from '@/app/tauri/env'

/** Sent by the main process when the editor window in front changes (`electron/src/handlers/windows.ts`). */
const MCP_TARGET_EVENT = 'mcp-target'

let following = false

/**
 * The MCP server takes one app connection, so in the desktop app, where several editor windows
 * can be open, the calls go to the editor in front, or the one last in front while another app
 * is. `apply` hears whether this window is that one, now and on every change. The web app has
 * one editor per tab and always connects.
 */
export function followMCPWindowTarget(apply: (isTarget: boolean) => void): void {
  if (following || !isTauri()) return
  following = true
  void (async () => {
    const [{ listen }, { call }] = await Promise.all([
      import('@tauri-apps/api/event'),
      import('@/app/platform/tauri/bridge')
    ])
    await listen<unknown>(MCP_TARGET_EVENT, ({ payload }) => {
      if (typeof payload === 'boolean') apply(payload)
    })
    apply(await call<boolean>('window.isMCPTarget'))
  })().catch((error: unknown) => console.warn('[MCP] Could not follow the window in front', error))
}
