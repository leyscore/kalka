import { describe, expect, test } from 'bun:test'

import { folderChanges, folderRows } from '@/app/document/folder/tree'
import { changeKind } from '@/app/document/versions/git'

const FILES = ['styles.css', 'pages/index.html', 'pages/about.html', 'assets/images/logo.png']
const kindOf = (code: string) => changeKind(code).kind

describe('folderRows', () => {
  test('lists folders before files, each in name order, with their depth', () => {
    const rows = folderRows(FILES, new Map(), new Set())
    expect(rows.map((row) => `${'  '.repeat(row.depth)}${row.name}`)).toEqual([
      'assets',
      '  images',
      '    logo.png',
      'pages',
      '  about.html',
      '  index.html',
      'styles.css'
    ])
  })

  test('a collapsed folder keeps its row and hides what is inside', () => {
    const rows = folderRows(FILES, new Map(), new Set(['assets']))
    expect(rows.map((row) => row.path)).toEqual([
      'assets',
      'pages',
      'pages/about.html',
      'pages/index.html',
      'styles.css'
    ])
  })

  test('marks a changed file and every folder above it', () => {
    const rows = folderRows(FILES, new Map([['assets/images/logo.png', 'added']]), new Set())
    const change = (path: string) => rows.find((row) => row.path === path)?.change
    expect(change('assets/images/logo.png')).toBe('added')
    expect(change('assets')).toBe('modified')
    expect(change('assets/images')).toBe('modified')
    expect(change('pages')).toBeNull()
  })
})

describe('folderChanges', () => {
  const status = [
    { path: 'site/pages/index.html', status: ' M' },
    { path: 'site/new.css', status: '??' },
    { path: 'README.md', status: ' M' }
  ]

  test('keeps the changes inside the folder, relative to it', () => {
    const changes = folderChanges(status, '/repo', '/repo/site', kindOf)
    expect([...changes]).toEqual([
      ['pages/index.html', 'modified'],
      ['new.css', 'added']
    ])
  })

  test('a folder that is the repository keeps every change', () => {
    expect(folderChanges(status, '/repo', '/repo/', kindOf).size).toBe(3)
  })

  test('a folder outside the repository has no changes', () => {
    expect(folderChanges(status, '/repo', '/elsewhere/site', kindOf).size).toBe(0)
  })
})
