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
