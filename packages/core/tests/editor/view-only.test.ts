import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('a document open to view only', () => {
  test('keeps the select and hand tools and refuses the drawing ones', () => {
    const editor = createEditor()
    editor.setTool('PEN')
    editor.setViewOnly(true)

    expect(editor.state.viewOnly).toBe(true)
    expect(editor.state.activeTool).toBe('SELECT')
    editor.setTool('RECTANGLE')
    expect(editor.state.activeTool).toBe('SELECT')
    editor.setTool('HAND')
    expect(editor.state.activeTool).toBe('HAND')
  })

  test('offers every tool again once it can be edited', () => {
    const editor = createEditor()
    editor.setViewOnly(true)
    editor.setViewOnly(false)

    editor.setTool('TEXT')
    expect(editor.state.viewOnly).toBe(false)
    expect(editor.state.activeTool).toBe('TEXT')
  })
})
