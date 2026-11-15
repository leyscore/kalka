import { describe, expect, test } from 'bun:test'

import { fileKind, folderEntryType, imageType, pageOfFile } from '@/app/document/folder/view'

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

describe('folderEntryType', () => {
  test('a folder takes the kind of its part of the document, at any depth', () => {
    expect(folderEntryType('pages', 'folder')).toBe('pages')
    expect(folderEntryType('assets/images', 'folder')).toBe('assets')
    expect(folderEntryType('instructions/skills', 'folder')).toBe('instructions')
    expect(folderEntryType('notes', 'folder')).toBe('folder')
  })

  test('a file is told by what it holds, and a skill from another instruction', () => {
    expect(folderEntryType('pages/home.html', 'file')).toBe('page')
    expect(folderEntryType('styles.css', 'file')).toBe('style')
    expect(folderEntryType('design-system/tokens.json', 'file')).toBe('data')
    expect(folderEntryType('assets/images/a1.png', 'file')).toBe('image')
    expect(folderEntryType('instructions/skills/critique.md', 'file')).toBe('skill')
    expect(folderEntryType('instructions/rules.md', 'file')).toBe('instruction')
    expect(folderEntryType('NOTES.md', 'file')).toBe('text')
    expect(folderEntryType('font.woff2', 'file')).toBe('file')
  })
})
