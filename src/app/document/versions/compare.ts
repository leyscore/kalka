import { shallowRef } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'
import { diffLayers, layerMerge, type LayerChange } from '@kalka/scene-graph/diff'

/**
 * Compare changes, as Figma shows it for versions and before a branch merge: the layers two
 * states of a document differ by, each with the properties that changed, shown side by side or
 * overlaid. A merge or an update from main shows the same list with a choice per layer.
 */

/** Bringing chosen changes in: what the merge does with the changes left ticked. */
export interface ComparisonMerge {
  /** `merge` into the main file, or `update` a branch from it. */
  kind: 'merge' | 'update'
  /** IDs of changed layers the other side changed too: taking one replaces that. */
  conflicts: ReadonlySet<string>
  /** Names the side whose own changes a conflict would replace. */
  otherSide: string
  /** Brings these changes in; resolves with the IDs it could not place. */
  apply: (changes: LayerChange[]) => Promise<string[]>
}

export interface DocumentComparison {
  /** What the earlier and the later states are, as the dialog names them. */
  beforeLabel: string
  afterLabel: string
  before: SceneGraph
  after: SceneGraph
  changes: LayerChange[]
  /** Whether the later state is the document on screen, so a layer can be shown there. */
  afterIsOpen: boolean
  merge: ComparisonMerge | null
}

/** The comparison on screen, or null. */
export const openComparison = shallowRef<DocumentComparison | null>(null)

/** Shows what changed between `before` and `after`. */
export function compareStates(
  options: Omit<DocumentComparison, 'changes' | 'merge'> & { merge?: null }
): void {
  openComparison.value = {
    ...options,
    changes: diffLayers(options.before, options.after),
    merge: null
  }
}

/**
 * Shows what `incoming` changed since `base`, to bring chosen changes into `target`; the
 * comparison's earlier state is the target and its later one the incoming state.
 */
export function compareForMerge(options: {
  base: SceneGraph | null
  target: SceneGraph
  incoming: SceneGraph
  targetLabel: string
  incomingLabel: string
  afterIsOpen: boolean
  merge: Omit<ComparisonMerge, 'conflicts'>
}): void {
  const { changes, conflicts } = layerMerge(options.base, options.target, options.incoming)
  openComparison.value = {
    beforeLabel: options.targetLabel,
    afterLabel: options.incomingLabel,
    before: options.target,
    after: options.incoming,
    changes,
    afterIsOpen: options.afterIsOpen,
    merge: { ...options.merge, conflicts }
  }
}

export function closeComparison(): void {
  openComparison.value = null
}
