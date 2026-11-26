import { shallowRef } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'
import {
  diffDocument,
  documentMerge,
  type DocumentChanges,
  type LayerChange,
  type LayerPropertyGroup,
  type VariableChange
} from '@kalka/scene-graph/diff'

/**
 * Compare changes, as Figma shows it for versions and before a branch merge: the layers,
 * components, styles and variables two states of a document differ by, each with the properties
 * that changed, a layer shown side by side or overlaid. A merge or an update from main shows the
 * same list with a choice per change, and per property family within a changed layer.
 */

/** Bringing chosen changes in: what the merge does with the changes left ticked. */
export interface ComparisonMerge {
  /** `merge` into the main file, or `update` a branch from it. */
  kind: 'merge' | 'update'
  /** IDs of layers and variables the other side changed too: taking one replaces that. */
  conflicts: ReadonlySet<string>
  /** For a layer both sides changed, the property families both changed. */
  conflictGroups: ReadonlyMap<string, ReadonlySet<LayerPropertyGroup>>
  /** Names the side whose own changes a conflict would replace. */
  otherSide: string
  /** Brings these changes in; resolves with the IDs it could not place. */
  apply: (changes: DocumentChanges) => Promise<string[]>
}

export interface DocumentComparison {
  /** What the earlier and the later states are, as the dialog names them. */
  beforeLabel: string
  afterLabel: string
  before: SceneGraph
  after: SceneGraph
  changes: LayerChange[]
  variables: VariableChange[]
  /** Whether the later state is the document on screen, so a layer can be shown there. */
  afterIsOpen: boolean
  merge: ComparisonMerge | null
}

/** The comparison on screen, or null. */
export const openComparison = shallowRef<DocumentComparison | null>(null)

/** Shows what changed between `before` and `after`. */
export function compareStates(
  options: Omit<DocumentComparison, 'changes' | 'variables' | 'merge'> & { merge?: null }
): void {
  const { layers, variables } = diffDocument(options.before, options.after)
  openComparison.value = { ...options, changes: layers, variables, merge: null }
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
  merge: Omit<ComparisonMerge, 'conflicts' | 'conflictGroups'>
}): void {
  const { changes, conflicts, conflictGroups } = documentMerge(
    options.base,
    options.target,
    options.incoming
  )
  openComparison.value = {
    beforeLabel: options.targetLabel,
    afterLabel: options.incomingLabel,
    before: options.target,
    after: options.incoming,
    changes: changes.layers,
    variables: changes.variables,
    afterIsOpen: options.afterIsOpen,
    merge: { ...options.merge, conflicts, conflictGroups }
  }
}

export function closeComparison(): void {
  openComparison.value = null
}
