/**
 * Editor windows, by label: the first is `main`, as under Tauri, and File › New Window opens
 * `editor-2`, `editor-3`… The page names them by the same rule (`src/app/shell/editor-windows.ts`).
 * Other windows, such as Software Update, hold no documents.
 */
export const FIRST_EDITOR_LABEL = 'main'
const EDITOR_PREFIX = 'editor-'

export function isEditorLabel(label: string | undefined): boolean {
  return label === FIRST_EDITOR_LABEL || (label?.startsWith(EDITOR_PREFIX) ?? false)
}

/** The label for a new editor window: `main` while it is free, then the lowest free number. */
export function nextEditorLabel(taken: (label: string) => boolean): string {
  if (!taken(FIRST_EDITOR_LABEL)) return FIRST_EDITOR_LABEL
  let number = 2
  while (taken(`${EDITOR_PREFIX}${number}`)) number++
  return `${EDITOR_PREFIX}${number}`
}

/**
 * The editor windows, most recently focused first. The one in front gets menu commands, files
 * from the Finder and the MCP server's calls; it stays in front for them while another app is,
 * since agents work while the person looks at their terminal.
 */
export function createFocusOrder<W>() {
  let order: W[] = []
  return {
    focus(window: W): boolean {
      const changed = order[0] !== window
      order = [window, ...order.filter((known) => known !== window)]
      return changed
    },
    remove(window: W): void {
      order = order.filter((known) => known !== window)
    },
    latest(alive: (window: W) => boolean): W | null {
      return order.find(alive) ?? null
    },
    all(alive: (window: W) => boolean): W[] {
      return order.filter(alive)
    }
  }
}

export interface QuitHost<W> {
  /** The editor windows that ask about unsaved work, in the order they are asked. */
  editors(): W[]
  /** Brings the window forward and asks its page; the answer comes back as `agree` or `decline`. */
  ask(window: W): void
  /** Every window agreed: the app quits. */
  finish(): void
  /** The quit was called off: windows that already agreed may ask again on their next close. */
  cancelled(agreed: W[]): void
}

/**
 * Quitting asks each editor window with documents in turn, as Figma does, and stops at the first
 * that keeps its work. A page agrees by asking to exit, which ends the app only once every window
 * agreed.
 */
export function createQuitSequence<W>(host: QuitHost<W>) {
  let queue: W[] | null = null
  let current: W | null = null
  let agreed: W[] = []

  function next(): void {
    if (!queue) return
    current = queue.shift() ?? null
    if (current) {
      host.ask(current)
      return
    }
    queue = null
    agreed = []
    host.finish()
  }

  return {
    isRunning: () => queue !== null,
    /** Starts over, from the first window; `already` agreed before asking the others. */
    start(already?: W): void {
      agreed = already === undefined ? [] : [already]
      queue = host.editors().filter((window) => window !== already)
      current = null
      next()
    },
    /** False when no quit is under way, so the page's exit is a quit of its own. */
    agree(window: W): boolean {
      if (!queue) return false
      if (!agreed.includes(window)) agreed.push(window)
      queue = queue.filter((waiting) => waiting !== window)
      if (window === current) next()
      return true
    },
    decline(): void {
      if (!queue) return
      const answered = agreed
      queue = null
      current = null
      agreed = []
      host.cancelled(answered)
    },
    /** A window closed meanwhile; it asked about its own documents as it closed. */
    gone(window: W): void {
      if (!queue) return
      agreed = agreed.filter((known) => known !== window)
      queue = queue.filter((waiting) => waiting !== window)
      if (window === current) next()
    }
  }
}
