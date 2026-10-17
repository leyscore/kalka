/**
 * Kalka's renderer for the command line: an Electron process with no window on screen that draws
 * a standalone page the way the canvas draws it, as PNG, JPG or PDF, and exits.
 *
 *   electron dist/render-host.js <request.json>
 *
 * The request names the page file and the output file (`RenderHostRequest`); the process exits
 * 0 once it wrote the output, 2 when the image would be too large to capture, 1 on failure.
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { app } from 'electron'
import * as v from 'valibot'

import { renderPage } from './handlers/raster'

const RequestSchema = v.object({
  file: v.string(),
  output: v.string(),
  width: v.pipe(v.number(), v.minValue(1)),
  height: v.pipe(v.number(), v.minValue(1)),
  scale: v.number(),
  format: v.picklist(['PNG', 'JPG', 'PDF']),
  quality: v.optional(v.number())
})

export type RenderHostRequest = v.InferOutput<typeof RequestSchema>

const TOO_LARGE = 2

async function run(path: string): Promise<number> {
  const parsed = v.safeParse(
    v.pipe(v.string(), v.parseJson(), RequestSchema),
    await readFile(path, 'utf8')
  )
  if (!parsed.success) throw new Error(`Invalid render request: ${v.summarize(parsed.issues)}`)
  const bytes = await renderPage(parsed.output)
  if (!bytes) return TOO_LARGE
  await writeFile(parsed.output.output, bytes)
  return 0
}

// A profile of its own, so it neither meets an open Kalka's lock nor reads its settings.
app.setPath('userData', await mkdtemp(join(tmpdir(), 'kalka-render-')))
app.dock?.hide()
app.disableHardwareAcceleration()

void app.whenReady().then(async () => {
  const path = process.argv.at(-1)
  try {
    if (!path?.endsWith('.json')) throw new Error('Usage: render-host <request.json>')
    app.exit(await run(path))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    app.exit(1)
  }
})
