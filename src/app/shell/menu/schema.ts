import type { EditorCommandId } from '@kalka/vue'

export type AppMenuTarget = 'all' | 'browser' | 'native'

export type AppMenuIcon =
  | 'download'
  | 'eye'
  | 'file'
  | 'folder-open'
  | 'layers'
  | 'pencil'
  | 'redo'
  | 'save'
  | 'settings'
  | 'type'
  | 'variables'
  | 'undo'
  | 'zoom-in'
  | 'zoom-out'

export type AppMenuPaletteLabel =
  | 'exportSelectionAsPNG'
  | 'exportSelectionAsSVG'
  | 'exportSelectionAsPPTX'
  | 'exportSelectionAsFig'

export interface AppMenuPaletteMetadata {
  icon?: AppMenuIcon
  label?: AppMenuPaletteLabel
  description?: string
  keywords?: string[]
}

export type AppMenuHandler = 'editor' | 'shell'

export interface AppMenuActionItem {
  type?: 'item'
  id: string
  label: string
  shortcut?: string
  accelerator?: string
  command?: EditorCommandId
  checkbox?: boolean
  target?: AppMenuTarget
  handler?: AppMenuHandler
  palette?: AppMenuPaletteMetadata
  sub?: AppMenuEntry[]
}

export interface AppMenuSeparatorItem {
  type: 'separator'
  target?: AppMenuTarget
}

export type AppMenuEntry = AppMenuActionItem | AppMenuSeparatorItem

export interface AppMenuGroupSchema {
  label: string
  target?: AppMenuTarget
  paletteIcon?: AppMenuIcon
  items: AppMenuEntry[]
}

