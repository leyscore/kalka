import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { BrowserWindow, session } from 'electron'

/** Past this many pixels on a side, Chromium cannot capture a page in one piece. */
const MAX_EDGE = 16_384
const PARTITION = 'kalka-raster'
const DEFAULT_JPEG_QUALITY = 92

export interface RenderHTMLImageRequest {
  html: string
  width: number
  height: number
  scale: number
  format: 'PNG' | 'JPG'
  quality?: number
}

let rasterSession: Electron.Session | null = null

/** A session of its own that loads nothing but the page file and the data it inlines. */
function isolatedSession(): Electron.Session {
  if (rasterSession) return rasterSession
  const own = session.fromPartition(PARTITION)
  own.webRequest.onBeforeRequest((details, callback) =>
    callback({ cancel: !/^(?:file|data):/.test(details.url) })
  )
  own.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  rasterSession = own
  return own
}

const SETTLE = `document.fonts.ready
  .then(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => null))))
  .then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))`

/**
 * Draws a standalone page the way the canvas draws it: Chromium lays it out and paints it in a
 * window that is never shown, once its fonts and images are ready. Returns null when the image
 * would be too large to capture, so the export falls back to CanvasKit.
 */
export async function renderHTMLImage(request: RenderHTMLImageRequest): Promise<Uint8Array | null> {
  const scale = request.scale > 0 ? request.scale : 1
  const width = Math.max(1, Math.round(request.width * scale))
  const height = Math.max(1, Math.round(request.height * scale))
  if (width > MAX_EDGE || height > MAX_EDGE) return null

  const dir = await mkdtemp(join(tmpdir(), 'kalka-raster-'))
  const file = join(dir, 'page.html')
  // The page scales itself, so it lays out at its own size and paints at the export's.
  await writeFile(file, request.html.replace('</head>', `<style>html{zoom:${scale}}</style></head>`))
  const window = new BrowserWindow({
    show: false,
    width,
    height,
    useContentSize: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    enableLargerThanScreen: true,
    webPreferences: {
      offscreen: true,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      session: isolatedSession(),
      spellcheck: false,
      backgroundThrottling: false
    }
  })
  try {
    window.setContentSize(width, height)
    await window.loadFile(file)
    await window.webContents.executeJavaScript(SETTLE)
    let image = await window.webContents.capturePage({ x: 0, y: 0, width, height })
    const size = image.getSize()
    if (size.width !== width || size.height !== height) image = image.resize({ width, height })
    const bytes =
      request.format === 'JPG'
        ? image.toJPEG(request.quality ?? DEFAULT_JPEG_QUALITY)
        : image.toPNG()
    return new Uint8Array(bytes)
  } finally {
    window.destroy()
    await rm(dir, { recursive: true, force: true })
  }
}
