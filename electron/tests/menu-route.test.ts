import { describe, expect, test } from 'bun:test'

import { routeMenuEvent } from '../src/handlers/menu-route'

const editor = { name: 'editor' }
const updates = { name: 'Software Update' }

describe('a click on the native menu', () => {
  test('reaches the editor, also with another window in front', () => {
    expect(routeMenuEvent('save', editor, editor)).toEqual({ kind: 'send', window: editor })
    expect(routeMenuEvent('save', updates, editor)).toEqual({ kind: 'send', window: editor })
    expect(routeMenuEvent('save', null, editor)).toEqual({ kind: 'send', window: editor })
  })

  test('Close closes the window in front when it is not the editor', () => {
    expect(routeMenuEvent('close', updates, editor)).toEqual({ kind: 'close', window: updates })
    expect(routeMenuEvent('close', editor, editor)).toEqual({ kind: 'send', window: editor })
  })

  test('New Window opens another editor, with or without one in front', () => {
    expect(routeMenuEvent('new-window', editor, editor)).toEqual({ kind: 'new-window' })
    expect(routeMenuEvent('new-window', null, null)).toEqual({ kind: 'new-window' })
  })

  test('opens an editor when none is open', () => {
    expect(routeMenuEvent('new', null, null)).toEqual({ kind: 'open-editor' })
    expect(routeMenuEvent('new', updates, null)).toEqual({ kind: 'open-editor' })
  })
})
