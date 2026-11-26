import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import { pixelPreviewScale } from '#vue/canvas/dom-scene/pixel-preview'

describe('pixel preview', () => {
  test('pictures the canvas only once the view enlarges its pixels', () => {
    const { state } = createEditor()
    expect(pixelPreviewScale({ ...state, zoom: 4 }, 2)).toBeNull()
    expect(pixelPreviewScale({ ...state, zoom: 4, pixelPreview: '1x' }, 2)).toBe(1)
    expect(pixelPreviewScale({ ...state, zoom: 1, pixelPreview: '2x' }, 2)).toBeNull()
    expect(pixelPreviewScale({ ...state, zoom: 1.5, pixelPreview: '2x' }, 2)).toBe(2)
  })
})
