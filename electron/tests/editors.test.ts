import { describe, expect, test } from 'bun:test'

import {
  createFocusOrder,
  createQuitSequence,
  isEditorLabel,
  nextEditorLabel
} from '../src/handlers/editors'

describe('editor window labels', () => {
  test('the first editor is main, later ones are numbered from 2', () => {
    const taken = new Set<string>()
    const open = () => {
      const label = nextEditorLabel((candidate) => taken.has(candidate))
      taken.add(label)
      return label
    }
    expect([open(), open(), open()]).toEqual(['main', 'editor-2', 'editor-3'])
    taken.delete('main')
    expect(open()).toBe('main')
    taken.delete('editor-2')
    expect(open()).toBe('editor-2')
  })

  test('Software Update is not an editor', () => {
    expect(isEditorLabel('main')).toBe(true)
    expect(isEditorLabel('editor-4')).toBe(true)
    expect(isEditorLabel('updater')).toBe(false)
    expect(isEditorLabel(undefined)).toBe(false)
  })
})

describe('the editor in front', () => {
  test('is the last focused one still open', () => {
    const order = createFocusOrder<string>()
    const open = new Set(['a', 'b', 'c'])
    const alive = (window: string) => open.has(window)
    order.focus('a')
    order.focus('b')
    expect(order.focus('c')).toBe(true)
    expect(order.focus('c')).toBe(false)
    expect(order.latest(alive)).toBe('c')
    open.delete('c')
    expect(order.latest(alive)).toBe('b')
    order.focus('a')
    expect(order.all(alive)).toEqual(['a', 'b'])
  })
})

function quitSetup(windows: string[]) {
  const asked: string[] = []
  const events: string[] = []
  const sequence = createQuitSequence<string>({
    editors: () => windows,
    ask: (window) => asked.push(window),
    finish: () => events.push('quit'),
    cancelled: (agreed) => events.push(`cancelled:${agreed.join(',')}`)
  })
  return { asked, events, sequence }
}

describe('quitting with several editor windows', () => {
  test('asks each window in turn and quits once all agreed', () => {
    const { asked, events, sequence } = quitSetup(['a', 'b', 'c'])
    sequence.start()
    expect(asked).toEqual(['a'])
    expect(sequence.agree('a')).toBe(true)
    expect(asked).toEqual(['a', 'b'])
    sequence.agree('b')
    sequence.agree('c')
    expect(asked).toEqual(['a', 'b', 'c'])
    expect(events).toEqual(['quit'])
    expect(sequence.isRunning()).toBe(false)
  })

  test('stops at the first window that keeps its documents, and tells those that agreed', () => {
    const { asked, events, sequence } = quitSetup(['a', 'b', 'c'])
    sequence.start()
    sequence.agree('a')
    sequence.decline()
    expect(asked).toEqual(['a', 'b'])
    expect(events).toEqual(['cancelled:a'])
    // The page's exit is then a quit of its own again.
    expect(sequence.agree('c')).toBe(false)
  })

  test('a window whose own Quit started it is not asked again', () => {
    const { asked, events, sequence } = quitSetup(['a', 'b'])
    sequence.start('b')
    expect(asked).toEqual(['a'])
    sequence.agree('a')
    expect(events).toEqual(['quit'])
  })

  test('a window closed while it is asked moves on to the next', () => {
    const { asked, events, sequence } = quitSetup(['a', 'b', 'c'])
    sequence.start()
    sequence.gone('a')
    expect(asked).toEqual(['a', 'b'])
    sequence.gone('c')
    sequence.agree('b')
    expect(events).toEqual(['quit'])
  })

  test('quitting again starts over, and windows that agreed answer at once', () => {
    const { asked, sequence } = quitSetup(['a', 'b'])
    sequence.start()
    sequence.agree('a')
    sequence.start()
    expect(asked).toEqual(['a', 'b', 'a'])
  })
})
