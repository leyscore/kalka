import type { AppMenuGroupSchema } from '@/app/shell/menu/schema'

/** Expands to each editor window's documents, in the native menu and in the app's own. */
export const WINDOW_LIST_MENU_ID = 'window-list'
export const MOVE_TAB_TO_NEW_WINDOW_MENU_ID = 'move-tab-to-new-window'

/**
 * The desktop app's Window menu, as on any Mac app: the system's own window items, then the open
 * editor windows with their documents; choosing one brings its window forward on that tab.
 */
export const WINDOW_MENU = {
  label: 'Window',
  target: 'desktop',
  items: [
    { id: 'window-minimize', label: 'Minimize', target: 'native' },
    { id: 'window-zoom', label: 'Zoom', target: 'native' },
    { type: 'separator', target: 'native' },
    { id: MOVE_TAB_TO_NEW_WINDOW_MENU_ID, label: 'Move Tab to New Window' },
    { type: 'separator' },
    { id: WINDOW_LIST_MENU_ID, label: 'Windows' },
    { type: 'separator', target: 'native' },
    { id: 'window-front', label: 'Bring All to Front', target: 'native' }
  ]
} satisfies AppMenuGroupSchema
