import type { Tool } from './types'

export interface EditorToolDef {
  key: Tool
  label: string
  shortcut: string
  flyout?: Tool[]
}

export const EDITOR_TOOLS: EditorToolDef[] = [
  { key: 'SELECT', label: 'Move', shortcut: 'V', flyout: ['SELECT', 'SCALE'] },
  { key: 'FRAME', label: 'Frame', shortcut: 'F', flyout: ['FRAME', 'SECTION'] },
  {
    key: 'RECTANGLE',
    label: 'Rectangle',
    shortcut: 'R',
    flyout: ['RECTANGLE', 'LINE', 'ARROW', 'ELLIPSE', 'POLYGON', 'STAR', 'SHAPE_BUILDER']
  },
  { key: 'PEN', label: 'Pen', shortcut: 'P', flyout: ['PEN', 'PENCIL', 'VARIABLE_WIDTH'] },
  { key: 'TEXT', label: 'Text', shortcut: 'T' },
  { key: 'HAND', label: 'Hand', shortcut: 'H' }
]

export const TOOL_SHORTCUTS: Partial<Record<string, Tool>> = {
  KeyV: 'SELECT',
  KeyK: 'SCALE',
  KeyF: 'FRAME',
  KeyS: 'SECTION',
  KeyR: 'RECTANGLE',
  KeyO: 'ELLIPSE',
  KeyL: 'LINE',
  'Shift+KeyL': 'ARROW',
  KeyT: 'TEXT',
  KeyP: 'PEN',
  'Shift+KeyP': 'PENCIL',
  'Shift+KeyM': 'SHAPE_BUILDER',
  'Shift+KeyW': 'VARIABLE_WIDTH',
  KeyH: 'HAND'
}
