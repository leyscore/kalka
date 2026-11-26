import type { AppMenuGroupSchema } from '@/app/shell/menu/schema'

/** The File menu: opening, saving, exporting and the document's colour profile. */
export const FILE_MENU = {
  label: 'File',
  paletteIcon: 'file',
  items: [
    { id: 'new', label: 'New', shortcut: 'MOD+N' },
    { id: 'open', label: 'Open…', shortcut: 'MOD+O' },
    { id: 'open-folder', label: 'Open Folder…', target: 'native' },
    { id: 'open-recent', label: 'Open Recent', target: 'native' },
    { id: 'open-storage-workspace', label: 'Open Storage Workspace…', handler: 'shell' },
    { id: 'import-claude-design', label: 'Import Claude Design Project…' },
    // Figma's ⇧⌘K is Create component set here.
    { id: 'place-image', label: 'Place Image…' },
    { type: 'separator' },
    { id: 'save', label: 'Save', shortcut: 'MOD+S' },
    { id: 'save-as', label: 'Save As…', shortcut: 'MOD+SHIFT+S' },
    { id: 'save-as-folder', label: 'Save As Folder…', target: 'native' },
    { id: 'save-to-storage', label: 'Save to Storage…' },
    { id: 'duplicate-file', label: 'Duplicate' },
    { id: 'save-to-version-history', label: 'Save to Version History…', shortcut: 'MOD+ALT+S' },
    { id: 'revert-to-saved', label: 'Revert to Saved' },
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
    { id: 'export-frames-pdf', label: 'Export Frames to PDF…', palette: { icon: 'download' } },
    // Figma's File › Color profile: assigning keeps the numbers, converting keeps the look.
    {
      id: 'color-profile',
      label: 'Color Profile',
      sub: [
        { id: 'color-profile-srgb', label: 'sRGB', checkbox: true },
        { id: 'color-profile-p3', label: 'Display P3', checkbox: true },
        { type: 'separator' },
        { id: 'color-profile-convert-srgb', label: 'Convert Colors to sRGB' },
        { id: 'color-profile-convert-p3', label: 'Convert Colors to Display P3' }
      ]
    },
    { type: 'separator' },
    { id: 'autosave', label: 'Autosave', checkbox: true },
    { id: 'close', label: 'Close Tab', shortcut: 'MOD+W' }
  ]
} satisfies AppMenuGroupSchema
