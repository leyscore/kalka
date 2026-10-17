/**
 * Kalka's browser for the command line: an Electron process with no window on screen that lays
 * out and draws pages the way the canvas does, for as long as the CLI runs.
 *
 *   electron dist/render-host.js
 *
 * Requests arrive on stdin and answers leave on stdout, one JSON object per line, each answer
 * carrying its request's `id`; the first line out is `{"ready":true}`. The process exits when
 * stdin closes, so it never outlives the CLI that started it.
 *
 * - `render` draws a page file as PNG, JPG or PDF into `output` and answers `written`, or
 *   `too-large` when the image could not be captured in one piece.
 * - `evaluate` runs a script in a page of its own that stays open between requests and answers
 *   with what the script returns. The page is sandboxed, offline and has no Node: it is where
 *   the CLI lays out its layers as DOM and reads back their boxes.
 */
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

import { app, type BrowserWindow } from 'electron'
import * as v from 'valibot'

import { hiddenWindow, renderPage } from './handlers/raster'

const ColorSchema = v.object({ r: v.number(), g: v.number(), b: v.number(), a: v.number() })

const RenderSchema = v.object({
  id: v.number(),
  type: v.literal('render'),
  file: v.string(),
  output: v.string(),
  width: v.pipe(v.number(), v.minValue(1)),
  height: v.pipe(v.number(), v.minValue(1)),
  scale: v.number(),
  format: v.picklist(['PNG', 'JPG', 'PDF']),
  quality: v.optional(v.number()),
  background: v.optional(ColorSchema)
})

const EvaluateSchema = v.object({
  id: v.number(),
  type: v.literal('evaluate'),
  script: v.string()
})

const RequestSchema = v.variant('type', [RenderSchema, EvaluateSchema])

export type RenderHostRequest = v.InferOutput<typeof RequestSchema>

/** The page `evaluate` scripts run in, made on first use and kept for the process's life. */
const SCRIPT_PAGE = 'data:text/html;charset=utf-8,<!doctype html><html><head></head><body></body></html>'
let scriptWindow: Promise<BrowserWindow> | null = null

function scriptPage(): Promise<BrowserWindow> {
  scriptWindow ??= (async () => {
    const window = hiddenWindow(800, 600)
    await window.loadURL(SCRIPT_PAGE)
    return window
  })()
  return scriptWindow
}

async function answer(request: RenderHostRequest): Promise<unknown> {
  if (request.type === 'evaluate') {
    const window = await scriptPage()
    return window.webContents.executeJavaScript(request.script)
  }
  const { output, ...page } = request
  const bytes = await renderPage(page)
  if (!bytes) return 'too-large'
  await writeFile(output, bytes)
  return 'written'
}

function send(message: object): void {
  process.stdout.write(`${JSON.stringify(message)}\n`)
}

/** Answers one line; requests run one after another, as the CLI waits for each answer. */
async function handle(line: string): Promise<void> {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), RequestSchema), line)
  if (!parsed.success) {
    const id = v.safeParse(
      v.pipe(v.string(), v.parseJson(), v.object({ id: v.number() })),
      line
    )
    send({
      id: id.success ? id.output.id : -1,
      error: `Invalid request: ${v.summarize(parsed.issues)}`
    })
    return
  }
  try {
    send({ id: parsed.output.id, result: (await answer(parsed.output)) ?? null })
  } catch (error) {
    send({ id: parsed.output.id, error: error instanceof Error ? error.message : String(error) })
  }
}

// A profile of its own, so it neither meets an open Kalka's lock nor reads its settings.
app.setPath('userData', await mkdtemp(join(tmpdir(), 'kalka-render-')))
app.dock?.hide()
app.disableHardwareAcceleration()
// No window ever shows, so closing the last one must not end the process.
app.on('window-all-closed', () => {})

void app.whenReady().then(() => {
  let queue = Promise.resolve()
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity })
  lines.on('line', (line) => {
    if (line.trim()) queue = queue.then(() => handle(line))
  })
  lines.on('close', () => void queue.finally(() => app.exit(0)))
  send({ ready: true })
})
