import type { EditorCommandId } from '@kalka/vue'

import { FILE_MENU } from '@/app/shell/menu/file-menu'
import { TEXT_MENU } from '@/app/shell/menu/text-menu'
import { VECTOR_MENU } from '@/app/shell/menu/vector-menu'
import { WINDOW_MENU } from '@/app/shell/menu/window-menu'

/** Where an item shows: `desktop` is the native menu plus the app's own menu in the desktop app. */
export type AppMenuTarget = 'all' | 'browser' | 'native' | 'desktop'

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
  FILE_MENU,
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
      { id: 'paste-over-selection', label: 'Paste Over Selection', shortcut: 'MOD+SHIFT+V' },
      { id: 'paste-to-replace', label: 'Paste to replace', shortcut: 'MOD+SHIFT+R' },
      { id: 'copy-properties', label: 'Copy properties', shortcut: 'MOD+ALT+C' },
      { id: 'paste-properties', label: 'Paste properties', shortcut: 'MOD+ALT+V' },
      { id: 'set-default-properties', label: 'Set Default Properties' },
      { id: 'pick-color', label: 'Pick Color', shortcut: 'I' },
      { id: 'copy-link', label: 'Copy Link to Selection', shortcut: 'MOD+L' },
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
      // Figma's Windows key; Ctrl+G is Group there, so Ctrl+G is added on the Mac only.
      {
        id: 'view-layout-grids',
        label: 'Layout Grids',
        checkbox: true,
        shortcut: 'CTRL+SHIFT+4'
      },
      // Figma's Cmd+Y shows outlines; Kalka keeps Cmd+Y for Redo, so the items have no key.
      {
        id: 'view-outlines',
        label: 'Outlines',
        sub: [
          { id: 'view-outlines-all', label: 'Show Outlines', checkbox: true },
          { id: 'view-outlines-selection', label: 'Show Outlines for Selection', checkbox: true },
          { type: 'separator' },
          { id: 'view-outlines-hidden', label: 'Include Hidden Layers', checkbox: true },
          { id: 'view-outlines-bounds', label: 'Include Object Bounds', checkbox: true }
        ]
      },
      { id: 'view-mask-outlines', label: 'Mask Outlines', checkbox: true },
      { id: 'view-frame-outlines', label: 'Frame Outlines', checkbox: true },
      {
        id: 'view-pixel-preview',
        label: 'Pixel Preview',
        sub: [
          { id: 'view-pixel-preview-off', label: 'Disabled', checkbox: true },
          { id: 'view-pixel-preview-1x', label: '1x', checkbox: true },
          { id: 'view-pixel-preview-2x', label: '2x', checkbox: true }
        ]
      },
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
            id: 'keep-tool-selected',
            label: 'Keep Tool Selected After Use',
            checkbox: true,
            handler: 'shell'
          },
          {
            id: 'rename-duplicated-layers',
            label: 'Rename Duplicated Layers',
            checkbox: true,
            handler: 'shell'
          },
          { id: 'nudge-amount', label: 'Nudge Amount…', handler: 'shell' },
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
      // The desktop app has About in its application menu, as the system's own panel.
      { id: 'about-kalka', label: 'About Kalka', target: 'browser' },
      { type: 'separator' },
      { id: 'toggle-ui', label: 'Toggle UI', shortcut: 'MOD+\\' },
      { id: 'reset-panel-widths', label: 'Reset Panel Widths' },
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
      { id: 'rasterize-selection', label: 'Rasterize Selection' },
      { id: 'set-thumbnail', label: 'Set as Thumbnail' },
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
  VECTOR_MENU,
  TEXT_MENU,
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
      },
      { id: 'selection.tidyUp', label: 'Tidy Up', command: 'selection.tidyUp' }
    ]
  },
  WINDOW_MENU
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
