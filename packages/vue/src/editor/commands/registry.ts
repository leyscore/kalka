import type { EditorCommandId } from './types'

export interface EditorCommandMetadata {
  shortcut?: string
  keybinding?: string | string[]
  contextTestId?: string
}

export const EDITOR_COMMAND_METADATA = {
  'edit.undo': { shortcut: 'MOD+Z', keybinding: '$mod+KeyZ' },
  'edit.redo': { shortcut: 'MOD+SHIFT+Z', keybinding: ['$mod+Shift+KeyZ', '$mod+KeyY'] },
  'selection.selectAll': { shortcut: 'MOD+A', keybinding: '$mod+KeyA' },
  'selection.selectInverse': { shortcut: 'MOD+SHIFT+A', keybinding: '$mod+Shift+KeyA' },
  'selection.duplicate': {
    shortcut: 'MOD+D',
    keybinding: '$mod+KeyD',
    contextTestId: 'context-duplicate'
  },
  'selection.delete': { shortcut: '⌫', contextTestId: 'context-delete' },
  'selection.group': { shortcut: 'MOD+G', keybinding: '$mod+KeyG', contextTestId: 'context-group' },
  'selection.frameSelection': {
    shortcut: 'MOD+ALT+G',
    keybinding: '$mod+Alt+KeyG',
    contextTestId: 'context-frame-selection'
  },
  'selection.ungroup': { shortcut: 'MOD+SHIFT+G', keybinding: '$mod+Shift+KeyG' },
  'selection.createComponent': {
    shortcut: 'MOD+ALT+K',
    keybinding: '$mod+Alt+KeyK',
    contextTestId: 'context-create-component'
  },
  'selection.createComponentSet': { shortcut: 'MOD+SHIFT+K', keybinding: '$mod+Shift+KeyK' },
  'selection.detachInstance': { shortcut: 'MOD+ALT+B', keybinding: '$mod+Alt+KeyB' },
  'selection.detachIcon': {},
  'selection.goToMainComponent': {},
  'selection.createMultipleComponents': {},
  'selection.resetAllChanges': {},
  'selection.pushChangesToMainComponent': {},
  'selection.restoreMainComponent': {},
  'selection.selectMatchingLayers': { shortcut: 'MOD+ALT+A', keybinding: '$mod+Alt+KeyA' },
  'selection.selectSameFill': {},
  'selection.selectSameStroke': {},
  'selection.selectSameEffect': {},
  'selection.selectSameText': {},
  'selection.selectSameFont': {},
  'selection.selectSameInstance': {},
  'selection.selectSameProperties': {},
  'selection.createInstance': {},
  'selection.createSlot': { contextTestId: 'context-create-slot' },
  'selection.wrapInAutoLayout': { shortcut: 'SHIFT+A', keybinding: 'Shift+KeyA' },
  'selection.toggleMask': {
    shortcut: 'MOD+ALT+M',
    keybinding: ['Control+Meta+KeyM', '$mod+Alt+KeyM'],
    contextTestId: 'context-toggle-mask'
  },
  'selection.bringForward': {
    shortcut: 'MOD+]',
    keybinding: '$mod+BracketRight',
    contextTestId: 'context-bring-forward'
  },
  'selection.bringToFront': {
    shortcut: ']',
    // Figma's ⌥⌘], next to the single key.
    keybinding: ['BracketRight', '$mod+Alt+BracketRight'],
    contextTestId: 'context-bring-to-front'
  },
  'selection.sendBackward': {
    shortcut: 'MOD+[',
    keybinding: '$mod+BracketLeft',
    contextTestId: 'context-send-backward'
  },
  'selection.sendToBack': {
    shortcut: '[',
    keybinding: ['BracketLeft', '$mod+Alt+BracketLeft'],
    contextTestId: 'context-send-to-back'
  },
  'selection.toggleVisibility': {
    shortcut: 'MOD+SHIFT+H',
    keybinding: '$mod+Shift+KeyH',
    contextTestId: 'context-toggle-visibility'
  },
  'selection.toggleLock': {
    shortcut: 'MOD+SHIFT+L',
    keybinding: '$mod+Shift+KeyL',
    contextTestId: 'context-toggle-lock'
  },
  'selection.flipHorizontal': {
    shortcut: 'SHIFT+H',
    keybinding: 'Shift+KeyH',
    contextTestId: 'context-flip-horizontal'
  },
  'selection.flipVertical': {
    shortcut: 'SHIFT+V',
    keybinding: 'Shift+KeyV',
    contextTestId: 'context-flip-vertical'
  },
  // Figma's ⌥⇧H and ⌥⇧V, matched by key position: Option turns the letter into another character.
  'selection.distributeHorizontal': { shortcut: 'ALT+SHIFT+H', keybinding: 'Alt+Shift+KeyH' },
  'selection.distributeVertical': { shortcut: 'ALT+SHIFT+V', keybinding: 'Alt+Shift+KeyV' },
  // Figma's ⌃⌥T. Off macOS Ctrl is the modifier, and Ctrl+Alt+T aligns text to the centre.
  'selection.tidyUp': { shortcut: 'CTRL+ALT+T', keybinding: 'Control+Alt+KeyT' },
  'selection.booleanUnion': {
    shortcut: 'ALT+SHIFT+U',
    keybinding: 'Alt+Shift+KeyU',
    contextTestId: 'context-boolean-union'
  },
  'selection.booleanSubtract': {
    shortcut: 'ALT+SHIFT+S',
    keybinding: 'Alt+Shift+KeyS',
    contextTestId: 'context-boolean-subtract'
  },
  'selection.booleanIntersect': {
    shortcut: 'ALT+SHIFT+I',
    keybinding: 'Alt+Shift+KeyI',
    contextTestId: 'context-boolean-intersect'
  },
  'selection.booleanExclude': {
    shortcut: 'ALT+SHIFT+E',
    keybinding: 'Alt+Shift+KeyE',
    contextTestId: 'context-boolean-exclude'
  },
  'selection.flatten': {
    shortcut: 'ALT+SHIFT+F',
    keybinding: 'Alt+Shift+KeyF',
    contextTestId: 'context-flatten'
  },
  'selection.outlineText': { contextTestId: 'context-outline-text' },
  'selection.outlineStroke': {
    shortcut: 'MOD+ALT+O',
    keybinding: '$mod+Alt+KeyO',
    contextTestId: 'context-outline-stroke'
  },
  'selection.moveToPage': {},
  'selection.removeFrame': {},
  'selection.resizeToFit': { shortcut: 'MOD+ALT+SHIFT+R', keybinding: '$mod+Alt+Shift+KeyR' },
  'selection.rotate180': {},
  'selection.rotateLeft': {},
  'selection.rotateRight': {},
  'selection.swapFillAndStroke': { shortcut: 'SHIFT+X', keybinding: 'Shift+KeyX' },
  // Figma's ⌥/ and ⇧/, matched by key position: Option and Shift change what / types.
  'selection.removeFill': { shortcut: 'ALT+/', keybinding: 'Alt+Slash' },
  'selection.removeStroke': { shortcut: 'SHIFT+/', keybinding: 'Shift+Slash' },
  'selection.hideOtherLayers': {},
  'selection.setOpacity': { shortcut: '1-9, 0' },
  'view.zoom100': { shortcut: 'SHIFT+0', keybinding: ['$mod+Digit0', 'Shift+Digit0'] },
  'view.zoomFit': { shortcut: 'SHIFT+1', keybinding: ['$mod+Digit1', 'Shift+Digit1'] },
  'view.zoomSelection': { shortcut: 'SHIFT+2', keybinding: ['$mod+Digit2', 'Shift+Digit2'] }
} satisfies Record<EditorCommandId, EditorCommandMetadata>

export function editorCommandMetadata(id: EditorCommandId): EditorCommandMetadata {
  return EDITOR_COMMAND_METADATA[id]
}
