#!/usr/bin/env bun
/**
 * Compares Kalka's layout and paint of a `.fig` frame with the geometry Figma saved in the file.
 *
 *   bun tools/generate/visual-oracles/src/cli.ts compare stored --file design.fig --node 0:6 [--node 0:7]
 *     [--output /tmp/kalka-stored-oracle] [--top 25] [--skip-oracle]
 *
 * For each node it writes, under `<output>/<node>/`:
 *   oracle.png — the saved positions and sizes drawn with CanvasKit (`KALKA_LAYOUT=stored`)
 *   kalka.png  — the browser's layout painted by the browser, as the canvas shows it
 *   side.png   — both side by side, diff.png — changed pixels in red
 *   layers.json — every layer whose own offset or size differs from the saved one
 * and prints the share of differing pixels and the layers that moved or resized the most.
 */

import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { $ } from 'bun'
import * as v from 'valibot'

const { values } = parseArgs({
  options: {
    file: { type: 'string', short: 'f' },
    node: { type: 'string', short: 'n', multiple: true },
    output: { type: 'string', short: 'o', default: '/tmp/kalka-stored-oracle' },
    top: { type: 'string', default: '25' },
    fuzz: { type: 'string', default: '10%' },
    'skip-oracle': { type: 'boolean', default: false }
  }
})

const file = values.file
const nodes = values.node ?? []
if (!file || nodes.length === 0) {
  console.error(
    'Usage: bun tools/generate/visual-oracles/src/cli.ts compare stored --file design.fig --node ID [--node ID]'
  )
  process.exit(1)
}
const filePath = resolve(file)
const outputDir = resolve(values.output)
const top = Number(values.top)

const LayerSchema = v.object({
  id: v.string(),
  name: v.string(),
  type: v.string(),
  parent: v.nullable(v.string()),
  x: v.number(),
  y: v.number(),
  width: v.number(),
  height: v.number()
})
type Layer = v.InferOutput<typeof LayerSchema>
const PointSchema = v.object({ x: v.number(), y: v.number() })
const CaptureSchema = v.pipe(
  v.string(),
  v.parseJson(),
  v.object({ layers: v.array(LayerSchema), origin: v.nullable(PointSchema) })
)
type Capture = v.InferOutput<typeof CaptureSchema>

/** Lists the root and its visible descendants with their absolute bounds, through `kalka eval`. */
function layerScript(rootId: string): string {
  return `
const out = []
let left = Infinity
let top = Infinity
const visit = (node, parent) => {
  if (node.visible === false) return
  const drawn = node.absoluteRenderBounds
  if (drawn) {
    left = Math.min(left, drawn.x)
    top = Math.min(top, drawn.y)
  }
  const box = node.absoluteBoundingBox
  if (box) out.push({ id: node.id, name: node.name, type: node.type, parent, x: box.x, y: box.y, width: box.width, height: box.height })
  for (const child of node.children ?? []) visit(child, node.id)
}
const root = figma.getNodeById(${JSON.stringify(rootId)})
if (root) visit(root, null)
// An export draws every layer inside the root, clipped or not, so its image starts here.
return JSON.stringify({ layers: out, origin: Number.isFinite(left) ? { x: left, y: top } : null })
`
}

const STORED_ENV = { ...process.env, KALKA_LAYOUT: 'stored', KALKA_RENDERER: 'canvaskit' }

async function readLayers(rootId: string, stored: boolean): Promise<Capture> {
  const result = await $`bun kalka eval ${filePath} --json -c ${layerScript(rootId)}`
    .env(stored ? STORED_ENV : process.env)
    .quiet()
  const text = v.safeParse(v.pipe(v.string(), v.parseJson(), v.string()), result.stdout.toString())
  if (!text.success) throw new Error(`kalka eval returned no layer list for ${rootId}`)
  const layers = v.safeParse(CaptureSchema, text.output)
  if (!layers.success) throw new Error(`kalka eval returned malformed layers for ${rootId}`)
  return layers.output
}

interface LayerDifference {
  id: string
  name: string
  type: string
  /** How far the layer moved relative to its parent, in pixels. */
  offset: number
  /** How much its width and height changed, in pixels. */
  size: number
  stored: string
  laidOut: string
}

function box(layer: Layer): string {
  return `${Math.round(layer.x)},${Math.round(layer.y)} ${Math.round(layer.width)}×${Math.round(layer.height)}`
}

