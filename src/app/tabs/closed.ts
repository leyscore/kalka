import { draftsPersist } from '@/app/document/recovery/drafts'
import { isRecoveryKeptElsewhere } from '@/app/document/recovery/kept-elsewhere'
import type { EditorStore } from '@/app/editor/session'

/**
 * The documents closed in this window, the last first, for Reopen closed tab: a draft recovery
 * keeps, or a file to read again. A document with nothing to reopen from is not listed.
 */
export type ClosedTab =
  | { kind: 'draft'; snapshotId: string }
  | { kind: 'file'; path: string | null; handle: FileSystemFileHandle | null }

/** How many closed tabs Reopen walks back through, as a browser keeps a short history. */
const CLOSED_TAB_LIMIT = 20

const closedTabs: ClosedTab[] = []

export function rememberClosedTab(tab: ClosedTab): void {
  closedTabs.push(tab)
  if (closedTabs.length > CLOSED_TAB_LIMIT) closedTabs.shift()
}

export function takeClosedTab(): ClosedTab | undefined {
  return closedTabs.pop()
}

/** A document with nowhere to save it but recovery, which keeps it across reloads. */
export function isKeptDraft(store: EditorStore): boolean {
  return (
    draftsPersist.value &&
    store.hasUnsavedChanges() &&
    !store.hasWritableSource() &&
    !isRecoveryKeptElsewhere(store.state)
  )
}

/** What Reopen closed tab brings back of a document being closed: its draft, or its file. */
export function reopenableDocument(store: EditorStore, discarded: boolean): ClosedTab | null {
  const { path, handle } = store.getSourceIdentity()
  if (path || handle) return { kind: 'file', path, handle }
  if (discarded || !draftsPersist.value || isRecoveryKeptElsewhere(store.state)) return null
  return { kind: 'draft', snapshotId: store.getRecoveryId() }
}
