import * as v from 'valibot'

/**
 * What the Window menu lists: each editor window's documents, as its page reports them
 * (`src/app/shell/editor-windows/list.ts`). Pure, so the menu and its tests share it.
 */
export const WindowDocuments = v.pipe(
  v.array(
    v.object({
      id: v.pipe(v.string(), v.maxLength(64)),
      name: v.pipe(v.string(), v.maxLength(512)),
      active: v.boolean()
    })
  ),
  v.maxLength(200)
)
export type WindowDocument = v.InferOutput<typeof WindowDocuments>[number]

export interface EditorWindowSummary {
  label: string
  /** The editor window in front, or the one last in front. */
  front: boolean
  documents: WindowDocument[]
}

/** A document of the Window menu: checked for the one in front, as macOS checks its window. */
export interface WindowListItem {
  label: string
  windowLabel: string
  documentId: string
  checked: boolean
}

/** Editor labels in the order the windows opened: `main`, then `editor-2`, `editor-3`… */
function labelRank(label: string): number {
  if (label === 'main') return 1
  const number = Number(label.slice(label.lastIndexOf('-') + 1))
  return Number.isInteger(number) ? number : Number.MAX_SAFE_INTEGER
}

export function sortEditorWindows<T extends { label: string }>(windows: readonly T[]): T[] {
  return [...windows].sort((a, b) => labelRank(a.label) - labelRank(b.label))
}

/**
 * The Window menu's list, one group per editor window, in the order they opened. A window that
 * reported nothing yet, or only the dashboard, still shows under `fallbackName`.
 */
export function windowListGroups(
  windows: readonly EditorWindowSummary[],
  fallbackName: string
): WindowListItem[][] {
  return sortEditorWindows(windows).map((window) => {
    const documents =
      window.documents.length > 0
        ? window.documents
        : [{ id: '', name: fallbackName, active: true }]
    return documents.map((document) => ({
      label: document.name || fallbackName,
      windowLabel: window.label,
      documentId: document.id,
      checked: window.front && document.active
    }))
  })
}

/**
 * Check items belong to the window they describe, such as Rulers or Autosave: each page reports
 * its own, and the native menu shows those of the editor in front.
 */
export function createWindowChecks<W extends object>() {
  const byWindow = new WeakMap<W, Map<string, boolean>>()
  function of(window: W): Map<string, boolean> {
    let checks = byWindow.get(window)
    if (!checks) {
      checks = new Map()
      byWindow.set(window, checks)
    }
    return checks
  }
  return {
    set(window: W, id: string, checked: boolean): void {
      of(window).set(id, checked)
    },
    get(window: W | null, id: string): boolean | undefined {
      return window ? byWindow.get(window)?.get(id) : undefined
    }
  }
}

/** A tab on its way to another window: its file, or a recovery snapshot holding it. */
export const TabMove = v.variant('kind', [
  v.object({ kind: v.literal('path'), path: v.pipe(v.string(), v.minLength(1)) }),
  v.object({ kind: v.literal('snapshot'), id: v.pipe(v.string(), v.minLength(1)) })
])
export type TabMove = v.InferOutput<typeof TabMove>

/** Tabs waiting for the window they move to, which takes them once its page listens. */
export function createTabMoves<W extends object>() {
  const waiting = new WeakMap<W, TabMove[]>()
  return {
    queue(window: W, move: TabMove): void {
      waiting.set(window, [...(waiting.get(window) ?? []), move])
    },
    take(window: W): TabMove[] {
      const taken = waiting.get(window) ?? []
      waiting.delete(window)
      return taken
    }
  }
}
