// Injected into a page when the person asks to inspect it. Injected again, it turns the
// inspector off, so the shortcut and the popup button both work as a toggle.
import type { BreakpointKey, Emulate } from './breakpoints'
import type { CaptureFormat } from './capture'
import { Inspector } from './overlay'

const FORMAT_KEY = 'copyFormat'
const BREAKPOINTS_KEY = 'breakpoints'

declare global {
  interface Window {
    kalkaSnapshot?: Inspector
  }
}

async function readFormat(): Promise<CaptureFormat> {
  try {
    const stored = await chrome.storage.local.get(FORMAT_KEY)
    return stored[FORMAT_KEY] === 'html' ? 'html' : 'kalka'
  } catch {
    return 'kalka'
  }
}

async function readBreakpoints(): Promise<string[]> {
  try {
    const stored = await chrome.storage.local.get(BREAKPOINTS_KEY)
    const keys: unknown = stored[BREAKPOINTS_KEY]
    return Array.isArray(keys) ? keys.filter((key) => typeof key === 'string') : []
  } catch {
    return []
  }
}

function saveBreakpoints(keys: BreakpointKey[]): void {
  void chrome.storage.local.set({ [BREAKPOINTS_KEY]: keys }).catch(() => undefined)
}

/** Asks the extension's worker to show this tab at a width; only it can reach the debugger. */
const emulate: Emulate = async (width) => {
  const reply: unknown = await chrome.runtime.sendMessage({ type: 'kalka-emulate', width })
  const ok = typeof reply === 'object' && reply !== null && 'ok' in reply && reply.ok === true
  if (!ok) throw new Error('The page could not be shown at another width.')
}

if (window.kalkaSnapshot) {
  window.kalkaSnapshot.stop()
} else {
  const inspector = new Inspector(
    'kalka',
    () => {
      window.kalkaSnapshot = undefined
    },
    { emulate, save: saveBreakpoints }
  )
  window.kalkaSnapshot = inspector
  inspector.start()
  void readFormat().then((format) => inspector.setFormat(format))
  void readBreakpoints().then((keys) => inspector.setBreakpoints(keys))
}
