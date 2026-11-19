import type { SnappingPreferences } from '@kalka/core/editor'

import { APP_MENU_SCHEMA, type AppMenuEntry } from '@/app/shell/menu/schema'

/** What the menu's check items show. */
export interface MenuCheckSource {
  state: {
    autosaveEnabled: boolean
    showRulers: boolean
    showPixelGrid?: boolean
    showRemoteCursors: boolean
    snappingPreferences: SnappingPreferences
  }
  theme: string
  designIssuesOnCanvas: boolean
  profilerVisible: boolean
}

/** Whether a check item of the app menu is checked; undefined for an item that is not one. */
export function appMenuChecked(id: string, source: MenuCheckSource): boolean | undefined {
  const { state } = source
  switch (id) {
    case 'autosave':
      return state.autosaveEnabled
    case 'profiler':
      return source.profilerVisible
    case 'view-rulers':
      return state.showRulers
    case 'view-pixel-grid':
      return state.showPixelGrid !== false
    case 'view-multiplayer-cursors':
      return state.showRemoteCursors
    case 'view-design-issues':
      return source.designIssuesOnCanvas
    case 'snap-geometry':
      return state.snappingPreferences.geometry
    case 'snap-objects':
      return state.snappingPreferences.objects
    case 'snap-pixel-grid':
      return state.snappingPreferences.pixelGrid
    case 'theme-light':
      return source.theme === 'light'
    case 'theme-dark':
      return source.theme === 'dark'
    case 'theme-auto':
      return source.theme === 'auto'
    default:
      return undefined
  }
}

function checkboxIds(entries: readonly AppMenuEntry[]): string[] {
  return entries.flatMap((entry) => {
    if (entry.type === 'separator') return []
    return [...(entry.checkbox ? [entry.id] : []), ...checkboxIds(entry.sub ?? [])]
  })
}

/** The app menu's check items, which the desktop app's native menu has too. */
export const MENU_CHECKBOX_IDS: readonly string[] = APP_MENU_SCHEMA.flatMap((group) =>
  checkboxIds(group.items)
)

/** Every check item's state, for the native menu to show. */
export function menuChecks(source: MenuCheckSource): Record<string, boolean> {
  return Object.fromEntries(
    MENU_CHECKBOX_IDS.map((id) => [id, appMenuChecked(id, source) ?? false])
  )
}

/** The items whose state differs from what the native menu was last told. */
export function changedChecks(
  next: Record<string, boolean>,
  shown: Record<string, boolean> | undefined
): [string, boolean][] {
  return Object.entries(next).filter(([id, checked]) => shown?.[id] !== checked)
}