export const APP_MENU_SCHEMA = [
  {
    label: 'File',
    paletteIcon: 'file',
    items: [
      { id: 'new', label: 'New', shortcut: 'MOD+N' },
      { id: 'open', label: 'Open…', shortcut: 'MOD+O' },
      { id: 'open-folder', label: 'Open Folder…', target: 'native' },
      { id: 'open-recent', label: 'Open Recent', target: 'native' },
      { id: 'open-storage-workspace', label: 'Open Storage Workspace…', handler: 'shell' },
      { id: 'import-claude-design', label: 'Import Claude Design Project…' },
      { type: 'separator' },
      { id: 'save', label: 'Save', shortcut: 'MOD+S' },
      { id: 'save-as', label: 'Save As…', shortcut: 'MOD+SHIFT+S' },
      { id: 'save-as-folder', label: 'Save As Folder…', target: 'native' },
      { id: 'save-to-storage', label: 'Save to Storage…' },
      { type: 'separator' },
      {
        id: 'export-selection',
        label: 'Export Selection',
        palette: { icon: 'download' },
        shortcut: 'MOD+SHIFT+E',
        sub: [
          {
            id: 'export-png',
            label: 'PNG',
            palette: { icon: 'download', label: 'exportSelectionAsPNG' }
          },
          {
            id: 'export-svg',
            label: 'SVG',
            palette: { icon: 'download', label: 'exportSelectionAsSVG' }
          },
          {
            id: 'export-pptx',
            label: 'PPTX',
            palette: { icon: 'download', label: 'exportSelectionAsPPTX' }
          },
          {
            id: 'export-fig',
            label: '.fig',
            palette: { icon: 'download', label: 'exportSelectionAsFig' }
          }
        ]
      },
      { type: 'separator' },
      { id: 'autosave', label: 'Autosave', checkbox: true },
      { id: 'close', label: 'Close Tab', shortcut: 'MOD+W' }
    ]
  },
  {
    label: 'Edit',
    paletteIcon: 'pencil',
    items: [
      {
        id: 'edit.undo',
        label: 'Undo',
        command: 'edit.undo'
      },
      {
        id: 'edit.redo',
        label: 'Redo',
        command: 'edit.redo'
      },
      { type: 'separator' },
      { id: 'copy', label: 'Copy', shortcut: 'MOD+C' },
      { id: 'cut', label: 'Cut', shortcut: 'MOD+X' },
      { id: 'paste', label: 'Paste', shortcut: 'MOD+V' },
      { id: 'paste-to-replace', label: 'Paste to replace', shortcut: 'MOD+SHIFT+R' },
      { id: 'copy-properties', label: 'Copy properties', shortcut: 'MOD+ALT+C' },
      { id: 'paste-properties', label: 'Paste properties', shortcut: 'MOD+ALT+V' },
      {
        id: 'selection.duplicate',
        label: 'Duplicate',
        command: 'selection.duplicate'
      },
      {
        id: 'selection.delete',
        label: 'Delete',
        command: 'selection.delete'
      },
      { id: 'selection.rename', label: 'Rename Selection…', shortcut: 'MOD+R' },
      {
        id: 'find',
        label: 'Find and Replace…',
        shortcut: 'MOD+F',
        palette: { keywords: ['search', 'replace', 'find', 'text', 'layers'] }
      },
      { type: 'separator' },
      {
        id: 'selection.selectAll',
        label: 'Select All',
        command: 'selection.selectAll'
      },
      {
        id: 'selection.selectInverse',
        label: 'Select Inverse',
        command: 'selection.selectInverse'
      },
      {
        id: 'selection.selectMatchingLayers',
        label: 'Select Matching Layers',
        command: 'selection.selectMatchingLayers'
      },
      {
        id: 'select-all-with-same',
        label: 'Select All with Same',
        sub: [
          { id: 'selection.selectSameFill', label: 'Fill', command: 'selection.selectSameFill' },
          {
            id: 'selection.selectSameStroke',
            label: 'Stroke',
            command: 'selection.selectSameStroke'
          },
          {
            id: 'selection.selectSameEffect',
            label: 'Effect',
            command: 'selection.selectSameEffect'
          },
          {
            id: 'selection.selectSameText',
            label: 'Text Properties',
            command: 'selection.selectSameText'
          },
          { id: 'selection.selectSameFont', label: 'Font', command: 'selection.selectSameFont' },
          {
            id: 'selection.selectSameInstance',
            label: 'Instance',
            command: 'selection.selectSameInstance'
          },
          {
            id: 'selection.selectSameProperties',
            label: 'Properties',
            command: 'selection.selectSameProperties'
          }
        ]
      }
    ]
  },
  {
    label: 'View',
    paletteIcon: 'eye',
    items: [
      {
        id: 'view.zoom100',
        label: 'Zoom to 100%',
        command: 'view.zoom100'
      },
      {
        id: 'view.zoomFit',
        label: 'Zoom to Fit',
        command: 'view.zoomFit'
      },
      {
        id: 'view.zoomSelection',
        label: 'Zoom to Selection',
        command: 'view.zoomSelection'
      },
      { id: 'zoom-in', label: 'Zoom In', shortcut: 'MOD+=' },
      { id: 'zoom-out', label: 'Zoom Out', shortcut: 'MOD+-' },
      { id: 'zoom-50', label: 'Zoom to 50%' },
      { id: 'zoom-200', label: 'Zoom to 200%' },
      { type: 'separator' },
      { id: 'zoom-previous-frame', label: 'Zoom to Previous Frame', shortcut: 'SHIFT+N' },
      { id: 'zoom-next-frame', label: 'Zoom to Next Frame', shortcut: 'N' },
      { id: 'previous-page', label: 'Previous Page', shortcut: 'PageUp' },
      { id: 'next-page', label: 'Next Page', shortcut: 'PageDown' },
      { type: 'separator' },
      { id: 'view-split-right', label: 'Split Right' },
      { id: 'view-split-down', label: 'Split Down' },
      { type: 'separator' },
      {
        id: 'variables',
        label: 'Variables…',
        palette: {
          icon: 'variables',
          keywords: ['tokens', 'design tokens', 'css variables', 'collections', 'modes', 'theme']
        }
      },
      { type: 'separator' },
      { id: 'view-rulers', label: 'Rulers', checkbox: true, shortcut: 'SHIFT+R' },
      // Figma's View › Pixel grid, shown once zoomed in far enough.
      { id: 'view-pixel-grid', label: 'Pixel Grid', checkbox: true, shortcut: "SHIFT+'" },
      {
        id: 'view-multiplayer-cursors',
        label: 'Multiplayer Cursors',
        checkbox: true,
        shortcut: 'ALT+MOD+\\'
      },
      { id: 'view-design-issues', label: 'Design Issues', checkbox: true, handler: 'shell' },
      { type: 'separator' },
      {
        id: 'theme',
        label: 'Theme',
        sub: [
          { id: 'theme-light', label: 'Light', checkbox: true, handler: 'shell' },
          { id: 'theme-dark', label: 'Dark', checkbox: true, handler: 'shell' },
          { id: 'theme-auto', label: 'Auto', checkbox: true, handler: 'shell' }
        ]
      },
      { id: 'language', label: 'Language', target: 'browser' },
      { type: 'separator' },
      {
        id: 'preferences',
        label: 'Preferences',
        sub: [
          {
            id: 'snap-geometry',
            label: 'Snap to Geometry',
            checkbox: true,
            handler: 'shell'
          },
          {
            id: 'snap-objects',
            label: 'Snap to Objects',
            checkbox: true,
            handler: 'shell'
          },
          {
            id: 'snap-pixel-grid',
            label: 'Snap to Pixel Grid',
            checkbox: true,
            shortcut: "MOD+SHIFT+'",
            handler: 'shell'
          },
          { type: 'separator' },
          {
            id: 'settings',
            label: 'Settings…',
            shortcut: 'MOD+,',
            accelerator: 'CmdOrCtrl+,',
            handler: 'shell'
          }
        ]
      },
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard Shortcuts',
        shortcut: 'CTRL+SHIFT+?',
        accelerator: 'Ctrl+Shift+/'
      },
      { id: 'documentation', label: 'Documentation', handler: 'shell' },
      { type: 'separator' },
      { id: 'toggle-ui', label: 'Toggle UI', shortcut: 'MOD+\\' },
      { id: 'toggle-preview', label: 'Preview', shortcut: 'MOD+ALT+↩' },
      { type: 'separator' },
      { id: 'profiler', label: 'Profiler', checkbox: true, target: 'browser' },
      {
        id: 'dev-tools',
        label: 'Developer Tools',
        accelerator: 'CmdOrCtrl+Alt+I',
        target: 'native'
      }
    ]
  },
  {
    label: 'Object',
    paletteIcon: 'layers',
    items: [
      {
        id: 'selection.group',
        label: 'Group Selection',
        command: 'selection.group'
      },
      {
        id: 'selection.frameSelection',
        label: 'Frame Selection',
        command: 'selection.frameSelection'
      },
      {
        id: 'selection.ungroup',
        label: 'Ungroup Selection',
        command: 'selection.ungroup'
      },
      { id: 'selection.removeFrame', label: 'Remove Frame', command: 'selection.removeFrame' },
      { id: 'selection.resizeToFit', label: 'Resize to Fit', command: 'selection.resizeToFit' },
      { type: 'separator' },
      {
        id: 'insert-icon',
        label: 'Insert Icon…',
        palette: { keywords: ['iconify', 'symbol', 'glyph', 'lucide'] }
      },
      { type: 'separator' },
      {
        id: 'selection.toggleMask',
        label: 'Use as Mask',
        command: 'selection.toggleMask'
      },
      {
        id: 'selection.toggleVisibility',
        label: 'Show/Hide',
        command: 'selection.toggleVisibility'
      },
      {
        id: 'selection.toggleLock',
        label: 'Lock/Unlock',
        command: 'selection.toggleLock'
      },
      {
        id: 'selection.hideOtherLayers',
        label: 'Hide Other Layers',
        command: 'selection.hideOtherLayers'
      },
      { id: 'collapse-layers', label: 'Collapse Layers', shortcut: 'ALT+L' },
      { type: 'separator' },
      {
        id: 'selection.flipHorizontal',
        label: 'Flip Horizontal',
        command: 'selection.flipHorizontal'
      },
      {
        id: 'selection.flipVertical',
        label: 'Flip Vertical',
        command: 'selection.flipVertical'
      },
      { id: 'selection.rotate180', label: 'Rotate 180°', command: 'selection.rotate180' },
      { id: 'selection.rotateLeft', label: 'Rotate 90° Left', command: 'selection.rotateLeft' },
      { id: 'selection.rotateRight', label: 'Rotate 90° Right', command: 'selection.rotateRight' },
      { type: 'separator' },
      {
        id: 'selection.swapFillAndStroke',
        label: 'Swap Fill and Stroke',
        command: 'selection.swapFillAndStroke'
      },
      { id: 'selection.removeFill', label: 'Remove Fill', command: 'selection.removeFill' },
      { id: 'selection.removeStroke', label: 'Remove Stroke', command: 'selection.removeStroke' },
      { type: 'separator' },
      {
        id: 'selection.booleanUnion',
        label: 'Union selection',
        command: 'selection.booleanUnion'
      },
      {
        id: 'selection.booleanSubtract',
        label: 'Subtract selection',
        command: 'selection.booleanSubtract'
      },
      {
        id: 'selection.booleanIntersect',
        label: 'Intersect selection',
        command: 'selection.booleanIntersect'
      },
      {
        id: 'selection.booleanExclude',
        label: 'Exclude selection',
        command: 'selection.booleanExclude'
      },
      {
        id: 'selection.flatten',
        label: 'Flatten',
        command: 'selection.flatten'
      },
      {
        id: 'selection.outlineText',
        label: 'Outline text',
        command: 'selection.outlineText'
      },
      {
        id: 'selection.outlineStroke',
        label: 'Outline stroke',
        command: 'selection.outlineStroke'
      },
      { type: 'separator' },
      {
        id: 'selection.createComponent',
        label: 'Create Component',
        command: 'selection.createComponent'
      },
      {
        id: 'selection.createMultipleComponents',
        label: 'Create Multiple Components',
        command: 'selection.createMultipleComponents'
      },
      {
        id: 'selection.createComponentSet',
        label: 'Create Component Set',
        command: 'selection.createComponentSet'
      },
      {
        id: 'selection.createInstance',
        label: 'Create Instance',
        command: 'selection.createInstance'
      },
      {
        id: 'selection.createSlot',
        label: 'Create Slot',
        command: 'selection.createSlot'
      },
      {
        id: 'selection.goToMainComponent',
        label: 'Go to Main Component',
        command: 'selection.goToMainComponent'
      },
      {
        id: 'selection.resetAllChanges',
        label: 'Reset All Changes',
        command: 'selection.resetAllChanges'
      },
      {
        id: 'selection.pushChangesToMainComponent',
        label: 'Push Changes to Main Component',
        command: 'selection.pushChangesToMainComponent'
      },
      {
        id: 'selection.restoreMainComponent',
        label: 'Restore Main Component',
        command: 'selection.restoreMainComponent'
      },
      {
        id: 'selection.detachInstance',
        label: 'Detach Instance',
        command: 'selection.detachInstance'
      },
      {
        id: 'selection.detachIcon',
        label: 'Detach Icon',
        command: 'selection.detachIcon'
      },
      { type: 'separator' },
      {
        id: 'selection.moveToPage',
        label: 'Move to Page',
        command: 'selection.moveToPage',
        target: 'browser'
      },
      {
        id: 'selection.bringForward',
        label: 'Bring Forward',
        command: 'selection.bringForward'
      },
      {
        id: 'selection.bringToFront',
        label: 'Bring to Front',
        command: 'selection.bringToFront'
      },
      {
        id: 'selection.sendBackward',
        label: 'Send Backward',
        command: 'selection.sendBackward'
      },
      {
        id: 'selection.sendToBack',
        label: 'Send to Back',
        command: 'selection.sendToBack'
      }
    ]
  },
  {
    label: 'Text',
    paletteIcon: 'type',
    items: [
      { id: 'text.bold', label: 'Bold', shortcut: 'MOD+B' },
      { id: 'text.italic', label: 'Italic', shortcut: 'MOD+I' },
      { id: 'text.underline', label: 'Underline', shortcut: 'MOD+U' },
      { id: 'text.strikethrough', label: 'Strikethrough', shortcut: 'MOD+SHIFT+X' },
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
  },
  {
    label: 'Arrange',
    paletteIcon: 'layers',
    items: [
      {
        id: 'selection.wrapInAutoLayout',
        label: 'Wrap in Auto Layout',
        command: 'selection.wrapInAutoLayout'
      },
      { type: 'separator' },
      { id: 'arrange.align-left', label: 'Align Left', shortcut: 'ALT+A' },
      { id: 'arrange.align-center', label: 'Align Center', shortcut: 'ALT+H' },
      { id: 'arrange.align-right', label: 'Align Right', shortcut: 'ALT+D' },
      { type: 'separator' },
      { id: 'arrange.align-top', label: 'Align Top', shortcut: 'ALT+W' },
      { id: 'arrange.align-middle', label: 'Align Middle', shortcut: 'ALT+V' },
      { id: 'arrange.align-bottom', label: 'Align Bottom', shortcut: 'ALT+S' },
      { type: 'separator' },
      {
        id: 'selection.distributeHorizontal',
        label: 'Distribute Horizontal Spacing',
        command: 'selection.distributeHorizontal'
      },
      {
        id: 'selection.distributeVertical',
        label: 'Distribute Vertical Spacing',
        command: 'selection.distributeVertical'
      }
    ]
  }
] satisfies AppMenuGroupSchema[]

/**
 * Custom entries in the macOS application menu.
 *
 * Placement stays in Rust because the OS-predefined items (About, Services, Hide)
 * sit between them. Only the labels and accelerators are shared here.
 */
export const APP_MENU_APP_ITEMS = [
  { id: 'about', label: 'About Kalka' },
  { id: 'check-updates', label: 'Check for Updates…' },
  { id: 'quit', label: 'Quit Kalka', shortcut: 'MOD+Q' }
] satisfies AppMenuActionItem[]
