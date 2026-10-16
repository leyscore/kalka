export interface UndoEntry {
  label: string
  forward: () => void
  inverse: () => void
  coalesceKey?: string
}

export interface UndoManagerOptions {
  limit?: number
  /** Called after recording, undoing, redoing, or clearing committed history. */
  onChange?: () => void
  /** Completes an entry as it is recorded, such as with what the edit changed beside it. */
  onRecord?: (entry: UndoEntry) => UndoEntry
}

interface UndoBatch {
  label: string
  entries: UndoEntry[]
  coalesceKey?: string
}

const DEFAULT_HISTORY_LIMIT = 200

export class UndoManager {
  private undoStack: UndoEntry[] = []
  private redoStack: UndoEntry[] = []
  private batches: UndoBatch[] = []
  private readonly limit: number
  private readonly onChange: (() => void) | undefined
  private readonly onRecord: ((entry: UndoEntry) => UndoEntry) | undefined
  private replaying = 0

  constructor(options: UndoManagerOptions = {}) {
    this.limit = options.limit ?? DEFAULT_HISTORY_LIMIT
    this.onChange = options.onChange
    this.onRecord = options.onRecord
  }

  apply(entry: UndoEntry): void {
    this.execute(entry)
  }

  execute(entry: UndoEntry): void {
    entry.forward()
    this.record(entry)
  }

  push(entry: UndoEntry): void {
    this.record(entry)
  }

  record(recorded: UndoEntry): void {
    const entry = this.onRecord?.(recorded) ?? recorded
    const batch = this.currentBatch
    if (batch) {
      batch.entries.push(entry)
      return
    }
    this.pushUndoEntry(entry)
  }

  /** Whether an undo or redo is replaying an entry now. */
  get isReplaying(): boolean {
    return this.replaying > 0
  }

  private replay(run: () => void): void {
    this.replaying++
    try {
      run()
    } finally {
      this.replaying--
    }
  }

  undo(): string | null {
    const entry = this.undoStack.pop()
    if (!entry) return null
    this.replay(() => entry.inverse())
    this.redoStack.push(entry)
    this.onChange?.()
    return entry.label
  }

  redo(): string | null {
    const entry = this.redoStack.pop()
    if (!entry) return null
    this.replay(() => entry.forward())
    this.undoStack.push(entry)
    this.onChange?.()
    return entry.label
  }

  beginBatch(label: string, coalesceKey?: string): void {
    this.batches.push({ label, entries: [], coalesceKey })
  }

  commitBatch(): void {
    const batch = this.batches.pop()
    if (!batch || batch.entries.length === 0) return

    const entry = this.createBatchEntry(batch)
    const parentBatch = this.currentBatch
    if (parentBatch) parentBatch.entries.push(entry)
    else this.pushUndoEntry(entry)
  }

  runBatch<T>(label: string, fn: () => T, coalesceKey?: string): T {
    this.beginBatch(label, coalesceKey)
    try {
      const result = fn()
      this.commitBatch()
      return result
    } catch (error) {
      this.rollbackBatch()
      throw error
    }
  }

  rollbackBatch(): void {
    const batch = this.batches.pop()
    if (!batch) return
    for (const entry of batch.entries.toReversed()) entry.inverse()
  }

  /** Abandon provisional history without replaying it or changing committed undo/redo entries. */
  discardBatches(): void {
    this.batches = []
  }

  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.discardBatches()
    this.onChange?.()
  }

  get isBatching(): boolean {
    return this.batches.length > 0
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * The entry `depth` steps below the top of the undo stack, so a caller that pushed entries
   * can tell whether they are still the most recent ones.
   */
  peekUndo(depth = 0): UndoEntry | undefined {
    return this.undoStack.at(-1 - depth)
  }

  /**
   * Joins the top undo entry into the one below it, so one Undo reverts both and one Redo
   * reapplies both in order, such as creating a text layer and typing its first text.
   */
  mergeWithPrevious(label?: string): void {
    const last = this.undoStack.at(-1)
    const previous = this.undoStack.at(-2)
    if (!last || !previous) return
    this.undoStack.splice(-2, 2, {
      label: label ?? previous.label,
      forward: () => {
        previous.forward()
        last.forward()
      },
      inverse: () => {
        last.inverse()
        previous.inverse()
      }
    })
    this.onChange?.()
  }

  /** The entry `depth` steps below the top of the redo stack, the next one Redo applies at 0. */
  peekRedo(depth = 0): UndoEntry | undefined {
    return this.redoStack.at(-1 - depth)
  }

  get undoLabel(): string | null {
    return this.undoStack.at(-1)?.label ?? null
  }

  get redoLabel(): string | null {
    return this.redoStack.at(-1)?.label ?? null
  }

  private get currentBatch(): UndoBatch | null {
    return this.batches.at(-1) ?? null
  }

  private createBatchEntry(batch: UndoBatch): UndoEntry {
    return {
      label: batch.label,
      forward: () => batch.entries.forEach((entry) => entry.forward()),
      inverse: () => batch.entries.toReversed().forEach((entry) => entry.inverse()),
      coalesceKey: batch.coalesceKey
    }
  }

  private pushUndoEntry(entry: UndoEntry): void {
    const previous = this.undoStack.at(-1)
    if (entry.coalesceKey && previous?.coalesceKey === entry.coalesceKey) {
      this.undoStack[this.undoStack.length - 1] = {
        ...entry,
        inverse: previous.inverse
      }
    } else {
      this.undoStack.push(entry)
    }
    this.redoStack = []
    this.trimUndoStack()
    this.onChange?.()
  }

  private trimUndoStack(): void {
    if (!Number.isFinite(this.limit) || this.limit <= 0) return
    const overflow = this.undoStack.length - this.limit
    if (overflow > 0) this.undoStack.splice(0, overflow)
  }
}
