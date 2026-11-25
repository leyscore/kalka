import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import { dropLibraryAsset, filterCanvasFiles } from '#vue/canvas/drop/use'

describe('canvas file drops', () => {
  test('keeps supported raster and SVG files in source order', () => {
    const svg = new File(['<svg/>'], 'mark.svg', { type: 'image/svg+xml' })
    const image = new File(['png'], 'photo.png', { type: 'image/png' })
    const text = new File(['text'], 'notes.txt', { type: 'text/plain' })

    expect(filterCanvasFiles([svg, text, image])).toEqual([svg, image])
  })

  test('recognizes SVG filenames without MIME metadata', () => {
    const svg = new File(['<svg/>'], 'mark.SVG')
    expect(filterCanvasFiles([svg])).toEqual([svg])
  })
})

describe('library asset drops', () => {
  test('place an instance centred where the asset fell once it is in the document', async () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const component = editor.graph.createNode('COMPONENT', pageId, { width: 40, height: 20 })
    const requested: string[] = []
    const id = await dropLibraryAsset(editor, 'fresh:button', { x: 300, y: 200 }, (asset) => {
      requested.push(asset)
      return Promise.resolve(component.id)
    })
    expect(requested).toEqual(['fresh:button'])
    const instance = editor.graph.getNode(id ?? '')
    expect(instance).toMatchObject({ type: 'INSTANCE', componentId: component.id, x: 280, y: 190 })
  })

  test('place nothing when the asset cannot be brought in', async () => {
    const editor = createEditor()
    const id = await dropLibraryAsset(editor, 'fresh:gone', { x: 0, y: 0 }, () =>
      Promise.resolve(null)
    )
    expect(id).toBeNull()
  })
})
