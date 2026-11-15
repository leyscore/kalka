import { describe, expect, test } from 'bun:test'

import { fileKind, imageType } from '@/app/document/folder/view'

describe('fileKind', () => {
  test('tells pages, other code, pictures and the rest apart', () => {
    expect(fileKind('index.html')).toBe('html')
    expect(fileKind('styles.css')).toBe('text')
    expect(fileKind('tokens.JSON')).toBe('text')
    expect(fileKind('logo.png')).toBe('image')
    expect(fileKind('font.woff2')).toBe('binary')
    expect(fileKind('LICENSE')).toBe('binary')
  })
})

describe('imageType', () => {
  test('names the media type by extension', () => {
    expect(imageType('logo.svg')).toBe('image/svg+xml')
    expect(imageType('photo.JPG')).toBe('image/jpeg')
  })
})
