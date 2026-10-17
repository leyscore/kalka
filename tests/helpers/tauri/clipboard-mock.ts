import type { Page } from '@playwright/test'

type ClipboardWrite = {
  args: unknown
  cmd: string
}

export type TauriClipboardSnapshot = {
  html: string
  text: string
  writes: ClipboardWrite[]
}

export type TauriClipboardMock = {
  rejectHTMLWrites: () => void
  snapshot: () => TauriClipboardSnapshot
}

const NATIVE_BINDING = '__playwrightKalkaNative'

/**
 * What the desktop app's main-process handlers return on a machine with no pending files or
 * rooms and no stored credentials. Any other call fails the spec, so a new one is noticed.
 */
const APP_CALL_RESULTS: Record<string, unknown> = {
  'command.take_pending_open': [],
  'command.take_pending_rooms': [],
  'command.credential_status': 'missing',
  'command.set_native_menu_checked': null,
  'window.interceptClose': null,
  'process.exit': null,
  'process.relaunch': null
}

/**
 * Stands in for the bridge Electron's preload exposes (`electron/src/preload.ts`), so the page
 * runs as the desktop app and its clipboard goes through the main process, recorded here.
 */
export async function installTauriClipboardMock(page: Page): Promise<TauriClipboardMock> {
  const state: TauriClipboardSnapshot = {
    text: '',
    html: '',
    writes: []
  }
  let rejectHTMLWrites = false

  await page.exposeBinding(NATIVE_BINDING, (_, cmd: string, args: unknown[] = []) => {
    state.writes.push({ cmd, args })
    switch (cmd) {
      case 'clipboard.writeHtml': {
        if (rejectHTMLWrites) throw new Error('Clipboard write failed')
        state.html = String(args[0] ?? '')
        state.text = String(args[1] || state.html)
        return null
      }
      case 'clipboard.writeText': {
        state.text = String(args[0] ?? '')
        state.html = ''
        return null
      }
      case 'clipboard.readText':
        return state.html || state.text
      default:
        if (Object.hasOwn(APP_CALL_RESULTS, cmd)) return APP_CALL_RESULTS[cmd]
        throw new Error(`Unexpected desktop call: ${cmd}`)
    }
  })

  await page.addInitScript((bindingName) => {
    const binding: unknown = Reflect.get(globalThis, bindingName)
    if (typeof binding !== 'function')
      throw new Error(`Playwright binding not found: ${bindingName}`)
    const call = binding as (cmd: string, args: unknown[]) => Promise<unknown>
    Object.defineProperty(window, 'kalkaNative', {
      configurable: true,
      value: {
        platform: 'darwin',
        arch: 'arm64',
        systemVersion: '15.0.0',
        call: (name: string, ...args: unknown[]) => call(name, args),
        on: () => () => undefined
      }
    })
    // The app detects its desktop build by this global (`IS_TAURI`).
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: { kalka: true }
    })
  }, NATIVE_BINDING)

  return {
    rejectHTMLWrites: () => {
      rejectHTMLWrites = true
    },
    snapshot: () => structuredClone(state)
  }
}
