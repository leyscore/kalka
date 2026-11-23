import { readFiles, type FileKind } from './read-files'

// The shortcut (Alt+Shift+K by default) turns the inspector on or off in the current tab, as
// the popup's button does. The inspector is injected only then, never into every page.
export async function toggleInspector(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({ target: { tabId }, files: ['main.js'] })
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'inspect' || tab?.id === undefined) return
  toggleInspector(tab.id).catch((error: unknown) => {
    console.warn('[Kalka Snapshot] This page cannot be inspected:', error)
  })
})

/** Tabs the extension is showing at another width, through the debugger. */
const emulating = new Set<number>()

chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId !== undefined) emulating.delete(source.tabId)
})

/**
 * Shows a tab's page at `width`, as a screen that wide would, or at its own width again for
 * null. Only the debugger can: a window cannot be made as narrow as a phone.
 */
async function emulateWidth(tabId: number, width: number | null): Promise<void> {
  const target = { tabId }
  if (width === null) {
    if (!emulating.has(tabId)) return
    emulating.delete(tabId)
    try {
      await chrome.debugger.sendCommand(target, 'Emulation.clearDeviceMetricsOverride')
    } finally {
      await chrome.debugger.detach(target)
    }
    return
  }
  if (!emulating.has(tabId)) {
    await chrome.debugger.attach(target, '1.3')
    emulating.add(tabId)
  }
  // A height of 0 keeps the window's own.
  await chrome.debugger.sendCommand(target, 'Emulation.setDeviceMetricsOverride', {
    width,
    height: 0,
    deviceScaleFactor: 0,
    mobile: false
  })
}

interface EmulateMessage {
  type: 'kalka-emulate'
  width: number | null
}

function isEmulateMessage(message: unknown): message is EmulateMessage {
  if (typeof message !== 'object' || message === null) return false
  if (!('type' in message) || message.type !== 'kalka-emulate' || !('width' in message))
    return false
  return message.width === null || typeof message.width === 'number'
}

async function answerEmulate(
  tabId: number,
  width: number | null,
  reply: (answer: { ok: boolean; error?: string }) => void
): Promise<void> {
  try {
    await emulateWidth(tabId, width)
    reply({ ok: true })
  } catch (error) {
    reply({ ok: false, error: String(error) })
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, reply) => {
  const tabId = sender.tab?.id
  if (!isEmulateMessage(message) || tabId === undefined) return false
  void answerEmulate(tabId, message.width, reply)
  // The reply is sent once the page is at its width.
  return true
})

/** A picture of the tab a page asks for, which a content script cannot take itself. */
async function answerShoot(
  windowId: number,
  reply: (answer: { url?: string; error?: string }) => void
): Promise<void> {
  try {
    reply({ url: await chrome.tabs.captureVisibleTab(windowId, { format: 'png' }) })
  } catch (error) {
    reply({ error: String(error) })
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, reply) => {
  const isShoot =
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === 'kalka-shoot'
  const windowId = sender.tab?.windowId
  if (!isShoot || windowId === undefined) return false
  void answerShoot(windowId, reply)
  return true
})

interface ReadMessage {
  type: 'kalka-read'
  urls: string[]
  kind: FileKind
}

function isReadMessage(message: unknown): message is ReadMessage {
  if (typeof message !== 'object' || message === null) return false
  if (!('type' in message) || message.type !== 'kalka-read') return false
  if (!('kind' in message) || (message.kind !== 'text' && message.kind !== 'data')) return false
  return (
    'urls' in message &&
    Array.isArray(message.urls) &&
    message.urls.every((url) => typeof url === 'string' && /^https?:/.test(url))
  )
}

/**
 * Files a page shows but may not fetch again, read through the debugger, which is attached for
 * the time of the reading unless the tab is already shown at another width.
 */
async function answerRead(
  tabId: number,
  message: ReadMessage,
  reply: (answer: { files: Record<string, string> }) => void
): Promise<void> {
  const target = { tabId }
  const attached = emulating.has(tabId)
  try {
    if (!attached) await chrome.debugger.attach(target, '1.3')
    try {
      reply({ files: await readFiles(target, message.urls, message.kind) })
    } finally {
      if (!attached) await chrome.debugger.detach(target).catch(() => undefined)
    }
  } catch {
    reply({ files: {} })
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, reply) => {
  const tabId = sender.tab?.id
  if (!isReadMessage(message) || tabId === undefined) return false
  void answerRead(tabId, message, reply)
  return true
})
