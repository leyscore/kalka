import { watchDebounced } from '@vueuse/core'

type AutosaveOptions = {
  state: { autosaveEnabled: boolean }
  /** The document's content revision; rendering and layout do not advance it. */
  version: () => number
  getSavedVersion: () => number
  hasWritableSource: () => boolean
  saveCurrentDocument: (version: number) => Promise<void>
  /** Told when autosave starts failing, once until a save succeeds again. */
  onFailure?: (error: unknown) => void
}

export function createAutosave({
  state,
  version: currentVersion,
  getSavedVersion,
  hasWritableSource,
  saveCurrentDocument,
  onFailure
}: AutosaveOptions) {
  let requestedVersion: number | null = null
  let failing = false
  let saving: Promise<void> | null = null
  let disposed = false

  function canSave(version: number) {
    return version > getSavedVersion() && state.autosaveEnabled && hasWritableSource()
  }

  async function runSaves() {
    while (requestedVersion !== null) {
      if (disposed) return
      const version = requestedVersion
      requestedVersion = null
      if (!canSave(version)) continue
      try {
        await saveCurrentDocument(version)
        failing = false
      } catch (error) {
        const reported = failing
        failing = true
        if (!reported) onFailure?.(error)
        throw error
      }
    }
  }

  function reportFailure(error: unknown) {
    console.warn('Autosave failed:', error)
  }

  function requestSave(version: number): Promise<void> {
    if (disposed || !canSave(version)) return Promise.resolve()
    requestedVersion = Math.max(requestedVersion ?? version, version)
    if (!saving) {
      saving = runSaves().finally(() => {
        saving = null
        if (!disposed && requestedVersion !== null) {
          void requestSave(requestedVersion).catch(reportFailure)
        }
      })
    }
    return saving
  }

  const stop = watchDebounced(
    currentVersion,
    (version) => {
      void requestSave(version).catch(reportFailure)
    },
    { debounce: 3000 }
  )

  return {
    requestSave,
    /** Whether the last autosave failed, so the file no longer holds the latest changes. */
    isFailing: () => failing,
    disposeAutosave() {
      disposed = true
      requestedVersion = null
      stop()
    }
  }
}
