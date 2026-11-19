import { describe, expect, test } from 'bun:test'

import { withFileOutputHint, withoutOutputPath } from '#mcp/tool/output'

describe('file output arguments', () => {
  test('a server without a root does not pass get_jsx its output path', () => {
    expect(withoutOutputPath('get_jsx', { id: '1:2', path: 'board.jsx' })).toEqual({ id: '1:2' })
  })

  test('a path that is the data of a tool stays', () => {
    expect(withoutOutputPath('import_svg', { path: 'icon.svg' })).toEqual({ path: 'icon.svg' })
  })

  test('a cut get_jsx result says how to get all of it when the server writes files', () => {
    const cut = { jsx: '<Frame', truncated: true, note: 'JSX cut at 12000 of 20000 characters.' }
    expect(withFileOutputHint('get_jsx', cut, true)?.note).toBe(
      'JSX cut at 12000 of 20000 characters. Pass path to write the complete JSX to a file.'
    )
    expect(withFileOutputHint('get_jsx', cut, false)).toBe(cut)
  })

  test('a whole result gets no hint', () => {
    const whole = { jsx: '<Frame />' }
    expect(withFileOutputHint('get_jsx', whole, true)).toBe(whole)
  })
})
