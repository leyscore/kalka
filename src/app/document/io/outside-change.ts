/** What a change made to the document's file by another app does. */
export interface OutsideChangeOptions {
  hasUnsavedChanges: () => boolean
  reload: () => void
  /** Says the file changed while edits here are unsaved, offering to reload it anyway. */
  warn: (reload: () => void) => void
}

/**
 * Reloads the document when another app changes its file, such as git, an agent or a sync
 * tool. With unsaved edits here it keeps them and asks instead: reloading would drop them and
 * the undo history with them.
 */
export function createOutsideChangeHandler({
  hasUnsavedChanges,
  reload,
  warn
}: OutsideChangeOptions): () => void {
  return () => {
    if (hasUnsavedChanges()) warn(reload)
    else reload()
  }
}
