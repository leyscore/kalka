import { unzipSync } from 'fflate'

import { initCodec, decodeMessage } from '../kiwi/codec'
import { importNodeChanges } from './fig-import'

import type { SceneGraph } from './scene-graph'

/**
 * Parse a .fig file into a SceneGraph.
 *
 * A .fig file is a ZIP archive containing:
 * - `canvas.fig` or similar blob: Kiwi-encoded document state
 * - `thumbnail.png`: preview image
 * - `meta.json`: file metadata
 *
 * The Kiwi payload is a serialized Message with nodeChanges.
 */
export async function parseFigFile(buffer: ArrayBuffer): Promise<SceneGraph> {
  await initCodec()

  const zip = unzipSync(new Uint8Array(buffer))
  const entries = Object.keys(zip)

  // Find the Kiwi-encoded canvas data
  // .fig files may have various structures; the binary blob is typically the largest non-image file
  let canvasData: Uint8Array | null = null

  // Try known names first
  for (const name of entries) {
    if (name === 'canvas.fig' || name === 'canvas') {
      canvasData = zip[name]
      break
    }
  }

  // Fallback: find the largest binary file that's not an image/json
  if (!canvasData) {
    let maxSize = 0
    for (const name of entries) {
      const lower = name.toLowerCase()
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.json')) continue
      if (zip[name].byteLength > maxSize) {
        maxSize = zip[name].byteLength
        canvasData = zip[name]
      }
    }
  }

  if (!canvasData) {
    throw new Error(`No canvas data found in .fig file. Entries: ${entries.join(', ')}`)
  }

  // Decode the Kiwi message
  const message = decodeMessage(canvasData)
  const nodeChanges = message.nodeChanges
  if (!nodeChanges || nodeChanges.length === 0) {
    throw new Error('No nodes found in .fig file')
  }

  const blobs: Uint8Array[] = ((message as unknown as Record<string, unknown>).blobs as Array<{ bytes: Uint8Array }> ?? [])
    .map((b) => b.bytes instanceof Uint8Array ? b.bytes : new Uint8Array(Object.values(b.bytes) as number[]))

  return importNodeChanges(nodeChanges, blobs)
}

/**
 * Read a .fig File object and parse it
 */
export async function readFigFile(file: File): Promise<SceneGraph> {
  const buffer = await file.arrayBuffer()
  return parseFigFile(buffer)
}
