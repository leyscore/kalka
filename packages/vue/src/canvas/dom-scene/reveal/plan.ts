import { uniq } from 'es-toolkit/array'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** What one agent edit wrote to the document, as the canvas replays it. */
export interface AgentEdit {
  /** Layers the edit created. */
  created: readonly string[]
  /** Text layers whose characters the edit wrote, created or already there. */
  written: readonly string[]
}

/** At most this many layers animate per edit; the rest simply show, as edits always did. */
export const MAX_REVEALED_LAYERS = 24
/** Layers looked at to choose them, in the order the edit lists them. */
const MAX_CANDIDATES = MAX_REVEALED_LAYERS * 8
/** At most this many text layers type themselves out per edit. */
export const MAX_TYPED_TEXTS = 6
/** How long one layer takes to appear. */
export const REVEAL_DURATION_MS = 260
/** The pause between two layers starting to appear, in the order the document lists them. */
export const REVEAL_STAGGER_MS = 45
/** Every layer has started to appear by then, however many there are. */
export const MAX_REVEAL_DELAY_MS = 900
/** How long a character takes to type, and the bounds of one text layer's typing. */
export const TYPE_CHAR_MS = 22
export const MIN_TYPE_MS = 300
export const MAX_TYPE_MS = 1400

export type RevealKind = 'appear' | 'type'

/** One layer's part in replaying an edit: when it starts, after the edit, and for how long. */
export interface RevealStep {
  id: string
  kind: RevealKind
  delay: number
  duration: number
}

/** Child indices from the page down, so layers sort in the order the layers panel lists them. */
function treePath(graph: SceneGraph, node: SceneNode): number[] {
  const path: number[] = []
  let current = node
  while (current.parentId) {
    const parent = graph.getNode(current.parentId)
    if (!parent) break
    path.unshift(parent.childIds.indexOf(current.id))
    current = parent
  }
  return path
}

function compareTreePaths(a: readonly number[], b: readonly number[]): number {
  const length = Math.min(a.length, b.length)
  for (let index = 0; index < length; index++) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0)
    if (difference !== 0) return difference
  }
  return a.length - b.length
}

function typingDuration(node: SceneNode): number {
  return Math.min(MAX_TYPE_MS, Math.max(MIN_TYPE_MS, node.text.length * TYPE_CHAR_MS))
}

/**
 * How the canvas replays an edit: created layers appear one after another in document order,
 * and text the edit wrote types itself out. Purely visual, bounded per edit, and empty when
 * motion is reduced, so the edit then shows at once as before.
 */
export function planReveal(
  graph: SceneGraph,
  edit: AgentEdit,
  options: { reducedMotion: boolean }
): RevealStep[] {
  if (options.reducedMotion) return []
  const created = new Set(edit.created)
  const written = new Set(edit.written)
  // Callers list parents first; sorting looks at a bounded head so huge edits stay cheap.
  const nodes = uniq([...edit.created, ...edit.written])
    .slice(0, MAX_CANDIDATES)
    .map((id) => graph.getNode(id))
    .filter((node): node is SceneNode => !!node && node.visible && node.type !== 'CANVAS')
  const paths = new Map(nodes.map((node) => [node.id, treePath(graph, node)]))
  nodes.sort((a, b) => compareTreePaths(paths.get(a.id) ?? [], paths.get(b.id) ?? []))
  const steps: RevealStep[] = []
  let typed = 0
  for (const node of nodes.slice(0, MAX_REVEALED_LAYERS)) {
    const types =
      node.type === 'TEXT' &&
      node.text.length > 0 &&
      (written.has(node.id) || created.has(node.id)) &&
      typed < MAX_TYPED_TEXTS
    if (types) typed++
    // A layer that already existed and is not typed has nothing to reveal.
    if (!types && !created.has(node.id)) continue
    steps.push({
      id: node.id,
      kind: types ? 'type' : 'appear',
      delay: 0,
      duration: types ? typingDuration(node) : REVEAL_DURATION_MS
    })
  }
  const stagger =
    steps.length > 1 ? Math.min(REVEAL_STAGGER_MS, MAX_REVEAL_DELAY_MS / (steps.length - 1)) : 0
  return steps.map((step, index) => ({ ...step, delay: Math.round(index * stagger) }))
}
