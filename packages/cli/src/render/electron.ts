import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import {
  computeContentBounds,
  renderNodesToHTML,
  type IOContext,
  type NodeRasterRequest
} from '@kalka/core/io'

/** The exit code the render host gives when an image is too large to capture in one piece. */
const TOO_LARGE = 2
const HOST_ENTRY = join('electron', 'dist', 'render-host.js')

type PageRequest = Pick<NodeRasterRequest, 'graph' | 'nodeIds'> & {
  scale: number
  format: 'PNG' | 'JPG' | 'PDF'
  quality?: number
}

/**
 * Electron's executable, from the `electron` package of the desktop app the render host belongs
 * to: its `path.txt` names the executable inside its `dist` folder.
 */
async function electronExecutable(entry: string): Promise<string | null> {
  const electronPackage = join(dirname(entry), '..', 'node_modules', 'electron')
  try {
    const relative = (await readFile(join(electronPackage, 'path.txt'), 'utf8')).trim()
    const path = join(electronPackage, 'dist', relative)
    return existsSync(path) ? path : null
  } catch {
    return null
  }
}

/** The render host the desktop app builds, found from this file up to the repository. */
function hostEntry(): string | null {
  const configured = process.env.KALKA_RENDER_HOST
  if (configured) return existsSync(configured) ? configured : null
  let dir = import.meta.dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = join(dir, HOST_ENTRY)
    if (existsSync(candidate)) return candidate
    dir = dirname(dir)
  }
  return null
}

function runHost(executable: string, entry: string, requestPath: string): Promise<number> {
  return new Promise((resolve) => {
    const env = { ...process.env }
    delete env.ELECTRON_RUN_AS_NODE
    const child = spawn(executable, [entry, requestPath], { env, stdio: 'ignore' })
    child.on('error', () => resolve(1))
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

/**
 * Draws layers as the canvas draws them: the standalone HTML export of the layers, its fonts as
 * files beside it, painted by Chromium in Kalka's render host, an Electron process that shows no
 * window. Null when there is no Electron, or the render fails, so the export uses CanvasKit.
 */
async function renderWithElectron(request: PageRequest): Promise<Uint8Array | null> {
  if (process.env.KALKA_RENDERER === 'canvaskit') return null
  const bounds = computeContentBounds(request.graph, [...request.nodeIds])
  const entry = hostEntry()
  const executable = entry ? await electronExecutable(entry) : null
  if (!bounds || !entry || !executable) return null

  const dir = await mkdtemp(join(tmpdir(), 'kalka-render-'))
  try {
    const { html, assets } = await renderNodesToHTML(
      request.graph,
      [...request.nodeIds],
      { html: 'standalone', assets: 'external', fonts: 'assets', pretty: false },
      'page.html'
    )
    await writeFile(join(dir, 'page.html'), html)
    for (const asset of assets) {
      const path = join(dir, asset.path)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, asset.content)
    }
    const output = join(dir, `out.${request.format.toLowerCase()}`)
    const requestPath = join(dir, 'request.json')
    await writeFile(
      requestPath,
      JSON.stringify({
        file: join(dir, 'page.html'),
        output,
        width: Math.max(1, Math.ceil(bounds.maxX - bounds.minX)),
        height: Math.max(1, Math.ceil(bounds.maxY - bounds.minY)),
        scale: request.scale,
        format: request.format,
        quality: request.quality
      })
    )
    const code = await runHost(executable, entry, requestPath)
    if (code === TOO_LARGE || code !== 0) return null
    return new Uint8Array(await readFile(output))
  } catch {
    return null
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** The CLI's export context: images and PDF through the render host, CanvasKit as fallback. */
export function electronRenderContext(): Pick<IOContext, 'rasterize' | 'printPDF'> {
  return {
    rasterize: (request) =>
      request.format === 'WEBP'
        ? Promise.resolve(null)
        : renderWithElectron({ ...request, format: request.format }),
    printPDF: (request) => renderWithElectron({ ...request, scale: 1, format: 'PDF' })
  }
}
