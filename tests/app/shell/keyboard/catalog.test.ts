import { describe, expect, test } from 'bun:test'

import {
  buildShortcutCatalog,
  shortcutKeyCaps,
  tinykeysToToken
} from '@/app/shell/keyboard/catalog'
import { editorShortcutDefinitions } from '@/app/shell/keyboard/registry'

function find(platform: 'mac' | 'windows', id: string) {
  const { entries } = buildShortcutCatalog(editorShortcutDefinitions(), platform)
  return entries.find((entry) => entry.ids.includes(id))
}

describe('the keyboard shortcuts panel', () => {
  test('names every key the editor binds', () => {
    const { unlabeled } = buildShortcutCatalog(editorShortcutDefinitions(), 'mac')
    expect(unlabeled).toEqual([])
  })

  test('lists a bound key under the menu item that shows it, with each way to press it', () => {
    const redo = find('mac', 'edit.redo')
    expect(redo?.title).toEqual({ menu: 'edit.redo' })
    expect(redo?.keys).toEqual([
      ['⇧', '⌘', 'Z'],
      ['⌘', 'Y']
    ])
    expect(find('windows', 'edit.redo')?.keys[0]).toEqual(['Ctrl', 'Shift', 'Z'])
  })

  test('opens with Figma’s keys and lists itself', () => {
    expect(find('mac', 'keyboard-shortcuts')?.keys).toEqual([
      ['⌃', '⇧', '?'],
      ['⌘', '/']
    ])
  })

  test('keeps the Mac’s Control and Command binding off other platforms', () => {
    const mask = find('windows', 'selection.toggleMask')
    expect(mask?.keys).toEqual([['Ctrl', 'Alt', 'M']])
  })

  test('lists the tools and the shortcuts only menus show', () => {
    const { entries } = buildShortcutCatalog(editorShortcutDefinitions(), 'mac')
    expect(entries[0]?.category).toBe('tools')
    expect(entries.some((entry) => entry.ids.includes('tool:KeyR'))).toBe(true)
    expect(entries.some((entry) => entry.ids.includes('copy'))).toBe(true)
  })

  test('lists New Window with Figma’s keys in the desktop app only', () => {
    const desktop = buildShortcutCatalog(editorShortcutDefinitions(), 'mac', true)
    const newWindow = desktop.entries.find((entry) => entry.ids.includes('new-window'))
    expect(newWindow).toMatchObject({ category: 'file', keys: [['⇧', '⌘', 'N']] })
    const browser = buildShortcutCatalog(editorShortcutDefinitions(), 'mac', false)
    expect(browser.entries.some((entry) => entry.ids.includes('new-window'))).toBe(false)
  })
})

describe('key names', () => {
  test('turn tinykeys codes into menu tokens', () => {
    expect(tinykeysToToken('$mod+Shift+KeyE')).toBe('MOD+SHIFT+E')
    expect(tinykeysToToken('Alt+BracketRight')).toBe('ALT+]')
  })

  test('order modifiers as each platform does', () => {
    expect(shortcutKeyCaps('MOD+ALT+SHIFT+K', 'mac')).toEqual(['⌥', '⇧', '⌘', 'K'])
    expect(shortcutKeyCaps('MOD+ALT+SHIFT+K', 'linux')).toEqual(['Ctrl', 'Alt', 'Shift', 'K'])
  })
})
