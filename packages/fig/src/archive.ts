import { unzipSync } from 'fflate'

import type { NodeChange } from '@open-pencil/kiwi/fig/codec'
import { decodeFigKiwiCanvas } from '@open-pencil/kiwi/fig/parse'

export interface FigParseResult {
  nodeChanges: NodeChange[]
  blobs: Uint8Array[]
  images: Array<[string, Uint8Array]>
  figKiwiVersion: number
  /** Deflated Kiwi schema bytes from the original file, retained for round-trip fidelity. */
  figSchemaDeflated: Uint8Array
}

function isLikelyAsset(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.json')
}

function findCanvasData(entries: Partial<Record<string, Uint8Array>>): Uint8Array | null {
  const canonical = entries['canvas.fig'] ?? entries.canvas
  if (canonical) return canonical

  let largest: Uint8Array | null = null
  for (const [name, data] of Object.entries(entries)) {
    if (!data || isLikelyAsset(name)) continue
    if (!largest || data.byteLength > largest.byteLength) largest = data
  }
  return largest
}

/** Parse a complete zipped `.fig` file into its Figma protocol payload and binary resources. */
export function parseFigBuffer(buffer: ArrayBuffer): FigParseResult {
  const archive = unzipSync(new Uint8Array(buffer), {
    filter: (file) =>
      file.name === 'canvas.fig' ||
      file.name === 'canvas' ||
      (file.name.startsWith('images/') && file.name !== 'images/')
  })
  const canvasData = findCanvasData(archive)
  if (!canvasData) {
    throw new Error(
      `No canvas data found in .fig file. Entries: ${Object.keys(archive).join(', ')}`
    )
  }

  const decoded = decodeFigKiwiCanvas(canvasData)
  const images = Object.entries(archive)
    .filter(([name]) => name.startsWith('images/') && name !== 'images/')
    .map(([name, data]) => [name.slice('images/'.length), data] as [string, Uint8Array])

  return { ...decoded, images }
}
