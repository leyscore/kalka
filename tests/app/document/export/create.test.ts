import { describe, expect, test } from 'bun:test'

import { strFromU8, unzipSync } from 'fflate'
import { toUint8Array } from 'js-base64'

import { createEditor } from '@kalka/core/editor'
import { BUILTIN_IO_FORMATS, IORegistry } from '@kalka/core/io'
import { computeImageHash } from '@kalka/scene-graph/images'

import { createDocumentExportActions } from '@/app/document/export/create'
import type { ExportOptions } from '@/app/document/export/types'

/** A 1 × 1 PNG. */
const PIXEL = toUint8Array(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
)
const HASH = computeImageHash(PIXEL)

interface Download {
  data: Uint8Array
  filename: string
  mime: string
}

/** Exports a photo layer as HTML and returns what the browser was handed to download. */
async function exportPhoto(options?: ExportOptions): Promise<Download[]> {
  const editor = createEditor()
  editor.graph.images.set(HASH, PIXEL)
  const photo = editor.graph.createNode('RECTANGLE', editor.state.currentPageId, {
    name: 'Team photo',
    width: 40,
    height: 40,
    fills: [
      {
        type: 'IMAGE',
        imageHash: HASH,
        imageScaleMode: 'FILL',
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true
      }
    ]
  })
  const downloads: Download[] = []
  const actions = createDocumentExportActions(
    editor,
    editor.state,
    new IORegistry(BUILTIN_IO_FORMATS),
    (data, filename, mime) => downloads.push({ data, filename, mime })
  )
  await actions.exportTargets([
    { target: { scope: 'node', nodeId: photo.id }, formatId: 'html', options }
  ])
  return downloads
}

describe('HTML export', () => {
  test('saves the page and the images it links as one zip', async () => {
    const [download] = await exportPhoto()
    expect(download.filename).toBe('Team photo.zip')
    expect(download.mime).toBe('application/zip')

    const entries = unzipSync(download.data)
    const image = `Team photo.assets/images/${HASH}.png`
    expect(Object.keys(entries).toSorted()).toEqual([
      image,
      'Team photo.assets/kalka.css',
      'Team photo.html'
    ])
    expect([...entries[image]]).toEqual([...PIXEL])
    const html = strFromU8(entries['Team photo.html'])
    expect(html).toStartWith('<!doctype html>')
    expect(html).toContain(`src="Team%20photo.assets/images/${HASH}.png"`)
    expect(html).not.toContain('data:image/')
  })

  test('saves one self-contained page when images are embedded', async () => {
    const [download] = await exportPhoto({ htmlImages: 'embedded' })
    expect(download.filename).toBe('Team photo.html')
    expect(strFromU8(download.data)).toContain('src="data:image/png;base64,')
  })
})
