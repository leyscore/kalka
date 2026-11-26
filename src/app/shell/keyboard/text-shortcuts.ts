import type { ShortcutDefinition } from '@/app/shell/keyboard/registry'
import { createTextMenuActions, type TextMenuActionId } from '@/app/shell/menu/text-actions'

/**
 * Figma's text keys, bound by key position: Option changes the character a letter or a comma
 * types on macOS, and Shift turns `.` and `,` into the `>` and `<` Figma names them by. They work
 * while text is edited, on the characters selected in it.
 */
const TEXT_KEYS: Record<TextMenuActionId, string> = {
  'text.strikethrough': '$mod+Shift+KeyX',
  'text.list-bulleted': '$mod+Shift+Digit8',
  'text.list-numbered': '$mod+Shift+Digit7',
  'text.align-left': '$mod+Alt+KeyL',
  'text.align-center': '$mod+Alt+KeyT',
  'text.align-right': '$mod+Alt+KeyR',
  'text.align-justified': '$mod+Alt+KeyJ',
  'text.font-size-up': '$mod+Shift+Period',
  'text.font-size-down': '$mod+Shift+Comma',
  'text.font-weight-up': '$mod+Alt+Period',
  'text.font-weight-down': '$mod+Alt+Comma',
  'text.line-height-up': 'Alt+Shift+Period',
  'text.line-height-down': 'Alt+Shift+Comma',
  'text.letter-spacing-up': 'Alt+Period',
  'text.letter-spacing-down': 'Alt+Comma'
}

export function textShortcutDefinitions(): ShortcutDefinition[] {
  return Object.entries(TEXT_KEYS).map(([id, keys]) => ({
    id,
    keys,
    run: ({ store }) => createTextMenuActions(store)[id as TextMenuActionId](),
    whileEditingText: true
  }))
}
