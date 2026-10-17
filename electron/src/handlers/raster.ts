import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { BrowserWindow, session } from 'electron'

/** Past this many pixels on a side, Chromium cannot capture a page in one piece. */
const MAX_EDGE = 16_384
const PARTITION = 'kalka-raster'
const DEFAULT_JPEG_QUALITY = 92
/** Chromium's PDF page sizes are in inches; CSS pixels are 96 to the inch. */
const PIXELS_PER_INCH = 96

/** A color in 0–1 channels, as the scene graph stores it. */
export interface PageBackground {
  r: number
  g: number
  b: number
  a: number
}

/** A page already written to disk, with the files it refers to beside it. */
export interface RenderPageRequest {
  file: string
  width: number
  height: number
  scale: number
  format: 'PNG' | 'JPG' | 'PDF'
  quality?: number
  /** What the page is drawn on; transparent without, as an export of layers is. */
  background?: PageBackground
}

/** The app's exports: a standalone page as one HTML string. */
export type RenderHTMLRequest = Omit<RenderPageRequest, 'file'> & { html: string }

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

/**
 * The page's own background gives way, the body's included, so the color fills the image. The
 * channels are made numbers whatever arrives, so the rule can only ever set a color.
 */
function backgroundCSS({ r, g, b, a }: PageBackground): string {
  const unit = (value: number) => Math.min(1, Math.max(0, Number(value) || 0))
  const channel = (value: number) => Math.round(unit(value) * 255)
  const color = `rgb(${channel(r)} ${channel(g)} ${channel(b)} / ${unit(a)})`
  return `html{background:${color}!important}body{background:transparent!important}`
}

const SETTLE = `document.fonts.ready
  .then(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => null))))
  .then(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))`

/** A window that is never shown, in the session that loads nothing from the network. */
export function hiddenWindow(width: number, height: number): BrowserWindow {
  return new BrowserWindow({
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
}

/**
 * Draws a page the way the canvas draws it: Chromium lays it out and paints it in a window that
 * is never shown, once its fonts and images are ready, then captures it or prints it to PDF.
 * Returns null when an image would be too large to capture.
 */
export async function renderPage(request: RenderPageRequest): Promise<Uint8Array | null> {
  const scale = request.format === 'PDF' || request.scale <= 0 ? 1 : request.scale
  const width = Math.max(1, Math.round(request.width * scale))
  const height = Math.max(1, Math.round(request.height * scale))
  if (request.format !== 'PDF' && (width > MAX_EDGE || height > MAX_EDGE)) return null

  const window = hiddenWindow(width, height)
  try {
    window.setContentSize(width, height)
    await window.loadFile(request.file)
    // The page scales itself, so it lays out at its own size and paints at the export's.
    if (scale !== 1) await window.webContents.insertCSS(`html{zoom:${scale}}`)
    if (request.background) await window.webContents.insertCSS(backgroundCSS(request.background))
    await window.webContents.executeJavaScript(SETTLE)
    if (request.format === 'PDF') {
      const pdf = await window.webContents.printToPDF({
        printBackground: true,
        pageSize: { width: width / PIXELS_PER_INCH, height: height / PIXELS_PER_INCH },
        margins: { top: 0, right: 0, bottom: 0, left: 0 }
      })
      return new Uint8Array(pdf)
    }
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
  }
}

/** The app's image and PDF exports and `.fig` thumbnails, drawn from one HTML string. */
export async function renderHTMLPage({
  html,
  ...request
}: RenderHTMLRequest): Promise<Uint8Array | null> {
  const dir = await mkdtemp(join(tmpdir(), 'kalka-raster-'))
  const file = join(dir, 'page.html')
  await writeFile(file, html)
  try {
    return await renderPage({ ...request, file })
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
