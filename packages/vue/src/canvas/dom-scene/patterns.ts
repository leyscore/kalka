import { patternSource, type SceneGraph, type SceneNode } from '@kalka/scene-graph'

/**
 * The layers each pattern source is repeated in. A pattern's tile draws its source and
 * everything inside it, so a change anywhere in a source redraws the layers it fills.
 */
export class PatternUsers {
  private readonly users = new Map<string, Set<string>>()

  /** Records the sources of the patterns a built layer fills with. */
  record(graph: SceneGraph, node: SceneNode): void {
    for (const fill of node.fills) {
      const source = fill.visible ? patternSource(graph, node, fill) : null
      if (!source) continue
      const users = this.users.get(source.id) ?? new Set<string>()
      users.add(node.id)
      this.users.set(source.id, users)
    }
  }

  /** The layers to redraw after `node` changed: those repeating it or a layer around it. */
  affectedBy(graph: SceneGraph, node: SceneNode): string[] {
    if (this.users.size === 0) return []
    const affected: string[] = []
    graph.closest(node.id, (ancestor) => {
      affected.push(...(this.users.get(ancestor.id) ?? []))
      return false
    })
    return affected
  }

  clear(): void {
    this.users.clear()
  }
}
