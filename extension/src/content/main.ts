// Injected into a page when the person asks to inspect it. Injected again, it turns the
// inspector off, so the shortcut and the popup button both work as a toggle.
import type { CaptureFormat } from './capture'
import { Inspector } from './overlay'

const FORMAT_KEY = 'copyFormat'

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

if (window.kalkaSnapshot) {
  window.kalkaSnapshot.stop()
} else {
  const inspector = new Inspector('kalka', () => {
    window.kalkaSnapshot = undefined
  })
  window.kalkaSnapshot = inspector
  inspector.start()
  void readFormat().then((format) => inspector.setFormat(format))
}
