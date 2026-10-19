import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** One graph edit, as a page index decides whether it is still valid. */
export type PageIndexChange =
  | { kind: 'structure' }
  | { kind: 'updated'; id: string; changes: Partial<SceneNode> }

export interface PageIndexOptions<T> {
  /** Walks the page and builds the index. */
  build: (graph: SceneGraph, pageId: string) => T
  /** Whether `change` could make `index` wrong; a structural edit always does unless said here. */
  affects?: (change: PageIndexChange, index: T, graph: SceneGraph) => boolean
}

/**
 * Something found by walking a page, such as its labelled frames, built again only once the
 * graph's edits could have changed it, rather than for every scene version. It listens to the
 * graph it was last read for, and to another graph once read for that one.
 */
export class PageIndex<T> {
  private graph: SceneGraph | null = null
  private pageId: string | null = null
  private index: T | null = null
  private unsubscribe: (() => void) | null = null

  constructor(private readonly options: PageIndexOptions<T>) {}

  get(graph: SceneGraph, pageId: string): T {
    if (graph !== this.graph) this.watch(graph)
    if (this.index === null || pageId !== this.pageId) {
      this.index = this.options.build(graph, pageId)
      this.pageId = pageId
    }
    return this.index
  }

  /** Builds the index again on the next read. */
  invalidate(): void {
    this.index = null
  }

  dispose(): void {
    this.unsubscribe?.()
    this.unsubscribe = null
    this.graph = null
    this.index = null
  }

  private watch(graph: SceneGraph): void {
    this.unsubscribe?.()
    this.graph = graph
    this.index = null
    const change = (event: PageIndexChange) => {
      if (this.index === null) return
      const affects = this.options.affects
      if (!affects || affects(event, this.index, graph)) this.index = null
    }
    const structure = () => change({ kind: 'structure' })
    this.unsubscribe = graph.onNodeEvents({
      created: structure,
      deleted: structure,
      reparented: structure,
      reordered: structure,
      updated: (id, changes) => change({ kind: 'updated', id, changes })
    })
  }
}