/** Differences each layer introduces itself: its offset within its parent and its own size. */
function compareLayers(stored: Layer[], laidOut: Layer[]): LayerDifference[] {
  const storedById = new Map(stored.map((layer) => [layer.id, layer]))
  const laidOutById = new Map(laidOut.map((layer) => [layer.id, layer]))
  const differences: LayerDifference[] = []
  for (const after of laidOut) {
    const before = storedById.get(after.id)
    if (!before) continue
    const parentBefore = before.parent ? storedById.get(before.parent) : undefined
    const parentAfter = after.parent ? laidOutById.get(after.parent) : undefined
    const dx = after.x - (parentAfter?.x ?? 0) - (before.x - (parentBefore?.x ?? 0))
    const dy = after.y - (parentAfter?.y ?? 0) - (before.y - (parentBefore?.y ?? 0))
    const offset = Math.hypot(dx, dy)
    const size = Math.abs(after.width - before.width) + Math.abs(after.height - before.height)
    if (offset < 1 && size < 1) continue
    differences.push({
      id: after.id,
      name: after.name,
      type: after.type,
      offset,
      size,
      stored: box(before),
      laidOut: box(after)
    })
  }
  return differences.toSorted((a, b) => b.offset + b.size - (a.offset + a.size))
}

async function imageSize(path: string): Promise<string> {
  return (await $`magick identify -format '%wx%h' ${path}`.quiet()).text().trim()
}

/**
 * Crops both images to the root layer. The oracle's image holds every layer inside the root,
 * clipped or not, so the root sits where the first drawn layer starts; Kalka's page puts the root
 * at its origin.
 */
async function compareImages(directory: string, stored: Capture, laidOut: Capture) {
  const [storedRoot] = stored.layers
  const [laidOutRoot] = laidOut.layers
  if (!storedRoot || !laidOutRoot) throw new Error('The root layer is missing')
  const left = Math.round(storedRoot.x - Math.min(stored.origin?.x ?? storedRoot.x, storedRoot.x))
  const top = Math.round(storedRoot.y - Math.min(stored.origin?.y ?? storedRoot.y, storedRoot.y))
  const crop = (layer: Layer, x: number, y: number) =>
    `${Math.round(layer.width)}x${Math.round(layer.height)}+${x}+${y}`
  const oracle = `${directory}/oracle-root.png`
  const kalka = `${directory}/kalka-root.png`
  const normalized = `${directory}/kalka-normalized.png`
  await $`magick ${directory}/oracle.png -crop ${crop(storedRoot, left, top)} +repage ${oracle}`.quiet()
  await $`magick ${directory}/kalka.png -crop ${crop(laidOutRoot, 0, 0)} +repage ${kalka}`.quiet()
  const oracleSize = await imageSize(oracle)
  const kalkaSize = await imageSize(kalka)
  await $`magick ${kalka} -background black -gravity northwest -extent ${oracleSize} ${normalized}`.quiet()
  const difference =
    await $`magick compare -metric AE -fuzz ${values.fuzz} ${oracle} ${normalized} null:`
      .quiet()
      .nothrow()
  const changed = Number.parseFloat(difference.stderr.toString().trim()) || 0
  const [width = 1, height = 1] = oracleSize.split('x').map(Number)
  await $`magick compare -fuzz ${values.fuzz} -highlight-color red -lowlight-color '#FFFFFF22' ${oracle} ${normalized} ${directory}/diff.png`
    .quiet()
    .nothrow()
  await $`magick ${oracle} ${kalka} -background '#808080' -splice 8x0 +append ${directory}/side.png`.quiet()
  return { oracleSize, kalkaSize, differentPercent: (changed / (width * height)) * 100 }
}

mkdirSync(outputDir, { recursive: true })
const summary = []
for (const node of nodes) {
  const directory = `${outputDir}/${node.replaceAll(/[^0-9A-Za-z]+/g, '_')}`
  mkdirSync(directory, { recursive: true })
  if (!values['skip-oracle']) {
    await $`bun kalka export ${filePath} --node ${node} -f png -o ${directory}/oracle.png`
      .env(STORED_ENV)
      .quiet()
  }
  await $`bun kalka export ${filePath} --node ${node} -f png -o ${directory}/kalka.png`.quiet()
  const stored = await readLayers(node, true)
  const laidOut = await readLayers(node, false)
  const images = await compareImages(directory, stored, laidOut)
  const differences = compareLayers(stored.layers, laidOut.layers)
  await Bun.write(`${directory}/layers.json`, `${JSON.stringify(differences, null, 2)}\n`)
  summary.push({ node, ...images, movedLayers: differences.length })
  console.log(
    `${node}: ${images.differentPercent.toFixed(2)}% pixels differ (fuzz ${values.fuzz}), oracle ${images.oracleSize}, kalka ${images.kalkaSize}, ${differences.length} layers moved or resized`
  )
  for (const difference of differences.slice(0, top)) {
    console.log(
      `  ${difference.id.padEnd(10)} ${difference.type.padEnd(10)} Δpos ${difference.offset.toFixed(0).padStart(5)} Δsize ${difference.size.toFixed(0).padStart(5)}  ${difference.stored} → ${difference.laidOut}  ${difference.name.slice(0, 40)}`
    )
  }
}
await Bun.write(`${outputDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`)
