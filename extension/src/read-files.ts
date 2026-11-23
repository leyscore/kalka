// Reads files for a page through the debugger. A site may refuse to hand the page a file it
// already shows, such as a stylesheet served from another site without the header that shares
// it; the browser itself may load it again, as its developer tools do.

/** What a page asks for: the file's text, or the file as a data URL. */
export type FileKind = 'text' | 'data'

/** Files larger than this are left out: a copy is meant to fit in the clipboard. */
const MAX_FILE_BYTES = 4_000_000
const CHUNK_BYTES = 1_000_000

type Target = chrome.debugger.Debuggee

function field(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) return undefined
  const entry = Object.entries(value).find(([name]) => name === key)
  return entry?.[1]
}

async function chunkBlob(data: string, base64: boolean): Promise<Blob> {
  if (!base64) return new Blob([data])
  return (await fetch(`data:application/octet-stream;base64,${data}`)).blob()
}

/** The whole of a stream the debugger opened, or null when it is longer than allowed. */
async function readStream(target: Target, handle: string): Promise<Blob[] | null> {
  const parts: Blob[] = []
  let size = 0
  try {
    for (;;) {
      const chunk = await chrome.debugger.sendCommand(target, 'IO.read', {
        handle,
        size: CHUNK_BYTES
      })
      const data = field(chunk, 'data')
      if (typeof data === 'string' && data.length > 0) {
        const part = await chunkBlob(data, field(chunk, 'base64Encoded') === true)
        size += part.size
        if (size > MAX_FILE_BYTES) return null
        parts.push(part)
      }
      if (field(chunk, 'eof') === true || typeof data !== 'string') return parts
    }
  } finally {
    await chrome.debugger.sendCommand(target, 'IO.close', { handle }).catch(() => undefined)
  }
}

function asDataURL(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : null)
    })
    reader.addEventListener('error', () => {
      resolve(null)
    })
    reader.readAsDataURL(blob)
  })
}

async function readFile(
  target: Target,
  frameId: string,
  url: string,
  kind: FileKind
): Promise<string | null> {
  const loaded = await chrome.debugger.sendCommand(target, 'Network.loadNetworkResource', {
    frameId,
    url,
    options: { disableCache: false, includeCredentials: false }
  })
  const resource = field(loaded, 'resource')
  const handle = field(resource, 'stream')
  if (field(resource, 'success') !== true || typeof handle !== 'string') return null
  const parts = await readStream(target, handle)
  if (!parts) return null
  const headers = field(resource, 'headers')
  const type = field(headers, 'content-type') ?? field(headers, 'Content-Type')
  const blob = new Blob(parts, { type: typeof type === 'string' ? type : '' })
  return kind === 'text' ? blob.text() : asDataURL(blob)
}

/**
 * The files at `urls`, each as its text or as a data URL, read through a debugger already
 * attached to `target`. A file that cannot be read, or is too large, is left out.
 */
export async function readFiles(
  target: Target,
  urls: readonly string[],
  kind: FileKind
): Promise<Record<string, string>> {
  const tree = await chrome.debugger.sendCommand(target, 'Page.getFrameTree')
  const frameId = field(field(field(tree, 'frameTree'), 'frame'), 'id')
  if (typeof frameId !== 'string') return {}
  const files: Record<string, string> = {}
  await Promise.all(
    urls.map(async (url) => {
      // A file that cannot be read stays out of the answer; the copy keeps its link.
      const file = await readFile(target, frameId, url, kind).catch(() => null)
      if (file !== null) files[url] = file
    })
  )
  return files
}
