import { useLocalStorage } from '@vueuse/core'

import { DEFAULT_SNAPPING_PREFERENCES, type SnappingPreferences } from '@open-pencil/core/editor'

export interface AppPreferences {
  version: 1
  editing: {
    snapping: SnappingPreferences
  }
}

export const DEFAULT_APP_PREFERENCES: Readonly<AppPreferences> = {
  version: 1,
  editing: {
    snapping: { ...DEFAULT_SNAPPING_PREFERENCES }
  }
}

const STORAGE_KEY = 'open-pencil:preferences:v1'

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

interface StoredSnappingPreferences {
  geometry?: unknown
  objects?: unknown
  pixelGrid?: unknown
}

interface StoredEditingPreferences {
  snapping?: StoredSnappingPreferences
}

interface StoredAppPreferences {
  editing?: StoredEditingPreferences
}

function isStoredAppPreferences(value: unknown): value is StoredAppPreferences {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizePreferences(value: unknown): AppPreferences {
  const snapping = isStoredAppPreferences(value) ? value.editing?.snapping : undefined

  return {
    version: 1,
    editing: {
      snapping: {
        geometry: booleanOrDefault(
          snapping?.geometry,
          DEFAULT_APP_PREFERENCES.editing.snapping.geometry
        ),
        objects: booleanOrDefault(
          snapping?.objects,
          DEFAULT_APP_PREFERENCES.editing.snapping.objects
        ),
        pixelGrid: booleanOrDefault(
          snapping?.pixelGrid,
          DEFAULT_APP_PREFERENCES.editing.snapping.pixelGrid
        )
      }
    }
  }
}

export const appPreferences = useLocalStorage<AppPreferences>(
  STORAGE_KEY,
  structuredClone(DEFAULT_APP_PREFERENCES),
  { mergeDefaults: (storageValue) => normalizePreferences(storageValue) }
)

export function updateSnappingPreferences(changes: Partial<SnappingPreferences>): void {
  appPreferences.value = {
    ...appPreferences.value,
    editing: {
      ...appPreferences.value.editing,
      snapping: {
        ...appPreferences.value.editing.snapping,
        ...changes
      }
    }
  }
}
