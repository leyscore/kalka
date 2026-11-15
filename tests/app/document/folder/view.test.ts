import { describe, expect, test } from 'bun:test'

import { fileKind, imageType, pageOfFile } from '@/app/document/folder/view'

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

describe('pageOfFile', () => {
  const project = JSON.stringify({
    pages: [
      { id: '1:2', name: 'Home', file: 'pages/home.html' },
      { id: '1:3', name: 'About', file: 'pages/about.html' }
    ]
  })

  test('finds the page a file holds', () => {
    expect(pageOfFile(project, 'pages/about.html')).toBe('1:3')
  })

  test('is null for another file and for a project it cannot read', () => {
    expect(pageOfFile(project, 'styles.css')).toBeNull()
    expect(pageOfFile('not json', 'pages/home.html')).toBeNull()
    expect(pageOfFile('{"pages":"none"}', 'pages/home.html')).toBeNull()
  })
})
