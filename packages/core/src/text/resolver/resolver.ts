import type {
  FontResolutionDemand,
  FontResolutionLoader,
  FontResolutionSettled,
  FontResolutionSnapshot
} from '#core/text/resolver/types'

interface FontResolutionEntry {
  demand: FontResolutionDemand
  snapshot: FontResolutionSnapshot
  promise: Promise<FontResolutionSnapshot>
  callbacks: Set<FontResolutionSettled>
}

function idleSnapshot(key: string): FontResolutionSnapshot {
  return { key, state: 'idle' }
}

export class FontResolver {
  private readonly entries = new Map<string, FontResolutionEntry>()

  constructor(private readonly load: FontResolutionLoader) {}

  state(demand: FontResolutionDemand | string): FontResolutionSnapshot {
    const key = typeof demand === 'string' ? demand : demand.key
    return this.entries.get(key)?.snapshot ?? idleSnapshot(key)
  }

  demand(
    demand: FontResolutionDemand,
    onSettled?: FontResolutionSettled
  ): Promise<FontResolutionSnapshot> {
    const current = this.entries.get(demand.key)
    if (current) {
      if (current.snapshot.state === 'loading' && onSettled) current.callbacks.add(onSettled)
      return current.promise
    }

    const callbacks = new Set<FontResolutionSettled>()
    if (onSettled) callbacks.add(onSettled)

    const snapshot: FontResolutionSnapshot = { key: demand.key, state: 'loading' }
    const entry: FontResolutionEntry = {
      demand,
      snapshot,
      callbacks,
      promise: Promise.resolve(snapshot)
    }
    this.entries.set(demand.key, entry)
    entry.promise = this.resolve(entry)
    return entry.promise
  }

  retry(
    demand: FontResolutionDemand,
    onSettled?: FontResolutionSettled
  ): Promise<FontResolutionSnapshot> {
    if (this.state(demand).state !== 'failed') return this.demand(demand, onSettled)
    this.entries.delete(demand.key)
    return this.demand(demand, onSettled)
  }

  exhaust(demand: FontResolutionDemand): FontResolutionSnapshot {
    const current = this.entries.get(demand.key)
    if (current?.snapshot.state === 'loading') return current.snapshot
    const snapshot: FontResolutionSnapshot = { key: demand.key, state: 'exhausted' }
    if (current) {
      current.snapshot = snapshot
      current.promise = Promise.resolve(snapshot)
      return snapshot
    }
    const entry: FontResolutionEntry = {
      demand,
      snapshot,
      promise: Promise.resolve(snapshot),
      callbacks: new Set()
    }
    this.entries.set(demand.key, entry)
    return snapshot
  }

  reset(demand?: FontResolutionDemand | string): void {
    if (demand === undefined) {
      this.entries.clear()
      return
    }
    this.entries.delete(typeof demand === 'string' ? demand : demand.key)
  }

  private async resolve(entry: FontResolutionEntry): Promise<FontResolutionSnapshot> {
    for (const candidate of entry.demand.candidates) {
      if (this.entries.get(entry.demand.key) !== entry) return idleSnapshot(entry.demand.key)
      entry.snapshot = { key: entry.demand.key, state: 'loading', candidate }
      try {
        if (await this.load(candidate, entry.demand)) {
          return this.settle(entry, {
            key: entry.demand.key,
            state: 'loaded',
            candidate,
            source: candidate.source
          })
        }
      } catch (error) {
        return this.settle(entry, {
          key: entry.demand.key,
          state: 'failed',
          candidate,
          source: candidate.source,
          error
        })
      }
    }

    return this.settle(entry, { key: entry.demand.key, state: 'exhausted' })
  }

  private settle(
    entry: FontResolutionEntry,
    snapshot: FontResolutionSnapshot
  ): FontResolutionSnapshot {
    if (this.entries.get(entry.demand.key) !== entry) return idleSnapshot(entry.demand.key)
    entry.snapshot = snapshot
    for (const callback of entry.callbacks) {
      try {
        callback(snapshot)
      } catch (error) {
        console.error('Font resolution callback failed:', error)
      }
    }
    entry.callbacks.clear()
    return snapshot
  }
}
