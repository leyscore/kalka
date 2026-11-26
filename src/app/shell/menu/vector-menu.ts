import type { AppMenuGroupSchema } from '@/app/shell/menu/schema'

/**
 * Figma's Vector menu. Join and Delete and heal act on the points chosen in a path being edited,
 * so their keys stay with the canvas: no native accelerator takes ⌘J from the AI panel or
 * Shift+Delete from text fields.
 */
export const VECTOR_MENU = {
  label: 'Vector',
  paletteIcon: 'pencil',
  items: [
    { id: 'vector.join', label: 'Join Selection', shortcut: 'MOD+J', accelerator: '' },
    {
      id: 'vector.smooth-join',
      label: 'Smooth Join Selection',
      shortcut: 'MOD+SHIFT+J',
      accelerator: ''
    },
    {
      id: 'vector.delete-and-heal',
      label: 'Delete and Heal Selection',
      shortcut: 'SHIFT+⌫',
      accelerator: ''
    },
    { type: 'separator' },
    { id: 'vector.simplify', label: 'Simplify Vector' },
    { id: 'vector.reverse', label: 'Reverse Path Direction' },
    { id: 'vector.offset', label: 'Offset Path…' }
  ]
} satisfies AppMenuGroupSchema
