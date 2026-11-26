import type { SnappingPreferences } from '@kalka/core/editor'

import type { EditorStore } from '@/app/editor/active-store'
import { defaultPropertiesToCSS } from '@/app/editor/selection/default-properties'
import { getTabsSnapshot } from '@/app/tabs'

import { syncNativeDesignIssuesMenu, syncNativeSnappingMenu } from './native-menu'
import {
  appPreferences,
  updateDesignCheckPreferences,
  updateEditingPreferences,
  updateSnappingPreferences,
  type DesignCheckPreset
} from './store'

export function setSnappingPreference(
  preference: keyof SnappingPreferences,
  enabled: boolean
): void {
  applySnappingPreferences({ [preference]: enabled })
}

/** Stores snapping changes and pushes them to every open editor and the native menu. */
export function applySnappingPreferences(changes: Partial<SnappingPreferences>): void {
  updateSnappingPreferences(changes)
  const snapping = appPreferences.value.editing.snapping
  for (const tab of getTabsSnapshot()) {
    tab.store.state.snappingPreferences = { ...snapping }
  }
  void syncNativeSnappingMenu(snapping).catch((error: unknown) => {
    console.error('[Settings] Failed to synchronize native snapping preferences:', error)
  })
}

/** Stores an editing preference and gives it to every open editor. */
export function setEditingPreference(
  preference: 'keepToolSelected' | 'renameDuplicates',
  enabled: boolean
): void {
  updateEditingPreferences({ [preference]: enabled })
  for (const tab of getTabsSnapshot()) tab.store.state[preference] = enabled
}

/**
 * Figma's Set default properties: new shapes, or new texts, take the selected layer's look, in
 * every open file and the next time the app opens, as Figma keeps them.
 */
export function setDefaultProperties(store: EditorStore): boolean {
  if (!store.setDefaultPropertiesFromSelection()) return false
  const defaults = store.state.defaultLayerProperties
  if (!defaults) return false
  updateEditingPreferences({ defaultProperties: defaultPropertiesToCSS(defaults) })
  for (const tab of getTabsSnapshot())
    if (tab.store !== store) tab.store.state.defaultLayerProperties = structuredClone(defaults)
  return true
}

export function setDesignIssuesOnCanvas(showOnCanvas: boolean): void {
  updateDesignCheckPreferences({ showOnCanvas })
  void syncNativeDesignIssuesMenu(showOnCanvas).catch((error: unknown) => {
    console.error('[Settings] Failed to synchronize the native design issues menu:', error)
  })
}

export function setDesignCheckPreset(preset: DesignCheckPreset): void {
  updateDesignCheckPreferences({ preset })
}

export function turnOffDesignCheckRule(ruleId: string): void {
  const disabledRules = new Set(appPreferences.value.designCheck.disabledRules)
  disabledRules.add(ruleId)
  updateDesignCheckPreferences({ disabledRules: [...disabledRules] })
}

export function turnOnDesignCheckRules(): void {
  updateDesignCheckPreferences({ disabledRules: [] })
}
