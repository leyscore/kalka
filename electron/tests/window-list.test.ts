import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import {
  createTabMoves,
  createWindowChecks,
  TabMove,
  windowListGroups,
  WindowDocuments
} from '../src/handlers/window-list'

describe('the Window menu', () => {
  test('lists each editor’s documents in the order the windows opened, checking the one in front', () => {
    const groups = windowListGroups(
      [
        {
          label: 'editor-10',
          front: false,
          documents: [{ id: 'tab-1', name: 'Tenth', active: true }]
        },
        {
          label: 'editor-2',
          front: true,
          documents: [
            { id: 'tab-1', name: 'Poster', active: false },
            { id: 'tab-2', name: 'Landing', active: true }
          ]
        },
        { label: 'main', front: false, documents: [{ id: 'tab-4', name: 'Logo', active: true }] }
      ],
      'Kalka'
    )
    expect(groups.map((group) => group.map((item) => [item.label, item.checked]))).toEqual([
      [['Logo', false]],
      [
        ['Poster', false],
        ['Landing', true]
      ],
      [['Tenth', false]]
    ])
    expect(groups[1]?.[1]).toMatchObject({ windowLabel: 'editor-2', documentId: 'tab-2' })
  })

  test('names a window that has not reported its documents yet', () => {
    const groups = windowListGroups([{ label: 'main', front: true, documents: [] }], 'Kalka')
    expect(groups).toEqual([
      [{ label: 'Kalka', windowLabel: 'main', documentId: '', checked: true }]
    ])
  })

  test('takes only well-formed documents from a page', () => {
    expect(v.is(WindowDocuments, [{ id: 'tab-1', name: 'A', active: true }])).toBe(true)
    expect(v.is(WindowDocuments, [{ id: 'tab-1', name: 'A' }])).toBe(false)
    expect(v.is(WindowDocuments, [{ id: 'x'.repeat(65), name: 'A', active: true }])).toBe(false)
  })
})

describe('check items', () => {
  test('belong to the window that reported them', () => {
    const first = {}
    const second = {}
    const checks = createWindowChecks<object>()
    checks.set(first, 'view-rulers', true)
    checks.set(second, 'view-rulers', false)
    expect(checks.get(first, 'view-rulers')).toBe(true)
    expect(checks.get(second, 'view-rulers')).toBe(false)
    expect(checks.get(second, 'autosave')).toBeUndefined()
    expect(checks.get(null, 'view-rulers')).toBeUndefined()
  })
})

describe('tabs moving to another window', () => {
  test('wait for that window and are taken once', () => {
    const target = {}
    const other = {}
    const moves = createTabMoves<object>()
    moves.queue(target, { kind: 'path', path: '/designs/poster.fig' })
    moves.queue(target, { kind: 'snapshot', id: 'abc' })
    expect(moves.take(other)).toEqual([])
    expect(moves.take(target)).toEqual([
      { kind: 'path', path: '/designs/poster.fig' },
      { kind: 'snapshot', id: 'abc' }
    ])
    expect(moves.take(target)).toEqual([])
  })

  test('carry a file or a recovery snapshot, nothing else', () => {
    expect(v.is(TabMove, { kind: 'path', path: '/a.fig' })).toBe(true)
    expect(v.is(TabMove, { kind: 'snapshot', id: 'abc' })).toBe(true)
    expect(v.is(TabMove, { kind: 'path', path: '' })).toBe(false)
    expect(v.is(TabMove, { kind: 'url', url: 'https://example.com' })).toBe(false)
  })
})
