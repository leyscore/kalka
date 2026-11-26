import { groupBy } from 'es-toolkit'

import { getNodeEditCapability } from '#core/editor/capabilities'
import type { createNodeActions } from '#core/editor/nodes'
import type { EditorContext } from '#core/editor/types'

import { replacedText, type ReplaceMatchOptions } from './replace'
import { findInPages, type FindMatch, type FindOptions } from './search'

export {
  DEFAULT_FIND_OPTIONS,
  FIND_LAYER_KINDS,
  findInPages,
  findLayerKind,
  findRanges,
  type FindLayerKind,
  type FindMatch,
  type FindOptions
} from './search'
export { replacedText, type ReplaceMatchOptions } from './replace'

type NodeActions = ReturnType<typeof createNodeActions>

/** Find and replace: where the words are, and replacing them in text layers. */
export function createFindActions(ctx: EditorContext, nodes: NodeActions) {
  /** Matches on the given pages, or on every page of the document. */
  function findInDocument(options: FindOptions, pageIds?: readonly string[]): FindMatch[] {
    const pages = pageIds ?? ctx.graph.getPages().map((page) => page.id)
    return findInPages(ctx.graph, pages, options)
  }

  /**
   * Replaces the text matches with `replacement`, all of them one undo step. Matches in names,
   * in library components that cannot be edited here, or no longer in the text are skipped.
   * Returns how many were replaced.
   */
  function replaceTextMatches(
    matches: readonly Pick<FindMatch, 'nodeId' | 'field' | 'start' | 'end'>[],
    replacement: string,
    options: ReplaceMatchOptions
  ): number {
    const byNode = groupBy(
      matches.filter((match) => match.field === 'text'),
      (match) => match.nodeId
    )
    let replaced = 0
    ctx.undo.runBatch('Replace text', () => {
      for (const [nodeId, nodeMatches] of Object.entries(byNode)) {
        const node = ctx.graph.getNode(nodeId)
        if (node?.type !== 'TEXT' || !getNodeEditCapability(ctx.graph, nodeId).editable) continue
        const ranges = nodeMatches.map((match) => [match.start, match.end] as const)
        const next = replacedText(node, ranges, replacement, options)
        if (!next) continue
        replaced += next.count
        nodes.updateNodeWithUndo(
          nodeId,
          { text: next.text, styleRuns: next.styleRuns },
          'Replace text'
        )
      }
    })
    if (replaced > 0) ctx.requestRender()
    return replaced
  }

  return { findInDocument, replaceTextMatches }
}
