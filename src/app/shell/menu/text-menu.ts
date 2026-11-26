import type { AppMenuGroupSchema } from '@/app/shell/menu/schema'

/** The Text menu: character styles, lists, alignment and Figma's stepping shortcuts. */
export const TEXT_MENU = {
  label: 'Text',
  paletteIcon: 'type',
  items: [
    { id: 'text.bold', label: 'Bold', shortcut: 'MOD+B' },
    { id: 'text.italic', label: 'Italic', shortcut: 'MOD+I' },
    { id: 'text.underline', label: 'Underline', shortcut: 'MOD+U' },
    { id: 'text.strikethrough', label: 'Strikethrough', shortcut: 'MOD+SHIFT+X' },
    // ⌘K is the command palette's key outside text being edited, so no native accelerator.
    { id: 'text.link', label: 'Create Link', shortcut: 'MOD+K', accelerator: '' },
    { type: 'separator' },
    { id: 'text.list-bulleted', label: 'Bulleted List', shortcut: 'MOD+SHIFT+8' },
    { id: 'text.list-numbered', label: 'Numbered List', shortcut: 'MOD+SHIFT+7' },
    { type: 'separator' },
    {
      id: 'text.alignment',
      label: 'Alignment',
      sub: [
        { id: 'text.align-left', label: 'Text Align Left', shortcut: 'MOD+ALT+L' },
        { id: 'text.align-center', label: 'Text Align Center', shortcut: 'MOD+ALT+T' },
        { id: 'text.align-right', label: 'Text Align Right', shortcut: 'MOD+ALT+R' },
        { id: 'text.align-justified', label: 'Text Align Justified', shortcut: 'MOD+ALT+J' }
      ]
    },
    // Figma's > and < keys, which are Shift with . and , on the keyboards it names them on.
    {
      id: 'text.adjust',
      label: 'Adjust',
      sub: [
        { id: 'text.font-size-up', label: 'Increase Font Size', shortcut: 'MOD+SHIFT+.' },
        { id: 'text.font-size-down', label: 'Decrease Font Size', shortcut: 'MOD+SHIFT+,' },
        { id: 'text.font-weight-up', label: 'Increase Font Weight', shortcut: 'MOD+ALT+.' },
        { id: 'text.font-weight-down', label: 'Decrease Font Weight', shortcut: 'MOD+ALT+,' },
        { id: 'text.line-height-up', label: 'Increase Line Height', shortcut: 'ALT+SHIFT+.' },
        { id: 'text.line-height-down', label: 'Decrease Line Height', shortcut: 'ALT+SHIFT+,' },
        { id: 'text.letter-spacing-up', label: 'Increase Letter Spacing', shortcut: 'ALT+.' },
        { id: 'text.letter-spacing-down', label: 'Decrease Letter Spacing', shortcut: 'ALT+,' }
      ]
    }
  ]
} satisfies AppMenuGroupSchema
